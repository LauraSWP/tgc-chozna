import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { validateInput, packOpenSchema } from '@/lib/validate';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await req.json();
    const validation = validateInput(packOpenSchema, body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { set_code: setCode, quantity = 1 } = validation.data;

    // Simplified pack opening implementation
    try {
      // Get cards from the database
      const { data: cards, error: cardsError } = await supabase
        .from('card_definitions')
        .select(`
          *,
          rarities(code, display_name, color),
          card_sets(code, name)
        `)
        .eq('is_active', true);

      if (cardsError) {
        console.error('Error fetching cards:', cardsError);
        return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
      }

      if (!cards || cards.length === 0) {
        return NextResponse.json({ error: 'No cards available' }, { status: 404 });
      }

      // Create pack contents (simplified)
      const packPrice = 150;
      const packs = [];

      for (let i = 0; i < quantity; i++) {
        // Simple pack: 10 commons, 3 uncommons, 1 rare, 1 land
        const packCards = [];
        const foils = [];

        // Get cards by rarity
        const commons = cards.filter(c => c.rarities?.code === 'common');
        const uncommons = cards.filter(c => c.rarities?.code === 'uncommon');
        const rares = cards.filter(c => c.rarities?.code === 'rare');
        const mythics = cards.filter(c => c.rarities?.code === 'mythic');
        const lands = cards.filter(c => c.rarities?.code === 'land');

        // Add 10 commons
        for (let j = 0; j < 10 && commons.length > 0; j++) {
          const randomCard = commons[Math.floor(Math.random() * commons.length)];
          packCards.push(randomCard);
          foils.push(false);
        }

        // Add 3 uncommons
        for (let j = 0; j < 3 && uncommons.length > 0; j++) {
          const randomCard = uncommons[Math.floor(Math.random() * uncommons.length)];
          packCards.push(randomCard);
          foils.push(false);
        }

        // Add 1 rare or mythic (10% chance for mythic)
        const rarePool = Math.random() < 0.1 && mythics.length > 0 ? mythics : rares;
        if (rarePool.length > 0) {
          const randomCard = rarePool[Math.floor(Math.random() * rarePool.length)];
          packCards.push(randomCard);
          foils.push(false);
        }

        // Add 1 land
        if (lands.length > 0) {
          const randomCard = lands[Math.floor(Math.random() * lands.length)];
          packCards.push(randomCard);
          foils.push(false);
        }

        packs.push({
          packIndex: i + 1,
          cards: packCards,
          foils: foils
        });
      }

      return NextResponse.json({
        success: true,
        packs: packs,
        remainingCoins: Math.max(0, 1000 - (packPrice * quantity)) // Mock currency for now
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

  } catch (error) {
    console.error('Pack opening API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
