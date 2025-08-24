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
         // Transform database fields to match CardDefinition type
         const transformedDefinition = {
           id: userCard.card_definitions.id,
           setCode: userCard.card_definitions.card_sets?.code || 'BASE',
           externalCode: userCard.card_definitions.external_code,
           name: userCard.card_definitions.name,
           rarity: userCard.card_definitions.rarities?.code || 'common',
           typeLine: userCard.card_definitions.type_line,
           manaCost: userCard.card_definitions.mana_cost,
           power: userCard.card_definitions.power,
           toughness: userCard.card_definitions.toughness,
           keywords: userCard.card_definitions.keywords || [],
           rules: userCard.card_definitions.rules_json || {},
           flavorText: userCard.card_definitions.flavor_text,
           artist: userCard.card_definitions.artist,
           imageUrl: userCard.card_definitions.image_url,
           // Keep original database fields for compatibility
           rarities: userCard.card_definitions.rarities,
           card_sets: userCard.card_definitions.card_sets,
           oracleText: userCard.card_definitions.oracle_text
         };
         
         cardGroups.set(key, {
           definition: transformedDefinition,
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
