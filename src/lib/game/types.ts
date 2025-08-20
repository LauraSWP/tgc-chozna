import type { PHASES, ZONES, CARD_TYPES, RARITIES, MANA_COLORS } from './constants';

// Base types
export type Phase = typeof PHASES[number];
export type Zone = typeof ZONES[number];
export type CardType = typeof CARD_TYPES[number];
export type Rarity = typeof RARITIES[number];
export type ManaColor = typeof MANA_COLORS[number];

// Effect operations for the DSL
export type EffectOp = 
  | { op: 'draw'; count: number; target: 'self' | 'ally' | 'opponent' | 'all' }
  | { op: 'damage'; amount: number; target: 'creature' | 'player' | 'any'; selector?: string }
  | { op: 'heal'; amount: number; target: 'self' | 'ally' | 'any'; selector?: string }
  | { op: 'buff'; power?: number; toughness?: number; until: 'end_of_turn' | 'permanent' | 'end_of_combat'; selector: string }
  | { op: 'debuff'; power?: number; toughness?: number; until: 'end_of_turn' | 'permanent' | 'end_of_combat'; selector: string }
  | { op: 'summon'; cardCode: string; zone: 'battlefield' | 'hand'; quantity?: number }
  | { op: 'destroy'; selector: string; condition?: string }
  | { op: 'exile'; selector: string; condition?: string }
  | { op: 'return'; from: Zone; to: Zone; selector: string }
  | { op: 'search'; zone: Zone; criteria: string; quantity: number }
  | { op: 'mill'; count: number; target: 'self' | 'opponent' }
  | { op: 'discard'; count: number; target: 'self' | 'opponent'; random?: boolean }
  | { op: 'counter'; target: 'spell' | 'ability'; selector?: string }
  | { op: 'tap'; selector: string }
  | { op: 'untap'; selector: string }
  | { op: 'gain_mana'; colors: ManaColor[]; amount: number }
  | { op: 'create_token'; name: string; power: number; toughness: number; types: string[]; keywords?: string[] };

// Trigger conditions
export type TriggerCondition =
  | { when: 'enters_battlefield'; source?: 'self' | 'any' | string }
  | { when: 'leaves_battlefield'; source?: 'self' | 'any' | string }
  | { when: 'dies'; source?: 'self' | 'any' | string }
  | { when: 'attacks'; source?: 'self' | 'any' | string }
  | { when: 'blocks'; source?: 'self' | 'any' | string }
  | { when: 'deals_damage'; source?: 'self' | 'any' | string }
  | { when: 'takes_damage'; source?: 'self' | 'any' | string }
  | { when: 'phase_begin'; phase: Phase }
  | { when: 'phase_end'; phase: Phase }
  | { when: 'spell_cast'; types?: CardType[] }
  | { when: 'ability_activated'; source?: string };

// Card definition structure  
export interface CardDefinition {
  id: string;
  setCode: string;
  externalCode?: string;
  name: string;
  rarity: Rarity;
  typeLine: string;
  manaCost?: string;
  power?: number;
  toughness?: number;
  keywords?: string[];
  rules: {
    static?: EffectOp[]; // permanent effects while on battlefield
    on_play?: EffectOp[]; // when spell is cast/resolves
    on_enter?: EffectOp[]; // when permanent enters battlefield
    on_leave?: EffectOp[]; // when permanent leaves battlefield
    on_death?: EffectOp[]; // when creature dies
    activated?: { cost: string; effects: EffectOp[]; description?: string }[];
    triggers?: { condition: TriggerCondition; effects: EffectOp[]; description?: string }[];
  };
  flavorText?: string;
  artist?: string;
  imageUrl?: string;
}

// Game state structures
export interface CardInstance {
  id: string; // unique instance ID
  definitionId: string; // references CardDefinition
  ownerId: string;
  controllerId: string;
  zone: Zone;
  tapped: boolean;
  summoned_this_turn: boolean;
  damage: number; // current damage on creature
  counters: Record<string, number>; // +1/+1 counters, etc.
  modifications: {
    power: number;
    toughness: number;
    keywords: string[];
    abilities: string[];
  };
  attachments: string[]; // IDs of cards attached to this one
}

export interface PlayerState {
  id: string;
  life: number;
  manaPool: Record<ManaColor, number>;
  library: string[]; // card instance IDs in order (top = last)
  hand: string[];
  battlefield: string[];
  graveyard: string[];
  exile: string[];
  commandZone: string[]; // for commanders, emblems, etc.
}

export interface StackItem {
  id: string;
  source: string; // card instance ID that created this
  controller: string; // player ID
  effect: EffectOp;
  description: string;
  timestamp: number;
}

export interface GameEvent {
  id: string;
  type: string;
  timestamp: number;
  playerId: string;
  description: string;
  data?: Record<string, unknown>;
}

export interface MatchState {
  id: string;
  players: PlayerState[];
  activePlayer: string;
  priorityPlayer: string;
  turn: number;
  phase: Phase;
  step: string;
  stack: StackItem[];
  cardInstances: Record<string, CardInstance>; // all card instances in game
  cardDefinitions: Record<string, CardDefinition>; // card definitions for lookup
  pendingActions: string[]; // actions waiting for player input
  gameLog: GameEvent[];
  metadata: {
    format: string;
    startedAt: string;
    lastAction: string;
    winner?: string;
  };
}

// Action types for game interactions
export type GameAction = 
  | { type: 'play_card'; cardId: string; target?: string; manaUsed?: Record<ManaColor, number> }
  | { type: 'activate_ability'; sourceId: string; abilityIndex: number; target?: string }
  | { type: 'attack'; attackers: string[]; targets?: string[] }
  | { type: 'block'; blocks: { attacker: string; blocker: string }[] }
  | { type: 'pass_priority' }
  | { type: 'pass_turn' }
  | { type: 'mulligan' }
  | { type: 'concede' }
  | { type: 'tap_for_mana'; cardId: string; manaType: ManaColor }
  | { type: 'declare_target'; spellId: string; targets: string[] };

// Validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

// Deck validation
export interface DeckValidationResult extends ValidationResult {
  cardCount: number;
  formatLegal: boolean;
  issues: string[];
}

// Pack opening result
export interface PackResult {
  cards: {
    definitionId: string;
    foil: boolean;
    userCardId: string;
  }[];
  totalValue: number;
  rareOrBetter: number;
}

// Trade types
export interface TradeOffer {
  id: string;
  from: string;
  to: string;
  offeredCards: string[]; // user_card_ids
  requestedCards: string[]; // user_card_ids  
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  expiresAt: string;
  createdAt: string;
}

// UI State types
export interface GameUIState {
  selectedCards: string[];
  targetingMode: boolean;
  validTargets: string[];
  pendingSpell?: string;
  showingZone?: Zone;
  highlightedCards: string[];
}
