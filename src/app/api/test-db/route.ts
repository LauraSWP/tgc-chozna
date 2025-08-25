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
    
    // Test 1: Get all user cards
    const { data: allUserCards, error: userCardsError } = await supabase
      .from('user_cards')
      .select('id, card_def_id, foil')
      .eq('owner', user.id);

    if (userCardsError) {
      return NextResponse.json({ error: 'Error fetching user cards', details: userCardsError }, { status: 500 });
    }

    // Test 2: Check for orphaned cards
    const orphanedCards = [];
    const validCards = [];
    
    for (const userCard of allUserCards || []) {
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

    // Test 3: Get some sample card definitions
    const { data: sampleCardDefs, error: sampleError } = await supabase
      .from('card_definitions')
      .select('id, name, set_id')
      .limit(5);

    return NextResponse.json({
      totalUserCards: allUserCards?.length || 0,
      orphanedCards: orphanedCards.length,
      validCards: validCards.length,
      orphanedCardIds: orphanedCards.map(c => c.card_def_id),
      sampleValidCards: validCards.slice(0, 5),
      sampleCardDefinitions: sampleCardDefs,
      userId: user.id
    });

  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
