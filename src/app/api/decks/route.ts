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
    
    // Get user's decks with summary
    const { data: decks, error } = await supabase
      .from('deck_summary')
      .select('*')
      .eq('owner', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ decks: decks || [] });

  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, format = 'casual', cards = [] } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Deck name is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Create the deck
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .insert({
        owner: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        format
      })
      .select()
      .single();

    if (deckError) throw deckError;

    // Add cards to deck if provided
    if (cards.length > 0) {
      const deckCards = cards.map((card: any) => ({
        deck_id: deck.id,
        user_card_id: card.user_card_id,
        qty: card.qty || 1,
        is_sideboard: card.is_sideboard || false
      }));

      const { error: cardsError } = await supabase
        .from('deck_cards')
        .insert(deckCards);

      if (cardsError) throw cardsError;
    }

    return NextResponse.json({ deck });

  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
