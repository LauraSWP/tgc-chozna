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

    console.log('Testing DB connection for user:', user.id);
    const supabase = await createClient();
    
    // Test basic user_cards query
    const { data: userCards, error: cardsError } = await supabase
      .from('user_cards')
      .select('id, card_def_id, foil')
      .eq('owner', user.id)
      .limit(5);

    if (cardsError) {
      console.error('Error fetching user cards:', cardsError);
      return NextResponse.json({ 
        error: 'Database error', 
        details: cardsError.message 
      }, { status: 500 });
    }

    // Test card_definitions query
    const { data: cardDefs, error: defsError } = await supabase
      .from('card_definitions')
      .select('id, name')
      .limit(5);

    if (defsError) {
      console.error('Error fetching card definitions:', defsError);
      return NextResponse.json({ 
        error: 'Database error', 
        details: defsError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      userCards: userCards?.length || 0,
      sampleUserCards: userCards,
      cardDefs: cardDefs?.length || 0,
      sampleCardDefs: cardDefs
    });

  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
