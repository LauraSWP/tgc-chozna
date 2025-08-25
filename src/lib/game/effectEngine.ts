// Real effect execution engine for gameplay
import type { CardDefinition, MatchState, PlayerState, GameEvent, EffectOp } from './types';

export interface EffectContext {
  sourceCard: CardDefinition;
  sourceInstance: string;
  controller: string;
  gameState: MatchState;
  trigger: string;
  targetOverride?: string;
}

export class EffectEngine {
  
  // Execute effects based on triggers
  static async executeEffects(
    effects: EffectOp[], 
    context: EffectContext
  ): Promise<{ newGameState: MatchState; events: GameEvent[] }> {
    let gameState = { ...context.gameState };
    const events: GameEvent[] = [];

    for (const effect of effects) {
      const result = await this.executeEffect(effect, context, gameState);
      gameState = result.newGameState;
      events.push(...result.events);
    }

    return { newGameState: gameState, events };
  }

  private static async executeEffect(
    effect: EffectOp,
    context: EffectContext,
    gameState: MatchState
  ): Promise<{ newGameState: MatchState; events: GameEvent[] }> {
    const events: GameEvent[] = [];
    let newGameState = { ...gameState };

    // Resolve target
    const targets = this.resolveTargets(effect, context, gameState);
    
    switch (effect.op) {
      case 'draw':
        return this.executeDraw(effect, context, gameState, targets);
      
      case 'damage':
        return this.executeDamage(effect, context, gameState, targets);
      
      case 'heal':
        return this.executeHeal(effect, context, gameState, targets);
      
      case 'buff':
        return this.executeBuff(effect, context, gameState, targets);
      
      case 'debuff':
        return this.executeDebuff(effect, context, gameState, targets);
      
      case 'destroy':
        return this.executeDestroy(effect, context, gameState, targets);
      
      case 'exile':
        return this.executeExile(effect, context, gameState, targets);
      
      case 'return':
        return this.executeReturn(effect, context, gameState, targets);
      
      case 'create_token':
        return this.executeCreateToken(effect, context, gameState, targets);
      
      case 'search':
        return this.executeSearch(effect, context, gameState, targets);
      
      case 'mill':
        return this.executeMill(effect, context, gameState, targets);
      
      case 'discard':
        return this.executeDiscard(effect, context, gameState, targets);
      
      case 'gain_mana':
        return this.executeGainMana(effect, context, gameState, targets);
      
      case 'counter':
        return this.executeCounter(effect, context, gameState, targets);
      
      case 'tap':
        return this.executeTap(effect, context, gameState, targets);
      
      case 'untap':
        return this.executeUntap(effect, context, gameState, targets);
      
      default:
        console.warn(`Unknown effect operation: ${(effect as any).op}`);
        return { newGameState, events };
    }
  }

  private static resolveTargets(
    effect: EffectOp,
    context: EffectContext,
    gameState: MatchState
  ): string[] {
    const { controller, sourceInstance } = context;
    
    // Use targetOverride if provided (for targeted spells)
    if (context.targetOverride) {
      return [context.targetOverride];
    }

    switch (effect.target) {
      case 'self':
        return [sourceInstance];
      
      case 'ally':
      case 'controller':
        return [controller];
      
      case 'opponent':
        return gameState.players.filter(p => p.id !== controller).map(p => p.id);
      
      case 'all':
        return gameState.players.map(p => p.id);
      
      case 'any':
        // For targeted effects, this should be resolved during spell casting
        return [];
      
      default:
        if (typeof effect.target === 'string') {
          return [effect.target];
        }
        return [];
    }
  }

