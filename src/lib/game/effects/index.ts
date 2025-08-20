import type { MatchState, EffectOp } from '../types';
import { 
  getPlayer, 
  getCardInstance, 
  getCardDefinition, 
  drawCards as stateDrawCards, 
  logGameEvent, 
  moveCard,
  getOpponent 
} from '../engine/state';
import { removeFromStack } from '../engine/stack';

export function draw(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'draw'}>): void {
  const { count, target } = effect;
  
  switch (target) {
    case 'self':
      stateDrawCards(state, controllerId, count);
      break;
    case 'ally':
      // In 2-player game, ally = self
      stateDrawCards(state, controllerId, count);
      break;
    case 'opponent':
      const opponent = getOpponent(state, controllerId);
      stateDrawCards(state, opponent.id, count);
      break;
    case 'all':
      state.players.forEach(player => {
        stateDrawCards(state, player.id, count);
      });
      break;
  }
}

export function damage(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'damage'}>): void {
  const { amount, target, selector } = effect;
  
  switch (target) {
    case 'player':
      if (selector === 'self') {
        const player = getPlayer(state, controllerId);
        player.life -= amount;
        logGameEvent(state, controllerId, 'damage_self', `${controllerId} takes ${amount} damage`);
      } else {
        const opponent = getOpponent(state, controllerId);
        opponent.life -= amount;
        logGameEvent(state, controllerId, 'damage_opponent', `Dealt ${amount} damage to opponent`);
      }
      break;
      
    case 'creature':
      if (selector) {
        // Find creature by selector (simplified - would be more sophisticated)
        const targetCreature = findCreatureBySelector(state, selector);
        if (targetCreature) {
          targetCreature.damage += amount;
          const definition = getCardDefinition(state, targetCreature.definitionId);
          logGameEvent(state, controllerId, 'damage_creature', `Dealt ${amount} damage to ${definition.name}`);
        }
      }
      break;
      
    case 'any':
      // Would require target selection in UI
      logGameEvent(state, controllerId, 'damage_any', `Dealing ${amount} damage (target required)`);
      break;
  }
}

export function heal(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'heal'}>): void {
  const { amount, target, selector } = effect;
  
  switch (target) {
    case 'self':
      const player = getPlayer(state, controllerId);
      player.life += amount;
      logGameEvent(state, controllerId, 'heal_self', `Gained ${amount} life`);
      break;
      
    case 'ally':
      // In 2-player, ally = self
      const ally = getPlayer(state, controllerId);
      ally.life += amount;
      logGameEvent(state, controllerId, 'heal_ally', `Ally gained ${amount} life`);
      break;
      
    case 'any':
      // Would require target selection
      logGameEvent(state, controllerId, 'heal_any', `Healing ${amount} (target required)`);
      break;
  }
}

export function buff(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'buff'}>): void {
  const { power = 0, toughness = 0, until, selector } = effect;
  
  const targets = findCreaturesBySelector(state, selector);
  targets.forEach(target => {
    // Apply temporary modifications
    target.modifications.power += power;
    target.modifications.toughness += toughness;
    
    const definition = getCardDefinition(state, target.definitionId);
    logGameEvent(state, controllerId, 'buff_creature', 
      `${definition.name} gets +${power}/+${toughness} ${until}`);
  });
}

export function debuff(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'debuff'}>): void {
  const { power = 0, toughness = 0, until, selector } = effect;
  
  const targets = findCreaturesBySelector(state, selector);
  targets.forEach(target => {
    target.modifications.power -= power;
    target.modifications.toughness -= toughness;
    
    const definition = getCardDefinition(state, target.definitionId);
    logGameEvent(state, controllerId, 'debuff_creature', 
      `${definition.name} gets -${power}/-${toughness} ${until}`);
  });
}

export function summon(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'summon'}>): void {
  const { cardCode, zone, quantity = 1 } = effect;
  
  for (let i = 0; i < quantity; i++) {
    const tokenId = `token_${cardCode}_${Date.now()}_${i}`;
    const player = getPlayer(state, controllerId);
    
    // Create a simple token card instance
    state.cardInstances[tokenId] = {
      id: tokenId,
      definitionId: cardCode, // This would reference a token definition
      ownerId: controllerId,
      controllerId: controllerId,
      zone,
      tapped: false,
      summoned_this_turn: true,
      damage: 0,
      counters: {},
      modifications: { power: 0, toughness: 0, keywords: [], abilities: [] },
      attachments: []
    };
    
    // Add to appropriate zone
    if (zone === 'battlefield') {
      player.battlefield.push(tokenId);
    } else if (zone === 'hand') {
      player.hand.push(tokenId);
    }
    
    logGameEvent(state, controllerId, 'summon_token', `Summoned ${cardCode} token`);
  }
}

