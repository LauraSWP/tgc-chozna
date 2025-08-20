import { createClient } from '../auth';
import type { Database } from '../../../supabase/types';

type Tables = Database['public']['Tables'];

// User and profile queries
export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
}

export async function updateUserProfile(userId: string, updates: Partial<Tables['profiles']['Update']>) {
  const supabase = await createClient();
  return supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
}

// Card definition queries
export async function getCardDefinitions(setCode?: string, limit: number = 100) {
  const supabase = await createClient();
  let query = supabase
    .from('card_definitions')
    .select(`
      *,
      rarities(code, display_name, color),
      card_sets(code, name)
    `)
    .eq('is_active', true)
    .limit(limit);
    
  if (setCode) {
    query = query.eq('card_sets.code', setCode);
  }
  
  return query;
}

export async function getCardDefinition(id: string) {
  const supabase = await createClient();
  return supabase
    .from('card_definitions')
    .select(`
      *,
      rarities(code, display_name, color),
      card_sets(code, name)
    `)
    .eq('id', id)
    .single();
}

// User collection queries
export async function getUserCards(userId: string, cardDefId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('user_cards')
    .select(`
      *,
      card_definitions(
        *,
        rarities(code, display_name, color),
        card_sets(code, name)
      )
    `)
    .eq('owner', userId)
    .order('acquired_at', { ascending: false });
    
  if (cardDefId) {
    query = query.eq('card_def_id', cardDefId);
  }
  
  return query;
}

export async function getUserCollection(userId: string) {
  const supabase = await createClient();
  return supabase
    .from('user_collection_summary')
    .select('*')
    .eq('owner', userId);
}

export async function addCardToUser(userId: string, cardDefId: string, foil: boolean = false) {
  const supabase = await createClient();
  return supabase
    .from('user_cards')
    .insert({
      owner: userId,
      card_def_id: cardDefId,
      foil
    })
    .select()
    .single();
}

// Deck queries
export async function getUserDecks(userId: string) {
  const supabase = await createClient();
  return supabase
    .from('deck_summary')
    .select('*')
    .eq('owner', userId)
    .order('updated_at', { ascending: false });
}

export async function getDeck(deckId: string) {
  const supabase = await createClient();
  return supabase
    .from('decks')
    .select(`
      *,
      deck_cards(
        qty,
        is_sideboard,
        user_cards(
          id,
          foil,
          card_definitions(
            *,
            rarities(code, display_name, color)
          )
        )
      )
    `)
    .eq('id', deckId)
    .single();
}

export async function createDeck(userId: string, name: string, description?: string) {
  const supabase = await createClient();
  return supabase
    .from('decks')
    .insert({
      owner: userId,
      name,
      description
    })
    .select()
    .single();
}

export async function updateDeck(deckId: string, updates: Partial<Tables['decks']['Update']>) {
  const supabase = await createClient();
  return supabase
    .from('decks')
    .update(updates)
    .eq('id', deckId)
    .select()
    .single();
}

export async function addCardToDeck(deckId: string, userCardId: string, qty: number = 1, isSideboard: boolean = false) {
  const supabase = await createClient();
  return supabase
    .from('deck_cards')
    .upsert({
      deck_id: deckId,
      user_card_id: userCardId,
      qty,
      is_sideboard: isSideboard
    });
}

export async function removeCardFromDeck(deckId: string, userCardId: string, isSideboard: boolean = false) {
  const supabase = await createClient();
  return supabase
    .from('deck_cards')
    .delete()
    .eq('deck_id', deckId)
    .eq('user_card_id', userCardId)
    .eq('is_sideboard', isSideboard);
}

// Pack and currency queries
export async function getUserCurrency(userId: string) {
  const supabase = await createClient();
  return supabase
    .from('user_currencies')
    .select('*')
    .eq('user_id', userId)
    .single();
}

export async function updateUserCurrency(userId: string, coinsDelta: number = 0, gemsDelta: number = 0) {
  const supabase = await createClient();
  
  // Get current currency
  const { data: current } = await getUserCurrency(userId);
  if (!current) {
    throw new Error('User currency not found');
  }
  
  return supabase
    .from('user_currencies')
    .update({
      coins: current.coins + coinsDelta,
      gems: current.gems + gemsDelta
    })
    .eq('user_id', userId)
    .select()
    .single();
}

