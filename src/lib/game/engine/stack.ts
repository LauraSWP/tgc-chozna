import type { MatchState, StackItem, EffectOp } from '../types';
import { logGameEvent } from './state';

export function pushToStack(
  state: MatchState, 
  source: string, 
  controller: string, 
  effect: EffectOp, 
  description: string
): void {
  const stackItem: StackItem = {
    id: `stack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    source,
    controller,
    effect,
    description,
    timestamp: Date.now()
  };
  
  state.stack.push(stackItem);
  logGameEvent(state, controller, 'stack_add', `Added to stack: ${description}`, { 
    stackItem: stackItem.id,
    effect: effect.op 
  });
}

export function popStack(state: MatchState): StackItem | undefined {
  const item = state.stack.pop();
  if (item) {
    logGameEvent(state, 'system', 'stack_resolve', `Resolving: ${item.description}`, { 
      stackItem: item.id 
    });
  }
  return item;
}

export function peekStack(state: MatchState): StackItem | undefined {
  return state.stack[state.stack.length - 1];
}

export function isStackEmpty(state: MatchState): boolean {
  return state.stack.length === 0;
}

export function clearStack(state: MatchState): void {
  const cleared = state.stack.length;
  state.stack = [];
  if (cleared > 0) {
    logGameEvent(state, 'system', 'stack_clear', `Cleared ${cleared} items from stack`);
  }
}

export function countStackItems(state: MatchState, controllerId?: string): number {
  if (!controllerId) return state.stack.length;
  return state.stack.filter(item => item.controller === controllerId).length;
}

export function getStackDescription(state: MatchState): string[] {
  return state.stack.map(item => `${item.controller}: ${item.description}`);
}

// Check if a specific effect type is on the stack
export function hasEffectOnStack(state: MatchState, effectType: string): boolean {
  return state.stack.some(item => item.effect.op === effectType);
}

// Remove specific items from stack (for counterspells, etc.)
export function removeFromStack(state: MatchState, itemId: string): boolean {
  const index = state.stack.findIndex(item => item.id === itemId);
  if (index !== -1) {
    const removed = state.stack.splice(index, 1)[0];
    logGameEvent(state, 'system', 'stack_remove', `Removed from stack: ${removed.description}`, {
      stackItem: itemId
    });
    return true;
  }
  return false;
}

// Counter the top item on the stack
export function counterTopOfStack(state: MatchState, controllerId: string): boolean {
  const top = state.stack.pop();
  if (top) {
    logGameEvent(state, controllerId, 'counter_spell', `Countered: ${top.description}`, {
      originalController: top.controller,
      stackItem: top.id
    });
    return true;
  }
  return false;
}

// Check if an item can be countered
export function isCounterable(item: StackItem): boolean {
  // Most effects can be countered, but some might be uncounterable
  // This would check the source card's properties
  return true; // Simplified for now
}

// Priority management related to stack
export function passPriority(state: MatchState): void {
  // Switch priority to the next player
  const currentPlayerIndex = state.players.findIndex(p => p.id === state.priorityPlayer);
  const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
  state.priorityPlayer = state.players[nextPlayerIndex].id;
  
  logGameEvent(state, state.priorityPlayer, 'priority_pass', 'Priority passed');
}

// Check if all players have passed priority consecutively
export function allPlayersPassed(state: MatchState): boolean {
  // This would track if all players passed in sequence
  // For now, simplified implementation
  return isStackEmpty(state);
}