export function destroy(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'destroy'}>): void {
  const { selector, condition } = effect;
  
  const targets = findPermanentsBySelector(state, selector);
  targets.forEach(target => {
    if (!condition || evaluateCondition(state, target, condition)) {
      moveCard(state, target.id, target.zone, 'graveyard');
      const definition = getCardDefinition(state, target.definitionId);
      logGameEvent(state, controllerId, 'destroy_permanent', `Destroyed ${definition.name}`);
    }
  });
}

export function exile(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'exile'}>): void {
  const { selector, condition } = effect;
  
  const targets = findPermanentsBySelector(state, selector);
  targets.forEach(target => {
    if (!condition || evaluateCondition(state, target, condition)) {
      moveCard(state, target.id, target.zone, 'exile');
      const definition = getCardDefinition(state, target.definitionId);
      logGameEvent(state, controllerId, 'exile_permanent', `Exiled ${definition.name}`);
    }
  });
}

export function returnCard(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'return'}>): void {
  const { from, to, selector } = effect;
  
  const player = getPlayer(state, controllerId);
  const sourceZone = player[from as keyof typeof player] as string[];
  
  // Find cards matching selector in the from zone
  const targets = sourceZone.filter(cardId => {
    const instance = state.cardInstances[cardId];
    return instance && matchesSelector(state, instance, selector);
  });
  
  targets.forEach(cardId => {
    moveCard(state, cardId, from, to);
    const definition = getCardDefinition(state, state.cardInstances[cardId].definitionId);
    logGameEvent(state, controllerId, 'return_card', `Returned ${definition.name} from ${from} to ${to}`);
  });
}

export function search(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'search'}>): void {
  const { zone, criteria, quantity } = effect;
  
  const player = getPlayer(state, controllerId);
  const searchZone = player[zone as keyof typeof player] as string[];
  
  // Find cards matching criteria
  const matches = searchZone.filter(cardId => {
    const instance = state.cardInstances[cardId];
    return instance && matchesCriteria(state, instance, criteria);
  }).slice(0, quantity);
  
  // For now, just move to hand - in real game would allow player choice
  matches.forEach(cardId => {
    if (zone !== 'hand') {
      moveCard(state, cardId, zone, 'hand');
    }
  });
  
  logGameEvent(state, controllerId, 'search_cards', `Searched ${zone} for ${criteria}, found ${matches.length} cards`);
}

export function mill(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'mill'}>): void {
  const { count, target } = effect;
  
  const targetPlayer = target === 'self' ? 
    getPlayer(state, controllerId) : 
    getOpponent(state, controllerId);
  
  const milled: string[] = [];
  for (let i = 0; i < count && targetPlayer.library.length > 0; i++) {
    const cardId = targetPlayer.library.pop()!;
    targetPlayer.graveyard.push(cardId);
    const instance = state.cardInstances[cardId];
    if (instance) instance.zone = 'graveyard';
    milled.push(cardId);
  }
  
  logGameEvent(state, controllerId, 'mill_cards', `Milled ${milled.length} cards from ${target}`);
}

export function discard(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'discard'}>): void {
  const { count, target, random = false } = effect;
  
  const targetPlayer = target === 'self' ? 
    getPlayer(state, controllerId) : 
    getOpponent(state, controllerId);
  
  const discarded: string[] = [];
  for (let i = 0; i < count && targetPlayer.hand.length > 0; i++) {
    const index = random ? Math.floor(Math.random() * targetPlayer.hand.length) : 0;
    const cardId = targetPlayer.hand.splice(index, 1)[0];
    targetPlayer.graveyard.push(cardId);
    const instance = state.cardInstances[cardId];
    if (instance) instance.zone = 'graveyard';
    discarded.push(cardId);
  }
  
  logGameEvent(state, controllerId, 'discard_cards', `${target} discarded ${discarded.length} cards`);
}

