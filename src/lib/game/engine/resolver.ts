import type { MatchState, StackItem, EffectOp } from '../types';
import { popStack, isStackEmpty } from './stack';
import { getPlayer, getCardInstance, getCardDefinition, logGameEvent, moveCard, drawCards } from './state';
import * as effects from '../effects';

export function resolveTopOfStack(state: MatchState): boolean {
  const item = popStack(state);
  if (!item) return false;
  
  try {
    applyEffect(state, item.effect, item.controller, item.source);
    return true;
  } catch (error) {
    logGameEvent(state, 'system', 'resolve_error', `Error resolving effect: ${error}`, {
      stackItem: item.id,
      error: String(error)
    });
    return false;
  }
}

export function applyEffect(
  state: MatchState, 
  effect: EffectOp, 
  controllerId: string, 
  sourceId: string
): void {
  logGameEvent(state, controllerId, 'effect_apply', `Applying ${effect.op}`, {
    effect,
    source: sourceId
  });

  switch (effect.op) {
    case 'draw':
      effects.draw(state, controllerId, effect);
      break;
    case 'damage':
      effects.damage(state, controllerId, effect);
      break;
    case 'heal':
      effects.heal(state, controllerId, effect);
      break;
    case 'buff':
      effects.buff(state, controllerId, effect);
      break;
    case 'debuff':
      effects.debuff(state, controllerId, effect);
      break;
    case 'summon':
      effects.summon(state, controllerId, effect);
      break;
    case 'destroy':
      effects.destroy(state, controllerId, effect);
      break;
    case 'exile':
      effects.exile(state, controllerId, effect);
      break;
    case 'return':
      effects.returnCard(state, controllerId, effect);
      break;
    case 'search':
      effects.search(state, controllerId, effect);
      break;
    case 'mill':
      effects.mill(state, controllerId, effect);
      break;
    case 'discard':
      effects.discard(state, controllerId, effect);
      break;
    case 'counter':
      effects.counter(state, controllerId, effect);
      break;
    case 'tap':
      effects.tap(state, controllerId, effect);
      break;
    case 'untap':
      effects.untap(state, controllerId, effect);
      break;
    case 'gain_mana':
      effects.gainMana(state, controllerId, effect);
      break;
    case 'create_token':
      effects.createToken(state, controllerId, effect);
      break;
    default:
      logGameEvent(state, 'system', 'unknown_effect', `Unknown effect: ${(effect as any).op}`);
  }
}

export function resolveAllEffects(state: MatchState): void {
  let resolved = 0;
  const maxResolutions = 100; // Prevent infinite loops
  
  while (!isStackEmpty(state) && resolved < maxResolutions) {
    if (resolveTopOfStack(state)) {
      resolved++;
    } else {
      break; // Stop if resolution fails
    }
  }
  
  if (resolved >= maxResolutions) {
    logGameEvent(state, 'system', 'resolve_limit', 'Maximum resolution limit reached');
  }
  
  if (resolved > 0) {
    logGameEvent(state, 'system', 'resolve_complete', `Resolved ${resolved} effects`);
  }
}

// State-based actions check
export function checkStateBasedActions(state: MatchState): void {
  let actionsPerformed = true;
  let iterations = 0;
  const maxIterations = 10;
  
  while (actionsPerformed && iterations < maxIterations) {
    actionsPerformed = false;
    iterations++;
    
    // Check for destroyed creatures (damage >= toughness)
    Object.values(state.cardInstances).forEach(instance => {
      if (instance.zone === 'battlefield') {
        const definition = getCardDefinition(state, instance.definitionId);
        if (definition.typeLine.includes('Creature')) {
          const totalToughness = (definition.toughness || 0) + instance.modifications.toughness;
          if (instance.damage >= totalToughness && totalToughness > 0) {
            moveCard(state, instance.id, 'battlefield', 'graveyard');
            logGameEvent(state, 'system', 'creature_destroyed', `${definition.name} destroyed by damage`);
            actionsPerformed = true;
          }
        }
      }
    });
    
    // Check for players with 0 or less life
    state.players.forEach(player => {
      if (player.life <= 0 && !state.metadata.winner) {
        state.metadata.winner = getOpponentId(state, player.id);
        logGameEvent(state, 'system', 'player_loses', `${player.id} loses the game (life <= 0)`);
        actionsPerformed = true;
      }
    });
    
    // Check for players with empty library when drawing
    state.players.forEach(player => {
      if (player.library.length === 0 && !state.metadata.winner) {
        state.metadata.winner = getOpponentId(state, player.id);
        logGameEvent(state, 'system', 'player_loses', `${player.id} loses the game (empty library)`);
        actionsPerformed = true;
      }
    });
    
    // Clean up tapped creatures that no longer exist
    Object.values(state.cardInstances).forEach(instance => {
      if (instance.zone !== 'battlefield' && instance.tapped) {
        instance.tapped = false;
        actionsPerformed = true;
      }
    });
  }
  
  if (iterations >= maxIterations) {
    logGameEvent(state, 'system', 'sba_limit', 'State-based actions iteration limit reached');
  }
}

function getOpponentId(state: MatchState, playerId: string): string {
  const opponent = state.players.find(p => p.id !== playerId);
  return opponent?.id || 'unknown';
}

// Trigger system
export function checkTriggers(state: MatchState, eventType: string, eventData?: any): void {
  // Check all permanents on battlefield for relevant triggers
  Object.values(state.cardInstances).forEach(instance => {
    if (instance.zone === 'battlefield') {
      const definition = getCardDefinition(state, instance.definitionId);
      definition.rules.triggers?.forEach(trigger => {
        if (triggerMatches(trigger.condition, eventType, eventData)) {
          // Add triggered ability to stack
          trigger.effects.forEach(effect => {
            resolveTriggeredAbility(state, instance, effect, trigger.description || 'Triggered ability');
          });
        }
      });
    }
  });
}

function triggerMatches(condition: any, eventType: string, eventData?: any): boolean {
  // Simplified trigger matching - in production this would be more sophisticated
  return condition.when === eventType;
}

function resolveTriggeredAbility(
  state: MatchState, 
  source: any, 
  effect: EffectOp, 
  description: string
): void {
  // For now, resolve immediately - in full implementation would go on stack
  applyEffect(state, effect, source.controllerId, source.id);
}
