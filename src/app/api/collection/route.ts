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
    
    // Get user's complete collection with card details
    const { data: userCards, error } = await supabase
      .from('user_cards')
      .select(`
        id,
        card_def_id,
        foil,
        acquired_at,
        card_definitions(
          id,
          name,
          mana_cost,
          cmc,
          type_line,
          oracle_text,
          flavor_text,
          power,
          toughness,
          loyalty,
          image_url,
          rarity_id,
          set_id,
          artist,
          created_at,
          rarities(
            id,
            code,
            display_name,
            color
          ),
          card_sets(
            id,
            code,
            name
          )
        )
      `)
      .eq('owner', user.id)
      .order('acquired_at', { ascending: false });

    if (error) throw error;

    // Group cards by definition and count them
    const cardGroups = new Map();
    
    userCards?.forEach(userCard => {
      const key = userCard.card_def_id;
      if (!cardGroups.has(key)) {
        cardGroups.set(key, {
          definition: userCard.card_definitions,
          cards: [],
          totalCount: 0,
          foilCount: 0
        });
      }
      
      const group = cardGroups.get(key);
      group.cards.push(userCard);
      group.totalCount++;
      if (userCard.foil) group.foilCount++;
    });

    const collection = Array.from(cardGroups.values());

    // Get collection summary statistics
    const { data: summary, error: summaryError } = await supabase
      .from('user_collection_summary')
      .select('*')
      .eq('owner', user.id);

    if (summaryError) throw summaryError;

    return NextResponse.json({
      collection,
      summary: summary || [],
      totalCards: userCards?.length || 0
    });

  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
