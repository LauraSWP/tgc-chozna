import type { MatchState, Phase } from '../types';
import { PHASES } from '../constants';
import { logGameEvent, getPlayer, drawCards } from './state';
import { resolveAllEffects, checkStateBasedActions, checkTriggers } from './resolver';
import { isStackEmpty, clearStack } from './stack';

export function advancePhase(state: MatchState): void {
  const currentPhaseIndex = PHASES.indexOf(state.phase);
  const nextPhase = PHASES[(currentPhaseIndex + 1) % PHASES.length];
  
  // Handle end of turn cleanup
  if (state.phase === 'ending:cleanup') {
    endTurn(state);
    return;
  }
  
  // Perform phase-specific actions
  performPhaseActions(state, state.phase, 'end');
  
  // Change to next phase
  const oldPhase = state.phase;
  state.phase = nextPhase;
  
  // Log phase change
  logGameEvent(state, state.activePlayer, 'phase_change', `${oldPhase} → ${nextPhase}`);
  
  // Perform new phase actions
  performPhaseActions(state, nextPhase, 'begin');
  
  // Check for triggers
  checkTriggers(state, 'phase_begin', { phase: nextPhase });
  
  // Reset priority to active player
  state.priorityPlayer = state.activePlayer;
}

export function endTurn(state: MatchState): void {
  // Cleanup phase actions
  performCleanupPhase(state);
  
  // Switch active player
  const currentPlayerIndex = state.players.findIndex(p => p.id === state.activePlayer);
  const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
  state.activePlayer = state.players[nextPlayerIndex].id;
  state.priorityPlayer = state.activePlayer;
  
  // Increment turn counter
  state.turn++;
  
  // Start new turn
  state.phase = 'beginning:untap';
  logGameEvent(state, state.activePlayer, 'turn_start', `Turn ${state.turn} begins`);
  
  // Perform beginning phase
  performPhaseActions(state, 'beginning:untap', 'begin');
}

function performPhaseActions(state: MatchState, phase: Phase, timing: 'begin' | 'end'): void {
  const activePlayer = getPlayer(state, state.activePlayer);
  
  switch (phase) {
    case 'beginning:untap':
      if (timing === 'begin') {
        untapPermanents(state, state.activePlayer);
      }
      break;
      
    case 'beginning:upkeep':
      if (timing === 'begin') {
        checkTriggers(state, 'upkeep', { player: state.activePlayer });
      }
      break;
      
    case 'beginning:draw':
      if (timing === 'begin' && state.turn > 1) { // No draw on first turn
        drawCards(state, state.activePlayer, 1);
      }
      break;
      
    case 'main:precombat':
      if (timing === 'begin') {
        // Clear summoning sickness flag from permanents
        clearSummoningSickness(state, state.activePlayer);
      }
      break;
      
    case 'combat:begin':
      if (timing === 'begin') {
        resetCombatData(state);
      }
      break;
      
    case 'combat:declare_attackers':
      // Handled by player actions
      break;
      
    case 'combat:declare_blockers':
      // Handled by player actions
      break;
      
    case 'combat:damage':
      if (timing === 'begin') {
        resolveCombatDamage(state);
      }
      break;
      
    case 'combat:end':
      if (timing === 'end') {
        endCombat(state);
      }
      break;
      
    case 'ending:end_step':
      if (timing === 'begin') {
        checkTriggers(state, 'end_step', { player: state.activePlayer });
      }
      break;
      
    case 'ending:cleanup':
      if (timing === 'begin') {
        performCleanupPhase(state);
      }
      break;
  }
}

function untapPermanents(state: MatchState, playerId: string): void {
  Object.values(state.cardInstances).forEach(instance => {
    if (instance.controllerId === playerId && instance.zone === 'battlefield' && instance.tapped) {
      instance.tapped = false;
      logGameEvent(state, playerId, 'untap', `Untapped ${state.cardDefinitions[instance.definitionId]?.name}`);
    }
  });
}

