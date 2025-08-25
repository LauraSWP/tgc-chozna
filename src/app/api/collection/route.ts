import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('Collection API called');
    
    const user = await getUser();
    if (!user) {
      console.log('No user found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching collection for user:', user.id);
    const supabase = await createClient();
    
    // Debug: Check if there are any card definitions at all
    const { data: totalCardDefs, error: totalDefsError } = await supabase
      .from('card_definitions')
      .select('id', { count: 'exact' });
    
    console.log('Total card definitions in database:', totalCardDefs?.length || 0);
    if (totalDefsError) {
      console.error('Error checking total card definitions:', totalDefsError);
    }
    
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
             rules_json
           )
        `)
        .eq('owner', user.id)
        .order('acquired_at', { ascending: false });

    if (error) {
      console.error('Error fetching user cards:', error);
      throw error;
    }

    console.log('Found user cards:', userCards?.length || 0);
    
    // Debug: Check for orphaned cards
    if (userCards && userCards.length > 0) {
      const orphanedCards = userCards.filter(card => !card.card_definitions || card.card_definitions.length === 0);
      console.log('Orphaned cards (no card definition):', orphanedCards.length);
      if (orphanedCards.length > 0) {
        console.log('Sample orphaned card:', orphanedCards[0]);
      }
      
      const validCards = userCards.filter(card => card.card_definitions && card.card_definitions.length > 0);
      console.log('Valid cards (with card definition):', validCards.length);
    }

     // Test: Get a sample of card definitions to see if they exist
     if (userCards && userCards.length > 0) {
       const sampleCardDefId = userCards[0].card_def_id;
       console.log('Testing card definition lookup for ID:', sampleCardDefId);
       
       const { data: testCardDef, error: testError } = await supabase
         .from('card_definitions')
         .select('id, name')
         .eq('id', sampleCardDefId)
         .single();
       
       if (testError) {
         console.error('Error testing card definition lookup:', testError);
       } else {
         console.log('Test card definition found:', testCardDef);
       }
     }

          // Group cards by definition and count them
     const cardGroups = new Map();
     
          userCards?.forEach(userCard => {
       const key = userCard.card_def_id;
       console.log('Processing user card:', userCard.id, 'card_def_id:', userCard.card_def_id, 'card_definitions:', userCard.card_definitions);
       
       if (!cardGroups.has(key)) {
         // Get the card definition (it's an array, so we take the first element)
         const cardDef = userCard.card_definitions?.[0];
         if (!cardDef) {
           console.warn('No card definition found for user card:', userCard.id, 'card_def_id:', userCard.card_def_id);
           // Skip orphaned cards for now, but we should clean them up later
           return; // Skip if no card definition found
         }
         
                   console.log('Processing card definition:', cardDef.name);
         
                            // Transform database fields to match CardDefinition type
         const transformedDefinition = {
           id: cardDef.id,
           setCode: 'BASE', // We'll get this from a separate query if needed
           externalCode: cardDef.external_code || null,
           name: cardDef.name,
           rarity: 'common', // We'll get this from a separate query if needed
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
           rarities: { code: 'common', display_name: 'Common' },
           card_sets: { code: 'BASE', name: 'Base Set' },
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

      // Get rarity and card set data for the cards we found
      if (collection.length > 0) {
        const cardDefIds = collection.map(card => card.definition.id);
        console.log('Fetching rarity and card set data for card definitions:', cardDefIds);
        
        const { data: cardDetails, error: detailsError } = await supabase
          .from('card_definitions')
          .select(`
            id,
            rarity_id,
            set_id,
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
          `)
          .in('id', cardDefIds);

        if (detailsError) {
          console.warn('Error fetching card details:', detailsError);
        } else {
          console.log('Found card details:', cardDetails?.length || 0);
          // Update the collection with the correct rarity and card set data
          cardDetails?.forEach(detail => {
            const card = collection.find(c => c.definition.id === detail.id);
            if (card) {
              card.definition.rarities = detail.rarities?.[0] || { code: 'common', display_name: 'Common' };
              card.definition.card_sets = detail.card_sets?.[0] || { code: 'BASE', name: 'Base Set' };
              card.definition.rarity = detail.rarities?.[0]?.code || 'common';
              card.definition.setCode = detail.card_sets?.[0]?.code || 'BASE';
            }
          });
        }
      }

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
    
    // For debugging, let's also return some test data
    const testResponse = {
      collection,
      summary,
      totalCards: userCards?.length || 0,
      debug: {
        userCardsFound: userCards?.length || 0,
        collectionLength: collection.length,
        user: user.id
      }
    };
    
    console.log('Final response:', testResponse);
    
    return NextResponse.json(testResponse);

  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
