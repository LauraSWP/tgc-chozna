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

    console.log('Fetching collection for user:', user.id);
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
            type_line,
            flavor_text,
            power,
            toughness,
            image_url,
            rarity_id,
            set_id,
            artist,
            external_code,
            keywords,
            rules_json,
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

    if (error) {
      console.error('Error fetching user cards:', error);
      throw error;
    }

    console.log('Found user cards:', userCards?.length || 0);

         // Group cards by definition and count them
     const cardGroups = new Map();
     
     userCards?.forEach(userCard => {
       const key = userCard.card_def_id;
       if (!cardGroups.has(key)) {
         // Get the card definition (it's an object, not an array)
         const cardDef = userCard.card_definitions;
         if (!cardDef) {
           console.warn('No card definition found for user card:', userCard.id, 'card_def_id:', userCard.card_def_id);
           return; // Skip if no card definition found
         }
         
         console.log('Processing card definition:', cardDef.name, 'with rarities:', cardDef.rarities);
         
         // Transform database fields to match CardDefinition type
         const transformedDefinition = {
           id: cardDef.id,
           setCode: cardDef.card_sets?.code || 'BASE',
           externalCode: cardDef.external_code || null,
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
           rarities: cardDef.rarities || { code: 'common', display_name: 'Common' },
           card_sets: cardDef.card_sets || { code: 'BASE', name: 'Base Set' },
           oracleText: null // oracle_text field doesn't exist in database
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
     console.log('Grouped into collection:', collection.length, 'unique cards');

    // Get collection summary statistics (optional - don't fail if view doesn't exist)
    let summary = [];
    try {
      const { data: summaryData, error: summaryError } = await supabase
        .from('user_collection_summary')
        .select('*')
        .eq('owner', user.id);

      if (summaryError) {
        console.warn('Error fetching summary (continuing without it):', summaryError);
      } else {
        summary = summaryData || [];
      }
    } catch (summaryError) {
      console.warn('Summary view not available (continuing without it):', summaryError);
    }

    console.log('Returning collection with', collection.length, 'unique cards and', userCards?.length || 0, 'total cards');
    
    return NextResponse.json({
      collection,
      summary,
      totalCards: userCards?.length || 0
    });

  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
