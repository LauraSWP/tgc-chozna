import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    
    // Get deck details
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', params.id)
      .eq('owner', user.id)
      .single();

    if (deckError) throw deckError;
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

         // Get deck cards with full details
     const { data: deckCards, error: cardsError } = await supabase
       .from('deck_cards')
       .select(`
         user_card_id,
         qty,
         is_sideboard,
         user_cards(
           id,
           card_def_id,
           foil,
           card_definitions(
             id,
             name,
             mana_cost,
             cmc,
             type_line,
             oracle_text,
             power,
             toughness,
             image_url,
             rarities(
               code,
               display_name,
               color
             ),
             card_sets(
               code,
               name
             )
           )
         )
       `)
       .eq('deck_id', params.id);

     if (cardsError) throw cardsError;

     // Transform card definitions to match CardDefinition type
     const transformedCards = deckCards?.map(item => ({
       ...item,
       user_cards: {
         ...item.user_cards,
         card_definitions: {
           id: item.user_cards.card_definitions.id,
           setCode: item.user_cards.card_definitions.card_sets?.code || 'BASE',
           externalCode: item.user_cards.card_definitions.external_code,
           name: item.user_cards.card_definitions.name,
           rarity: item.user_cards.card_definitions.rarities?.code || 'common',
           typeLine: item.user_cards.card_definitions.type_line,
           manaCost: item.user_cards.card_definitions.mana_cost,
           power: item.user_cards.card_definitions.power,
           toughness: item.user_cards.card_definitions.toughness,
           keywords: item.user_cards.card_definitions.keywords || [],
           rules: item.user_cards.card_definitions.rules_json || {},
           flavorText: item.user_cards.card_definitions.flavor_text,
           artist: item.user_cards.card_definitions.artist,
           imageUrl: item.user_cards.card_definitions.image_url,
           // Keep original database fields for compatibility
           rarities: item.user_cards.card_definitions.rarities,
           card_sets: item.user_cards.card_definitions.card_sets,
           oracleText: item.user_cards.card_definitions.oracle_text
         }
       }
     })) || [];

    if (cardsError) throw cardsError;

         return NextResponse.json({
       deck,
       cards: transformedCards
     });

  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, format, cards } = body;

    const supabase = await createClient();
    
    // Verify deck ownership
    const { data: existingDeck, error: checkError } = await supabase
      .from('decks')
      .select('id')
      .eq('id', params.id)
      .eq('owner', user.id)
      .single();

    if (checkError || !existingDeck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Update deck metadata
    const updateData: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (format !== undefined) updateData.format = format;

    const { error: updateError } = await supabase
      .from('decks')
      .update(updateData)
      .eq('id', params.id);

    if (updateError) throw updateError;

    // Update deck cards if provided
    if (cards !== undefined) {
      // Remove all existing cards
      const { error: deleteError } = await supabase
        .from('deck_cards')
        .delete()
        .eq('deck_id', params.id);

      if (deleteError) throw deleteError;

      // Add new cards
      if (cards.length > 0) {
        const deckCards = cards.map((card: any) => ({
          deck_id: params.id,
          user_card_id: card.user_card_id,
          qty: card.qty || 1,
          is_sideboard: card.is_sideboard || false
        }));

        const { error: insertError } = await supabase
          .from('deck_cards')
          .insert(deckCards);

        if (insertError) throw insertError;
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    
    // Delete deck (cascade will handle deck_cards)
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', params.id)
      .eq('owner', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
