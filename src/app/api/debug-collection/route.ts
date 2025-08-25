import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    
    // 1. Check total card definitions
    const { data: totalCardDefs, error: totalDefsError } = await supabase
      .from('card_definitions')
      .select('id', { count: 'exact' });
    
    // 2. Check user cards
    const { data: userCards, error: userCardsError } = await supabase
      .from('user_cards')
      .select('id, card_def_id, foil')
      .eq('owner', user.id);
    
    // 3. Check for orphaned cards
    const orphanedCards = [];
    const validCards = [];
    
    if (userCards && userCards.length > 0) {
      for (const userCard of userCards) {
        const { data: cardDef, error: cardDefError } = await supabase
          .from('card_definitions')
          .select('id, name')
          .eq('id', userCard.card_def_id)
          .single();
        
        if (cardDefError || !cardDef) {
          orphanedCards.push(userCard);
        } else {
          validCards.push({ ...userCard, cardDefinition: cardDef });
        }
      }
    }
    
    // 4. Check card sets
    const { data: cardSets, error: cardSetsError } = await supabase
      .from('card_sets')
      .select('id, code, name');
    
    // 5. Check rarities
    const { data: rarities, error: raritiesError } = await supabase
      .from('rarities')
      .select('id, code, display_name');
    
    // 6. Sample some card definitions
    const { data: sampleCardDefs, error: sampleError } = await supabase
      .from('card_definitions')
      .select(`
        id,
        name,
        set_id,
        rarity_id,
        card_sets(code, name),
        rarities(code, display_name)
      `)
      .limit(5);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      database: {
        totalCardDefinitions: totalCardDefs?.length || 0,
        totalUserCards: userCards?.length || 0,
        orphanedCards: orphanedCards.length,
        validCards: validCards.length,
        cardSets: cardSets?.length || 0,
        rarities: rarities?.length || 0
      },
      details: {
        orphanedCardIds: orphanedCards.map(c => c.card_def_id),
        sampleValidCards: validCards.slice(0, 3),
        sampleCardDefinitions: sampleCardDefs,
        cardSets: cardSets,
        rarities: rarities
      },
      errors: {
        totalDefsError: totalDefsError?.message,
        userCardsError: userCardsError?.message,
        cardSetsError: cardSetsError?.message,
        raritiesError: raritiesError?.message,
        sampleError: sampleError?.message
      }
    });

  } catch (error) {
    console.error('Debug collection error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
