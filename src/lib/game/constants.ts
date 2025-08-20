// Game phases and constants
export const PHASES = [
  'beginning:untap',
  'beginning:upkeep', 
  'beginning:draw',
  'main:precombat',
  'combat:begin',
  'combat:declare_attackers',
  'combat:declare_blockers',
  'combat:damage',
  'combat:end',
  'main:postcombat',
  'ending:end_step',
  'ending:cleanup'
] as const;

export const ZONES = [
  'library',
  'hand', 
  'battlefield',
  'graveyard',
  'exile',
  'stack'
] as const;

export const CARD_TYPES = [
  'creature',
  'instant',
  'sorcery',
  'artifact',
  'enchantment',
  'planeswalker',
  'land'
] as const;

export const RARITIES = [
  'common',
  'uncommon', 
  'rare',
  'mythic',
  'land',
  'token'
] as const;

// Game rules constants
export const GAME_RULES = {
  MAX_HAND_SIZE: 7,
  STARTING_LIFE: 20,
  MAX_DECK_SIZE: 60,
  MIN_DECK_SIZE: 60,
  MAX_COPIES_PER_CARD: 4,
  STARTING_HAND_SIZE: 7,
  MAX_PLAYERS: 2, // expandible a multiplayer
  MULLIGAN_LIMIT: 6,
} as const;

// Mana colors
export const MANA_COLORS = ['W', 'U', 'B', 'R', 'G', 'C'] as const; // White, Blue, Black, Red, Green, Colorless

// Keywords that have built-in rules
export const EVERGREEN_KEYWORDS = [
  'flying',
  'vigilance', 
  'haste',
  'trample',
  'first_strike',
  'double_strike',
  'deathtouch',
  'lifelink',
  'reach',
  'defender',
  'hexproof',
  'indestructible'
] as const;

// Priority steps
export const PRIORITY_STEPS = [
  'active_player',
  'non_active_player'
] as const;
