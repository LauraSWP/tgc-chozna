import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Seeded RNG for deterministic pack generation
class PackRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Linear congruential generator
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.seed / Math.pow(2, 32);
  }

  // Choose random element from array
  choice<T>(items: T[]): T {
    const index = Math.floor(this.next() * items.length);
    return items[index];
  }

  // Weighted random choice
  weightedChoice<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = this.next() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }

  // Generate integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { userId, setCode, quantity = 1 } = await req.json();
    
    if (!userId || !setCode) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros requeridos' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Abriendo ${quantity} sobre(s) para usuario ${userId}, set ${setCode}`);

    // 1. Get set information
    const { data: setData, error: setError } = await supabase
      .from('card_sets')
      .select('id, name')
      .eq('code', setCode)
      .single();

    if (setError || !setData) {
      return new Response(
        JSON.stringify({ error: 'Set no encontrado' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 2. Get pack configuration
    const { data: packConfig, error: configError } = await supabase
      .from('pack_configs')
      .select(`
        id,
        total_cards,
        price_coins,
        pack_slots (
          slot_index,
          pool,
          mythic_chance,
          foil_replaces
        )
      `)
      .eq('set_id', setData.id)
      .eq('is_active', true)
      .single();

    if (configError || !packConfig) {
      return new Response(
        JSON.stringify({ error: 'Configuración de sobre no encontrada' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 3. Check and update user currency
    const totalCost = packConfig.price_coins * quantity;
    
    const { data: userCurrency, error: currencyError } = await supabase
      .from('user_currencies')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (currencyError) {
      // Create user currency if it doesn't exist
      const { error: createError } = await supabase
        .from('user_currencies')
        .insert({
          user_id: userId,
          coins: 1000, // Starting coins
          gems: 0
        });
      
      if (createError) {
        return new Response(
          JSON.stringify({ error: 'Error al crear monedas de usuario' }),
          { status: 500, headers: corsHeaders }
        );
      }
      
      // Try again
      const { data: newCurrency } = await supabase
        .from('user_currencies')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!newCurrency || newCurrency.coins < totalCost) {
        return new Response(
          JSON.stringify({ error: 'Monedas insuficientes' }),
          { status: 400, headers: corsHeaders }
        );
      }
    } else if (!userCurrency || userCurrency.coins < totalCost) {
      return new Response(
        JSON.stringify({ error: 'Monedas insuficientes' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Update user currency
    const { error: updateError } = await supabase
      .from('user_currencies')
      .update({ 
        coins: (userCurrency?.coins || 1000) - totalCost 
      })
      .eq('user_id', userId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Error al actualizar monedas' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 4. Get card pools by rarity
    const { data: allCards, error: cardsError } = await supabase
      .from('card_definitions')
      .select(`
        *,
        rarities(code, display_name, color)
      `)
      .eq('set_id', setData.id)
      .eq('is_active', true);

    if (cardsError || !allCards) {
      return new Response(
        JSON.stringify({ error: 'Error al obtener cartas' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Group cards by rarity
    const pools: Record<string, any[]> = {
      common: [],
      uncommon: [],
      rare: [],
      mythic: [],
      land: [],
      token: []
    };

    allCards.forEach(card => {
      const rarity = card.rarities?.code || 'common';
      if (pools[rarity]) {
        pools[rarity].push(card);
      }
    });

    // 5. Generate packs
    const allNewCards: any[] = [];
    const openResults: any[] = [];

    for (let packIndex = 0; packIndex < quantity; packIndex++) {
      // Create deterministic seed for this pack
      let seed = 0;
      for (let i = 0; i < userId.length; i++) {
        seed = (seed * 31 + userId.charCodeAt(i)) % Math.pow(2, 32);
      }
      seed = (seed + Date.now() + packIndex * 1000) % Math.pow(2, 32);
      
      const rng = new PackRNG(seed);
      const packCards: any[] = [];
      const packFoils: boolean[] = [];

      // Sort slots by index
      const sortedSlots = packConfig.pack_slots.sort((a: any, b: any) => a.slot_index - b.slot_index);

      for (const slot of sortedSlots) {
        let { pool } = slot;
        const { mythic_chance = 0, foil_replaces = false } = slot;

        // Check for foil replacement (1% chance)
        let isFoil = false;
        if (foil_replaces && rng.next() < 0.01) {
          isFoil = true;
          // Foil can be any rarity - weighted selection
          const foilRarities = ['common', 'uncommon', 'rare', 'mythic'];
          const foilWeights = [50, 25, 15, 10];
          pool = rng.weightedChoice(foilRarities, foilWeights);
        }

        // Check for mythic upgrade in rare slots
        if (pool === 'rare' && mythic_chance > 0 && rng.next() < mythic_chance) {
          pool = 'mythic';
        }

        // Select card from pool
        const poolCards = pools[pool] || [];
        if (poolCards.length > 0) {
          const selectedCard = rng.choice(poolCards);
          packCards.push(selectedCard);
          packFoils.push(isFoil);
        } else {
          // Fallback to common if pool is empty
          const fallbackPool = pools['common'] || [];
          if (fallbackPool.length > 0) {
            const selectedCard = rng.choice(fallbackPool);
            packCards.push(selectedCard);
            packFoils.push(isFoil);
          }
        }
      }

      openResults.push({
        packIndex: packIndex + 1,
        cards: packCards,
        foils: packFoils
      });

      // Prepare cards for insertion into user collection
      allNewCards.push(...packCards.map((card: any, index: number) => ({
        owner: userId,
        card_def_id: card.id,
        foil: packFoils[index]
      })));
    }

    // 6. Insert new cards into user collection
    if (allNewCards.length > 0) {
      const { error: insertError } = await supabase
        .from('user_cards')
        .insert(allNewCards);

      if (insertError) {
        console.error('Error inserting cards:', insertError);
        // Rollback currency change
        await supabase
          .from('user_currencies')
          .update({ 
            coins: (userCurrency?.coins || 1000) 
          })
          .eq('user_id', userId);
        
        return new Response(
          JSON.stringify({ error: 'Error al añadir cartas a la colección' }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 7. Log transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'pack_open',
        amount_coins: -totalCost,
        amount_gems: 0,
        description: `Apertura de ${quantity} sobre(s) de ${setData.name}`
      });

    // 8. Return results
    const remainingCoins = (userCurrency?.coins || 1000) - totalCost;
    
    return new Response(
      JSON.stringify({
        success: true,
        packs: openResults,
        totalCards: allNewCards.length,
        coinsSpent: totalCost,
        remainingCoins: remainingCoins,
        setName: setData.name
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Pack opening error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});