export async function getPackConfigs(setCode?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('pack_configs')
    .select(`
      *,
      card_sets(code, name),
      pack_slots(
        slot_index,
        pool,
        mythic_chance,
        foil_replaces
      )
    `)
    .eq('is_active', true);
    
  if (setCode) {
    query = query.eq('card_sets.code', setCode);
  }
  
  return query.order('pack_slots.slot_index', { ascending: true });
}

// Match queries
export async function getMatches(userId?: string, status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('matches')
    .select(`
      *,
      match_players(
        user_id,
        seat,
        profiles(username)
      )
    `)
    .order('created_at', { ascending: false });
    
  if (userId) {
    query = query.eq('match_players.user_id', userId);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  return query;
}

export async function getMatch(matchId: string) {
  const supabase = await createClient();
  return supabase
    .from('matches')
    .select(`
      *,
      match_players(
        user_id,
        seat,
        deck_id,
        profiles(username),
        decks(name)
      )
    `)
    .eq('id', matchId)
    .single();
}

export async function createMatch(createdBy: string, maxPlayers: number = 2) {
  const supabase = await createClient();
  return supabase
    .from('matches')
    .insert({
      created_by: createdBy,
      max_players: maxPlayers
    })
    .select()
    .single();
}

export async function joinMatch(matchId: string, userId: string, deckId?: string) {
  const supabase = await createClient();
  
  // Get current player count
  const { data: players } = await supabase
    .from('match_players')
    .select('seat')
    .eq('match_id', matchId);
    
  const nextSeat = (players?.length || 0) + 1;
  
  return supabase
    .from('match_players')
    .insert({
      match_id: matchId,
      user_id: userId,
      seat: nextSeat,
      deck_id: deckId
    });
}

export async function updateMatchState(matchId: string, state: any) {
  const supabase = await createClient();
  return supabase
    .from('matches')
    .update({ state })
    .eq('id', matchId);
}

// Trade queries
export async function getUserTrades(userId: string, status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('trades')
    .select(`
      *,
      initiator:profiles!trades_initiator_id_fkey(username),
      target:profiles!trades_target_id_fkey(username),
      trade_items(
        is_from_initiator,
        user_cards(
          id,
          foil,
          card_definitions(name, image_url, rarities(code, color))
        )
      )
    `)
    .or(`initiator_id.eq.${userId},target_id.eq.${userId}`)
    .order('created_at', { ascending: false });
    
  if (status) {
    query = query.eq('status', status);
  }
  
  return query;
}

export async function createTrade(
  initiatorId: string,
  targetId: string,
  offeredCards: string[],
  requestedCards: string[]
) {
  const supabase = await createClient();
  
  // Create trade
  const { data: trade, error: tradeError } = await supabase
    .from('trades')
    .insert({
      initiator_id: initiatorId,
      target_id: targetId
    })
    .select()
    .single();
    
  if (tradeError || !trade) {
    throw tradeError;
  }
  
  // Add trade items
  const tradeItems = [
    ...offeredCards.map(cardId => ({
      trade_id: trade.id,
      user_card_id: cardId,
      is_from_initiator: true
    })),
    ...requestedCards.map(cardId => ({
      trade_id: trade.id,
      user_card_id: cardId,
      is_from_initiator: false
    }))
  ];
  
  await supabase.from('trade_items').insert(tradeItems);
  
  return trade;
}

export async function updateTradeStatus(tradeId: string, status: string) {
  const supabase = await createClient();
  const updates: any = { status };
  
  if (status === 'accepted') {
    updates.completed_at = new Date().toISOString();
  }
  
  return supabase
    .from('trades')
    .update(updates)
    .eq('id', tradeId)
    .select()
    .single();
}

// Transaction logging
export async function logTransaction(
  userId: string,
  type: string,
  coinsAmount: number = 0,
  gemsAmount: number = 0,
  description?: string
) {
  const supabase = await createClient();
  return supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      amount_coins: coinsAmount,
      amount_gems: gemsAmount,
      description
    });
}

// Search queries
export async function searchCards(query: string, limit: number = 20) {
  const supabase = await createClient();
  return supabase
    .from('card_definitions')
    .select(`
      *,
      rarities(code, display_name, color),
      card_sets(code, name)
    `)
    .or(`name.ilike.%${query}%,type_line.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(limit);
}

export async function searchUsers(query: string, limit: number = 10) {
  const supabase = await createClient();
  return supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .ilike('username', `%${query}%`)
    .limit(limit);
}
