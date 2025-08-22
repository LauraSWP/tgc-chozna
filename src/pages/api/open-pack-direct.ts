import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';
import { validateInput, packOpenSchema } from '@/lib/validate';
import type { Database } from '../../../supabase/types';

// Simple RNG for pack generation
class SimpleRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.seed / Math.pow(2, 32);
  }

  choice<T>(items: T[]): T {
    const index = Math.floor(this.next() * items.length);
    return items[index];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create Supabase client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies[name];
          },
        },
      }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    const validation = validateInput(packOpenSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { set_code: setCode, quantity = 1 } = validation.data;

    // 1. Get set information
    const { data: setData, error: setError } = await supabase
      .from('card_sets')
      .select('id, name')
      .eq('code', setCode)
      .single();

    if (setError || !setData) {
      return res.status(404).json({ error: 'Set no encontrado' });
    }

    // 2. Check user currency
    const { data: userCurrency, error: currencyError } = await supabase
      .from('user_currencies')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const packPrice = 150;
    const totalCost = packPrice * quantity;

    if (!userCurrency || userCurrency.coins < totalCost) {
      return res.status(400).json({ 
        error: 'Monedas insuficientes',
        required: totalCost,
        available: userCurrency?.coins || 0
      });
    }

    // 3. Get cards for the set
    const { data: allCards, error: cardsError } = await supabase
      .from('card_definitions')
      .select(`
        *,
        rarities(code, display_name, color)
      `)
      .eq('set_id', setData.id)
      .eq('is_active', true);

    if (cardsError || !allCards || allCards.length === 0) {
      return res.status(500).json({ error: 'No se encontraron cartas para este set' });
    }

    // Group cards by rarity
    const pools: Record<string, any[]> = {
      common: [],
      uncommon: [],
      rare: [],
      mythic: []
    };

    allCards.forEach(card => {
      const rarity = card.rarities?.code || 'common';
      if (pools[rarity]) {
        pools[rarity].push(card);
      }
    });

    // 4. Generate pack contents (simplified)
    const rng = new SimpleRNG(Date.now() + user.id.charCodeAt(0));
    const packResults = [];
    const allNewCards = [];

    for (let i = 0; i < quantity; i++) {
      const packCards = [];
      
      // Generate 15 cards per pack: 10 common, 3 uncommon, 1 rare, 1 land
      for (let j = 0; j < 10; j++) {
        if (pools.common.length > 0) {
          packCards.push({
            definition: rng.choice(pools.common),
            foil: false
          });
        }
      }
      
      for (let j = 0; j < 3; j++) {
        if (pools.uncommon.length > 0) {
          packCards.push({
            definition: rng.choice(pools.uncommon),
            foil: false
          });
        }
      }
      
      // 1 rare or mythic (10% chance for mythic)
      const isMyth = rng.next() < 0.1;
      const rarePool = isMyth && pools.mythic.length > 0 ? pools.mythic : pools.rare;
      if (rarePool.length > 0) {
        packCards.push({
          definition: rng.choice(rarePool),
          foil: false
        });
      }
      
      // Add basic land if we have any
      if (pools.common.length > 0) {
        packCards.push({
          definition: rng.choice(pools.common),
          foil: false
        });
      }

      packResults.push({
        packNumber: i + 1,
        cards: packCards.map(card => ({
          userCardId: `temp-${Date.now()}-${Math.random()}`,
          definition: {
            ...card.definition,
            rarity: card.definition.rarities?.code || 'common' // Fix: Extract rarity code
          },
          foil: card.foil
        }))
      });

      // Prepare for user collection
      allNewCards.push(...packCards.map(card => ({
        owner: user.id,
        card_def_id: card.definition.id,
        foil: card.foil
      })));
    }

    // 5. Update user currency and add cards
    const { error: updateError } = await supabase
      .from('user_currencies')
      .update({ coins: userCurrency.coins - totalCost })
      .eq('user_id', user.id);

    if (updateError) {
      return res.status(500).json({ error: 'Error al actualizar monedas' });
    }

    // 6. Add cards to collection
    if (allNewCards.length > 0) {
      const { error: insertError } = await supabase
        .from('user_cards')
        .insert(allNewCards);

      if (insertError) {
        // Rollback currency change
        await supabase
          .from('user_currencies')
          .update({ coins: userCurrency.coins })
          .eq('user_id', user.id);
        
        return res.status(500).json({ error: 'Error al añadir cartas a la colección' });
      }
    }

    // 7. Return success
    return res.status(200).json({
      success: true,
      packs: packResults,
      totalCards: allNewCards.length,
      coinsSpent: totalCost,
      remainingCoins: userCurrency.coins - totalCost,
      setName: setData.name
    });

  } catch (error) {
    console.error('Pack opening error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