function clearSummoningSickness(state: MatchState, playerId: string): void {
  Object.values(state.cardInstances).forEach(instance => {
    if (instance.controllerId === playerId && instance.zone === 'battlefield') {
      instance.summoned_this_turn = false;
    }
  });
}

function resetCombatData(state: MatchState): void {
  // Reset combat-related flags
  Object.values(state.cardInstances).forEach(instance => {
    // Remove temporary combat modifications
    if (instance.zone === 'battlefield') {
      // Reset combat-specific modifications would go here
    }
  });
  
  logGameEvent(state, state.activePlayer, 'combat_begin', 'Combat phase begins');
}

function resolveCombatDamage(state: MatchState): void {
  // Simplified combat damage resolution
  // In a full implementation, this would handle:
  // - First strike damage
  // - Regular damage
  // - Trample
  // - Protection
  // - Damage prevention/redirection
  
  logGameEvent(state, 'system', 'combat_damage', 'Combat damage resolved');
}

function endCombat(state: MatchState): void {
  // Remove creatures from combat
  // Clear attacking/blocking status
  // Remove "until end of combat" effects
  
  logGameEvent(state, 'system', 'combat_end', 'Combat phase ends');
}

function performCleanupPhase(state: MatchState): void {
  const activePlayer = getPlayer(state, state.activePlayer);
  
  // Discard down to maximum hand size
  const maxHandSize = 7; // Could be modified by effects
  const excessCards = activePlayer.hand.length - maxHandSize;
  
  if (excessCards > 0) {
    // In a real game, player would choose which cards to discard
    // For now, discard from the end of hand
    for (let i = 0; i < excessCards; i++) {
      const discardedCard = activePlayer.hand.pop();
      if (discardedCard) {
        activePlayer.graveyard.push(discardedCard);
        const instance = state.cardInstances[discardedCard];
        if (instance) {
          instance.zone = 'graveyard';
        }
      }
    }
    logGameEvent(state, state.activePlayer, 'cleanup_discard', `Discarded ${excessCards} cards`);
  }
  
  // Remove damage from creatures
  Object.values(state.cardInstances).forEach(instance => {
    if (instance.zone === 'battlefield' && instance.damage > 0) {
      instance.damage = 0;
    }
  });
  
  // Remove "until end of turn" effects
  Object.values(state.cardInstances).forEach(instance => {
    // Reset temporary modifications
    instance.modifications.power = 0;
    instance.modifications.toughness = 0;
    instance.modifications.keywords = [];
    instance.modifications.abilities = [];
  });
  
  // Clear mana pools
  state.players.forEach(player => {
    const hadMana = Object.values(player.manaPool).some(amount => amount > 0);
    player.manaPool = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    if (hadMana) {
      logGameEvent(state, player.id, 'mana_drain', 'Mana pool empties');
    }
  });
}

export function canAdvancePhase(state: MatchState): boolean {
  // Can only advance if stack is empty and all players have passed priority
  return isStackEmpty(state) && allPlayersPassedPriority(state);
}

function allPlayersPassedPriority(state: MatchState): boolean {
  // Simplified - in real implementation would track consecutive passes
  return true;
}

export function skipToMainPhase(state: MatchState): void {
  if (state.phase === 'main:precombat' || state.phase === 'main:postcombat') {
    return; // Already in main phase
  }
  
  // Skip to appropriate main phase
  if (state.phase.startsWith('beginning:') || state.phase.startsWith('main:precombat')) {
    state.phase = 'main:precombat';
  } else {
    state.phase = 'main:postcombat';
  }
  
  logGameEvent(state, state.activePlayer, 'phase_skip', `Skipped to ${state.phase}`);
  performPhaseActions(state, state.phase, 'begin');
}

export function skipTurn(state: MatchState): void {
  logGameEvent(state, state.activePlayer, 'turn_skip', 'Turn skipped');
  endTurn(state);
}
