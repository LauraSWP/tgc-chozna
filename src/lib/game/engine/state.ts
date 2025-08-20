import type { MatchState, PlayerState, CardInstance, CardDefinition, Phase } from '../types';
import { GAME_RULES } from '../constants';

export function createInitialMatchState(
  playerIds: string[], 
  decks: { playerId: string; cards: CardDefinition[] }[]
): MatchState {
  const players: PlayerState[] = playerIds.map((playerId, index) => {
    const deck = decks.find(d => d.playerId === playerId);
    if (!deck) throw new Error(`No deck found for player ${playerId}`);
    
    // Create card instances for the deck
    const libraryIds = deck.cards.map((card, cardIndex) => 
      `${playerId}_${card.id}_${cardIndex}`
    );
    
    return {
      id: playerId,
      life: GAME_RULES.STARTING_LIFE,
      manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
      library: shuffleArray([...libraryIds]),
      hand: [],
      battlefield: [],
      graveyard: [],
      exile: [],
      commandZone: []
    };
  });

  // Create card instances map
  const cardInstances: Record<string, CardInstance> = {};
  const cardDefinitions: Record<string, CardDefinition> = {};
  
  decks.forEach(deck => {
    deck.cards.forEach((card, cardIndex) => {
      const instanceId = `${deck.playerId}_${card.id}_${cardIndex}`;
      cardInstances[instanceId] = {
        id: instanceId,
        definitionId: card.id,
        ownerId: deck.playerId,
        controllerId: deck.playerId,
        zone: 'library',
        tapped: false,
        summoned_this_turn: false,
        damage: 0,
        counters: {},
        modifications: {
          power: 0,
          toughness: 0,
          keywords: [],
          abilities: []
        },
        attachments: []
      };
      cardDefinitions[card.id] = card;
    });
  });

  return {
    id: `match_${Date.now()}`,
    players,
    activePlayer: players[0].id,
    priorityPlayer: players[0].id,
    turn: 1,
    phase: 'beginning:untap',
    step: 'main',
    stack: [],
    cardInstances,
    cardDefinitions,
    pendingActions: [],
    gameLog: [{
      id: `event_${Date.now()}`,
      type: 'game_start',
      timestamp: Date.now(),
      playerId: 'system',
      description: 'Game started'
    }],
    metadata: {
      format: 'casual',
      startedAt: new Date().toISOString(),
      lastAction: 'game_start'
    }
  };
}

export function getPlayer(state: MatchState, playerId: string): PlayerState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);
  return player;
}

export function getCardInstance(state: MatchState, instanceId: string): CardInstance {
  const instance = state.cardInstances[instanceId];
  if (!instance) throw new Error(`Card instance ${instanceId} not found`);
  return instance;
}

export function getCardDefinition(state: MatchState, definitionId: string): CardDefinition {
  const definition = state.cardDefinitions[definitionId];
  if (!definition) throw new Error(`Card definition ${definitionId} not found`);
  return definition;
}

export function moveCard(state: MatchState, instanceId: string, fromZone: string, toZone: string, position?: number): void {
  const instance = getCardInstance(state, instanceId);
  const owner = getPlayer(state, instance.ownerId);
  
  // Remove from current zone
  const currentZone = owner[fromZone as keyof PlayerState] as string[];
  const index = currentZone.indexOf(instanceId);
  if (index !== -1) {
    currentZone.splice(index, 1);
  }
  
  // Add to new zone
  const targetZone = owner[toZone as keyof PlayerState] as string[];
  if (position !== undefined) {
    targetZone.splice(position, 0, instanceId);
  } else {
    targetZone.push(instanceId);
  }
  
  // Update instance zone
  instance.zone = toZone as any;
  
  // Log the movement
  logGameEvent(state, 'system', 'card_moved', `${instance.definitionId} moved from ${fromZone} to ${toZone}`);
}

export function drawCards(state: MatchState, playerId: string, count: number): string[] {
  const player = getPlayer(state, playerId);
  const drawnCards: string[] = [];
  
  for (let i = 0; i < count && player.library.length > 0; i++) {
    const cardId = player.library.pop()!; // Draw from top (end of array)
    player.hand.push(cardId);
    drawnCards.push(cardId);
    
    const instance = getCardInstance(state, cardId);
    instance.zone = 'hand';
  }
  
  if (drawnCards.length > 0) {
    logGameEvent(state, playerId, 'cards_drawn', `Drew ${drawnCards.length} cards`);
  }
  
  return drawnCards;
}

export function dealStartingHands(state: MatchState): void {
  state.players.forEach(player => {
    drawCards(state, player.id, GAME_RULES.STARTING_HAND_SIZE);
  });
}

export function logGameEvent(state: MatchState, playerId: string, type: string, description: string, data?: Record<string, unknown>): void {
  state.gameLog.push({
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: Date.now(),
    playerId,
    description,
    data
  });
}

export function getOpponent(state: MatchState, playerId: string): PlayerState {
  const opponent = state.players.find(p => p.id !== playerId);
  if (!opponent) throw new Error(`No opponent found for player ${playerId}`);
  return opponent;
}

export function isActivePlayer(state: MatchState, playerId: string): boolean {
  return state.activePlayer === playerId;
}

export function hasPriority(state: MatchState, playerId: string): boolean {
  return state.priorityPlayer === playerId;
}

// Utility functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function canAffordCost(player: PlayerState, manaCost: string): boolean {
  // Simple mana cost parsing - in production this would be more sophisticated
  // For now, just check if we have enough total mana
  const totalMana = Object.values(player.manaPool).reduce((sum, amount) => sum + amount, 0);
  const costNumbers = manaCost.match(/\d+/g);
  const genericCost = costNumbers ? parseInt(costNumbers[0]) || 0 : 0;
  
  return totalMana >= genericCost;
}

export function payManaCost(player: PlayerState, manaCost: string): boolean {
  if (!canAffordCost(player, manaCost)) return false;
  
  // Simple implementation - just reduce colorless mana first
  const costNumbers = manaCost.match(/\d+/g);
  const genericCost = costNumbers ? parseInt(costNumbers[0]) || 0 : 0;
  
  let remainingCost = genericCost;
  
  // Pay with colorless first
  const colorlessAvailable = player.manaPool.C;
  const colorlessUsed = Math.min(colorlessAvailable, remainingCost);
  player.manaPool.C -= colorlessUsed;
  remainingCost -= colorlessUsed;
  
  // Pay with colored mana
  const colors: Array<keyof typeof player.manaPool> = ['W', 'U', 'B', 'R', 'G'];
  for (const color of colors) {
    if (remainingCost <= 0) break;
    const available = player.manaPool[color];
    const used = Math.min(available, remainingCost);
    player.manaPool[color] -= used;
    remainingCost -= used;
  }
  
  return remainingCost <= 0;
}
