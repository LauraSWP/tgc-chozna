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
         // Get the card definition (it's an array, so we take the first element)
         const cardDef = userCard.card_definitions?.[0];
         if (!cardDef) return; // Skip if no card definition found
         
         // Transform database fields to match CardDefinition type
         const transformedDefinition = {
           id: cardDef.id,
           setCode: cardDef.card_sets?.code || 'BASE',
           externalCode: cardDef.external_code,
           name: cardDef.name,
           rarity: cardDef.rarities?.code || 'common',
           typeLine: cardDef.type_line,
           manaCost: cardDef.mana_cost,
           power: cardDef.power,
           toughness: cardDef.toughness,
           keywords: cardDef.keywords || [],
           rules: cardDef.rules_json || {},
           flavorText: cardDef.flavor_text,
           artist: cardDef.artist,
           imageUrl: cardDef.image_url,
           // Keep original database fields for compatibility
           rarities: cardDef.rarities,
           card_sets: cardDef.card_sets,
           oracleText: cardDef.oracle_text
         };
         
         cardGroups.set(key, {
           definition: transformedDefinition,
           cards: [],
           totalCount: 0,
           foilCount: 0
         });
       }
       
       const group = cardGroups.get(key);
       if (group) {
         group.cards.push(userCard);
         group.totalCount++;
         if (userCard.foil) group.foilCount++;
       }
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