  private static executeDraw(
    effect: EffectOp & { op: 'draw' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    targets.forEach(targetId => {
      const player = newGameState.players.find(p => p.id === targetId);
      if (!player) return;

      const cardsToDraw = Math.min(effect.count, player.library.length);
      const drawnCards = player.library.splice(-cardsToDraw, cardsToDraw);
      player.hand.push(...drawnCards);

      events.push({
        id: `draw_${Date.now()}_${Math.random()}`,
        type: 'draw',
        timestamp: Date.now(),
        playerId: targetId,
        description: `${player.id} roba ${cardsToDraw} carta${cardsToDraw > 1 ? 's' : ''}`,
        data: { count: cardsToDraw, cards: drawnCards }
      });
    });

    return { newGameState, events };
  }

  private static executeDamage(
    effect: EffectOp & { op: 'damage' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    targets.forEach(targetId => {
      // Check if target is a player or creature
      const player = newGameState.players.find(p => p.id === targetId);
      if (player) {
        // Damage to player
        player.life -= effect.amount;
        
        events.push({
          id: `damage_${Date.now()}_${Math.random()}`,
          type: 'damage',
          timestamp: Date.now(),
          playerId: targetId,
          description: `${targetId} recibe ${effect.amount} de daño`,
          data: { amount: effect.amount, newLife: player.life }
        });
      } else {
        // Damage to creature
        const cardInstance = newGameState.cardInstances[targetId];
        if (cardInstance) {
          cardInstance.damage += effect.amount;
          
          events.push({
            id: `damage_${Date.now()}_${Math.random()}`,
            type: 'damage',
            timestamp: Date.now(),
            playerId: cardInstance.controllerId,
            description: `${newGameState.cardDefinitions[cardInstance.definitionId]?.name} recibe ${effect.amount} de daño`,
            data: { amount: effect.amount, totalDamage: cardInstance.damage, targetId }
          });

          // Check for death
          const cardDef = newGameState.cardDefinitions[cardInstance.definitionId];
          if (cardDef && cardInstance.damage >= (cardDef.toughness || 0)) {
            // Move to graveyard
            const owner = newGameState.players.find(p => p.id === cardInstance.ownerId);
            if (owner) {
              owner.battlefield = owner.battlefield.filter(id => id !== targetId);
              owner.graveyard.push(targetId);
              
              events.push({
                id: `death_${Date.now()}_${Math.random()}`,
                type: 'death',
                timestamp: Date.now(),
                playerId: cardInstance.ownerId,
                description: `${cardDef.name} muere`,
                data: { cardId: targetId }
              });
            }
          }
        }
      }
    });

    return { newGameState, events };
  }

  private static executeHeal(
    effect: EffectOp & { op: 'heal' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    targets.forEach(targetId => {
      const player = newGameState.players.find(p => p.id === targetId);
      if (player) {
        player.life += effect.amount;
        
        events.push({
          id: `heal_${Date.now()}_${Math.random()}`,
          type: 'heal',
          timestamp: Date.now(),
          playerId: targetId,
          description: `${targetId} gana ${effect.amount} vida`,
          data: { amount: effect.amount, newLife: player.life }
        });
      }
    });

    return { newGameState, events };
  }

  private static executeBuff(
    effect: EffectOp & { op: 'buff' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    targets.forEach(targetId => {
      const cardInstance = newGameState.cardInstances[targetId];
      if (cardInstance) {
        cardInstance.modifications.power += effect.power || 0;
        cardInstance.modifications.toughness += effect.toughness || 0;
        
        const cardDef = newGameState.cardDefinitions[cardInstance.definitionId];
        events.push({
          id: `buff_${Date.now()}_${Math.random()}`,
          type: 'buff',
          timestamp: Date.now(),
          playerId: cardInstance.controllerId,
          description: `${cardDef?.name} obtiene +${effect.power || 0}/+${effect.toughness || 0}`,
          data: { 
            targetId, 
            powerBonus: effect.power || 0, 
            toughnessBonus: effect.toughness || 0,
            until: effect.until
          }
        });
      }
    });

    return { newGameState, events };
  }

  private static executeDebuff(
    effect: EffectOp & { op: 'debuff' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    targets.forEach(targetId => {
      const cardInstance = newGameState.cardInstances[targetId];
      if (cardInstance) {
        cardInstance.modifications.power -= effect.power || 0;
        cardInstance.modifications.toughness -= effect.toughness || 0;
        
        const cardDef = newGameState.cardDefinitions[cardInstance.definitionId];
        events.push({
          id: `debuff_${Date.now()}_${Math.random()}`,
          type: 'debuff',
          timestamp: Date.now(),
          playerId: cardInstance.controllerId,
          description: `${cardDef?.name} obtiene -${effect.power || 0}/-${effect.toughness || 0}`,
          data: { 
            targetId, 
            powerReduction: effect.power || 0, 
            toughnessReduction: effect.toughness || 0,
            until: effect.until
          }
        });
      }
    });

    return { newGameState, events };
  }

  private static executeDestroy(
    effect: EffectOp & { op: 'destroy' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    targets.forEach(targetId => {
      const cardInstance = newGameState.cardInstances[targetId];
      if (cardInstance) {
        // Check for indestructible
        if (cardInstance.modifications.keywords.includes('indestructible')) {
          events.push({
            id: `destroy_prevented_${Date.now()}_${Math.random()}`,
            type: 'destroy_prevented',
            timestamp: Date.now(),
            playerId: cardInstance.controllerId,
            description: `${newGameState.cardDefinitions[cardInstance.definitionId]?.name} es indestructible`,
            data: { targetId }
          });
          return;
        }

        // Move to graveyard
        const owner = newGameState.players.find(p => p.id === cardInstance.ownerId);
        if (owner) {
          owner.battlefield = owner.battlefield.filter(id => id !== targetId);
          owner.graveyard.push(targetId);
          
          const cardDef = newGameState.cardDefinitions[cardInstance.definitionId];
          events.push({
            id: `destroy_${Date.now()}_${Math.random()}`,
            type: 'destroy',
            timestamp: Date.now(),
            playerId: cardInstance.ownerId,
            description: `${cardDef?.name} es destruido`,
            data: { cardId: targetId }
          });
        }
      }
    });

    return { newGameState, events };
  }

  private static executeCreateToken(
    effect: EffectOp & { op: 'create_token' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    const controller = newGameState.players.find(p => p.id === context.controller);
    if (!controller) return { newGameState, events };

    // Create token definition
    const tokenId = `token_${Date.now()}_${Math.random()}`;
    const tokenDefinition: CardDefinition = {
      id: tokenId,
      setCode: 'TOKEN',
      name: effect.name,
      rarity: 'token',
      typeLine: `Criatura — ${effect.types?.join(' ') || 'Ficha'}`,
      power: effect.power,
      toughness: effect.toughness,
      keywords: effect.keywords || [],
      rules: {}
    };

    // Create token instance
    const tokenInstanceId = `instance_${tokenId}`;
    newGameState.cardDefinitions[tokenId] = tokenDefinition;
    newGameState.cardInstances[tokenInstanceId] = {
      id: tokenInstanceId,
      definitionId: tokenId,
      ownerId: context.controller,
      controllerId: context.controller,
      zone: 'battlefield',
      tapped: false,
      summoned_this_turn: true,
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

    // Add to battlefield
    controller.battlefield.push(tokenInstanceId);

    events.push({
      id: `create_token_${Date.now()}_${Math.random()}`,
      type: 'create_token',
      timestamp: Date.now(),
      playerId: context.controller,
      description: `Se crea una ficha ${effect.name} ${effect.power}/${effect.toughness}`,
      data: { tokenId: tokenInstanceId, definition: tokenDefinition }
    });

    return { newGameState, events };
  }

  // Additional effect implementations...
  private static executeMill(
    effect: EffectOp & { op: 'mill' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    targets.forEach(targetId => {
      const player = newGameState.players.find(p => p.id === targetId);
      if (!player) return;

      const cardsToMill = Math.min(effect.count, player.library.length);
      const milledCards = player.library.splice(-cardsToMill, cardsToMill);
      player.graveyard.push(...milledCards);

      events.push({
        id: `mill_${Date.now()}_${Math.random()}`,
        type: 'mill',
        timestamp: Date.now(),
        playerId: targetId,
        description: `${targetId} envía ${cardsToMill} carta${cardsToMill > 1 ? 's' : ''} al cementerio`,
        data: { count: cardsToMill, cards: milledCards }
      });
    });

    return { newGameState, events };
  }

  private static executeGainMana(
    effect: EffectOp & { op: 'gain_mana' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    const player = newGameState.players.find(p => p.id === context.controller);
    if (!player) return { newGameState, events };

    effect.colors.forEach(color => {
      player.manaPool[color] = (player.manaPool[color] || 0) + effect.amount;
    });

    events.push({
      id: `gain_mana_${Date.now()}_${Math.random()}`,
      type: 'gain_mana',
      timestamp: Date.now(),
      playerId: context.controller,
      description: `Añade ${effect.amount} maná ${effect.colors.join(', ')}`,
      data: { amount: effect.amount, colors: effect.colors }
    });

    return { newGameState, events };
  }

  private static executeTap(
    effect: EffectOp & { op: 'tap' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    targets.forEach(targetId => {
      const cardInstance = newGameState.cardInstances[targetId];
      if (cardInstance && !cardInstance.tapped) {
        cardInstance.tapped = true;
        
        const cardDef = newGameState.cardDefinitions[cardInstance.definitionId];
        events.push({
          id: `tap_${Date.now()}_${Math.random()}`,
          type: 'tap',
          timestamp: Date.now(),
          playerId: cardInstance.controllerId,
          description: `${cardDef?.name} se gira`,
          data: { targetId }
        });
      }
    });

    return { newGameState, events };
  }

  private static executeUntap(
    effect: EffectOp & { op: 'untap' },
    context: EffectContext,
    gameState: MatchState,
    targets: string[]
  ): { newGameState: MatchState; events: GameEvent[] } {
    const newGameState = { ...gameState };
    const events: GameEvent[] = [];

    targets.forEach(targetId => {
      const cardInstance = newGameState.cardInstances[targetId];
      if (cardInstance && cardInstance.tapped) {
        cardInstance.tapped = false;
        
        const cardDef = newGameState.cardDefinitions[cardInstance.definitionId];
        events.push({
          id: `untap_${Date.now()}_${Math.random()}`,
          type: 'untap',
          timestamp: Date.now(),
          playerId: cardInstance.controllerId,
          description: `${cardDef?.name} se endereza`,
          data: { targetId }
        });
      }
    });

    return { newGameState, events };
  }

  // Placeholder implementations for remaining effects
  private static executeExile = this.executeDestroy; // Similar to destroy but goes to exile
  private static executeReturn = this.executeDestroy; // Return to hand/battlefield
  private static executeSearch = this.executeDraw; // Search library
  private static executeDiscard = this.executeMill; // Discard from hand
  private static executeCounter = this.executeDestroy; // Counter spells
}

// Trigger detection system
export class TriggerSystem {
  static checkTriggers(
    event: GameEvent,
    gameState: MatchState
  ): { cardId: string; effects: EffectOp[]; trigger: string }[] {
    const triggeredEffects: { cardId: string; effects: EffectOp[]; trigger: string }[] = [];

    // Check all cards in play for triggered abilities
    Object.values(gameState.cardInstances).forEach(cardInstance => {
      if (cardInstance.zone !== 'battlefield') return;

      const cardDef = gameState.cardDefinitions[cardInstance.definitionId];
      if (!cardDef || !cardDef.rules) return;

      // Check each trigger type
      Object.entries(cardDef.rules).forEach(([trigger, effects]) => {
        if (!Array.isArray(effects)) return;

        const shouldTrigger = this.shouldTrigger(event, trigger, cardInstance.id);
        if (shouldTrigger) {
          triggeredEffects.push({
            cardId: cardInstance.id,
            effects: effects as EffectOp[],
            trigger
          });
        }
      });
    });

    return triggeredEffects;
  }

  private static shouldTrigger(
    event: GameEvent,
    trigger: string,
    cardInstanceId: string
  ): boolean {
    switch (trigger) {
      case 'on_play':
        return event.type === 'spell_cast' && event.data?.cardInstanceId === cardInstanceId;
      
      case 'on_enter':
        return event.type === 'enters_battlefield' && event.data?.cardId === cardInstanceId;
      
      case 'on_leave':
        return (event.type === 'destroy' || event.type === 'exile') && event.data?.cardId === cardInstanceId;
      
      case 'on_death':
        return event.type === 'death' && event.data?.cardId === cardInstanceId;
      
      case 'on_attack':
        return event.type === 'attack' && event.data?.attackers?.includes(cardInstanceId);
      
      case 'on_damage_dealt':
        return event.type === 'damage' && event.data?.sourceId === cardInstanceId;
      
      case 'start_of_turn':
        return event.type === 'turn_start';
      
      case 'end_of_turn':
        return event.type === 'turn_end';
      
      default:
        return false;
    }
  }
}