export function counter(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'counter'}>): void {
  const { target, selector } = effect;
  
  if (target === 'spell' || target === 'ability') {
    // Remove top item from stack or specific item by selector
    if (selector) {
      const removed = removeFromStack(state, selector);
      if (removed) {
        logGameEvent(state, controllerId, 'counter_specific', `Countered ${selector}`);
      }
    } else if (state.stack.length > 0) {
      const countered = state.stack.pop()!;
      logGameEvent(state, controllerId, 'counter_spell', `Countered ${countered.description}`);
    }
  }
}

export function tap(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'tap'}>): void {
  const { selector } = effect;
  
  const targets = findPermanentsBySelector(state, selector);
  targets.forEach(target => {
    if (!target.tapped) {
      target.tapped = true;
      const definition = getCardDefinition(state, target.definitionId);
      logGameEvent(state, controllerId, 'tap_permanent', `Tapped ${definition.name}`);
    }
  });
}

export function untap(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'untap'}>): void {
  const { selector } = effect;
  
  const targets = findPermanentsBySelector(state, selector);
  targets.forEach(target => {
    if (target.tapped) {
      target.tapped = false;
      const definition = getCardDefinition(state, target.definitionId);
      logGameEvent(state, controllerId, 'untap_permanent', `Untapped ${definition.name}`);
    }
  });
}

export function gainMana(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'gain_mana'}>): void {
  const { colors, amount } = effect;
  const player = getPlayer(state, controllerId);
  
  colors.forEach(color => {
    player.manaPool[color] += amount;
  });
  
  logGameEvent(state, controllerId, 'gain_mana', `Gained ${amount} of ${colors.join(', ')} mana`);
}

export function createToken(state: MatchState, controllerId: string, effect: Extract<EffectOp, {op: 'create_token'}>): void {
  const { name, power, toughness, types, keywords = [] } = effect;
  
  const tokenId = `token_${name.replace(/\s+/g, '_')}_${Date.now()}`;
  const player = getPlayer(state, controllerId);
  
  // Create token definition
  const tokenDefinition = {
    id: tokenId,
    setCode: 'TOKEN',
    name,
    rarity: 'token' as const,
    typeLine: types.join(' '),
    power,
    toughness,
    keywords,
    rules: {}
  };
  
  state.cardDefinitions[tokenId] = tokenDefinition;
  
  // Create token instance
  state.cardInstances[tokenId] = {
    id: tokenId,
    definitionId: tokenId,
    ownerId: controllerId,
    controllerId: controllerId,
    zone: 'battlefield',
    tapped: false,
    summoned_this_turn: true,
    damage: 0,
    counters: {},
    modifications: { power: 0, toughness: 0, keywords: [], abilities: [] },
    attachments: []
  };
  
  player.battlefield.push(tokenId);
  
  logGameEvent(state, controllerId, 'create_token', `Created ${name} token (${power}/${toughness})`);
}

// Helper functions for selectors
function findCreatureBySelector(state: MatchState, selector: string) {
  // Simplified selector matching
  if (selector === 'self') {
    // Would need context of the source card
    return null;
  }
  
  // Find first creature matching selector
  const creatures = Object.values(state.cardInstances).filter(instance => 
    instance.zone === 'battlefield' && 
    getCardDefinition(state, instance.definitionId).typeLine.includes('Creature')
  );
  
  return creatures[0] || null;
}

function findCreaturesBySelector(state: MatchState, selector: string) {
  const creatures = Object.values(state.cardInstances).filter(instance => 
    instance.zone === 'battlefield' && 
    getCardDefinition(state, instance.definitionId).typeLine.includes('Creature')
  );
  
  // More sophisticated selector logic would go here
  return creatures;
}

function findPermanentsBySelector(state: MatchState, selector: string) {
  return Object.values(state.cardInstances).filter(instance => 
    instance.zone === 'battlefield'
  );
}

function matchesSelector(state: MatchState, instance: any, selector: string): boolean {
  // Simplified selector matching
  return true;
}

function matchesCriteria(state: MatchState, instance: any, criteria: string): boolean {
  // Simplified criteria matching
  return true;
}

function evaluateCondition(state: MatchState, target: any, condition: string): boolean {
  // Simplified condition evaluation
  return true;
}
