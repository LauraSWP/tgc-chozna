// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Seedable RNG for reproducible pack opening
class PackRNG {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.seed / Math.pow(2, 32);
  }
  
  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
  
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
        JSON.stringify({ error: 'Missing required parameters' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Opening ${quantity} pack(s) for user ${userId}, set ${setCode}`);

    // 1. Get set information
    const { data: setData, error: setError } = await supabase
      .from('card_sets')
      .select('id, name')
      .eq('code', setCode)
      .single();

    if (setError || !setData) {
      return new Response(
        JSON.stringify({ error: 'Set not found' }),
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
        JSON.stringify({ error: 'Pack configuration not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 3. Check user currency
    const { data: userCurrency, error: currencyError } = await supabase
      .from('user_currencies')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (currencyError || !userCurrency) {
      return new Response(
        JSON.stringify({ error: 'User currency not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    const totalCost = (packConfig.price_coins || 150) * quantity;
    if (userCurrency.coins < totalCost) {
      return new Response(
        JSON.stringify({ error: 'Insufficient coins' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 4. Build card pools by rarity
    const pools: Record<string, any[]> = {};
    const rarities = ['common', 'uncommon', 'rare', 'mythic', 'land', 'token'];
    
    for (const rarity of rarities) {
      const { data: cards } = await supabase
        .from('card_definitions')
        .select(`
          id,
          name,
          type_line,
          rarity_id,
          rarities!inner(code)
        `)
        .eq('set_id', setData.id)
        .eq('is_active', true)
        .eq('rarities.code', rarity);
      
      pools[rarity] = cards || [];
    }

    console.log('Pool sizes:', Object.fromEntries(
      Object.entries(pools).map(([k, v]) => [k, v.length])
    ));

    // 5. Open packs
    const allNewCards: any[] = [];
    const openResults: any[] = [];

    for (let packIndex = 0; packIndex < quantity; packIndex++) {
      // Create deterministic seed for this pack
      let seed = 0;
      for (let i = 0; i < userId.length; i++) {
        seed = (seed * 31 + userId.charCodeAt(i)) % Math.pow(2, 32);
      }
      seed = (seed + Date.now() + packIndex) % Math.pow(2, 32);
      
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
        }
      }

      openResults.push({
        packIndex: packIndex + 1,
        cards: packCards,
        foils: packFoils
      });

      allNewCards.push(...packCards.map((card: any, index: number) => ({
        owner: userId,
        card_def_id: card.id,
        foil: packFoils[index]
      })));
    }

    // 6. Insert new cards into user collection
    const { data: insertedCards, error: insertError } = await supabase
      .from('user_cards')
      .insert(allNewCards)
      .select(`
        id,
        foil,
        card_def_id,
        card_definitions(
          id,
          name,
          type_line,
          image_url,
          rarities(code, display_name, color)
        )
      `);

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to add cards to collection' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 7. Deduct currency
    const { error: currencyUpdateError } = await supabase
      .from('user_currencies')
      .update({ coins: userCurrency.coins - totalCost })
      .eq('user_id', userId);

    if (currencyUpdateError) {
      console.error('Currency update error:', currencyUpdateError);
      // Note: In production, this should be handled in a transaction
    }

    // 8. Log transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'pack_purchase',
        amount_coins: -totalCost,
        description: `Opened ${quantity} ${setData.name} booster pack${quantity > 1 ? 's' : ''}`
      });

    // 9. Prepare response
    const response = {
      success: true,
      packs: openResults.map((result: any, index: number) => ({
        packNumber: result.packIndex,
        cards: result.cards.map((card: any, cardIndex: number) => {
          const insertedCard = insertedCards?.[index * packConfig.total_cards + cardIndex];
          return {
            userCardId: insertedCard?.id,
            definition: insertedCard?.card_definitions,
            foil: result.foils[cardIndex]
          };
        })
      })),
      totalCards: allNewCards.length,
      coinsSpent: totalCost,
      remainingCoins: userCurrency.coins - totalCost
    };

    console.log(`Successfully opened ${quantity} pack(s), added ${allNewCards.length} cards`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Pack opening error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
