import { z } from 'zod';

// Card definition validation
export const cardDefinitionSchema = z.object({
  name: z.string().min(1).max(100),
  type_line: z.string().min(1).max(100),
  mana_cost: z.string().optional(),
  power: z.number().int().min(0).max(99).optional(),
  toughness: z.number().int().min(0).max(99).optional(),
  keywords: z.array(z.string()).default([]),
  rules_json: z.object({
    on_play: z.array(z.any()).optional(),
    on_enter: z.array(z.any()).optional(),
    on_leave: z.array(z.any()).optional(),
    activated: z.array(z.any()).optional(),
    triggers: z.array(z.any()).optional(),
  }).default({}),
  flavor_text: z.string().optional(),
  artist: z.string().optional(),
  image_url: z.string().url().optional(),
});

// Deck validation
export const deckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  format: z.string().default('casual'),
});

// Pack opening validation
export const packOpenSchema = z.object({
  set_code: z.string().min(1),
  quantity: z.number().int().min(1).max(10).default(1),
});

// Trade validation
export const tradeOfferSchema = z.object({
  target_user_id: z.string().uuid(),
  offered_cards: z.array(z.string()).min(1),
  requested_cards: z.array(z.string()).min(1),
  message: z.string().max(500).optional(),
});

// Game action validation
export const gameActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('play_card'),
    card_id: z.string(),
    target: z.string().optional(),
  }),
  z.object({
    type: z.literal('activate_ability'),
    source_id: z.string(),
    ability_index: z.number().int().min(0),
    target: z.string().optional(),
  }),
  z.object({
    type: z.literal('attack'),
    attackers: z.array(z.string()).min(1),
    targets: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal('block'),
    blocks: z.array(z.object({
      attacker: z.string(),
      blocker: z.string(),
    })),
  }),
  z.object({
    type: z.literal('pass_priority'),
  }),
  z.object({
    type: z.literal('pass_turn'),
  }),
  z.object({
    type: z.literal('mulligan'),
  }),
  z.object({
    type: z.literal('concede'),
  }),
]);

// User registration validation
export const userRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  avatar_url: z.string().url().optional(),
});

// Admin card creation
export const adminCardCreateSchema = cardDefinitionSchema.extend({
  set_id: z.string().uuid(),
  rarity_id: z.number().int().min(1),
  external_code: z.string().optional(),
});

// Validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Deck format validation
export function validateDeckFormat(cards: any[], format: string = 'casual'): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Count cards by name
  const cardCounts = new Map<string, number>();
  cards.forEach(card => {
    const name = card.name || card.card_definition?.name;
    cardCounts.set(name, (cardCounts.get(name) || 0) + 1);
  });
  
  // Check deck size
  if (cards.length < 60) {
    errors.push(`Deck must have at least 60 cards (currently ${cards.length})`);
  } else if (cards.length > 60) {
    warnings.push(`Deck has more than 60 cards (${cards.length})`);
  }
  
  // Check card limits
  cardCounts.forEach((count, cardName) => {
    if (count > 4) {
      errors.push(`Too many copies of "${cardName}" (${count}/4 max)`);
    }
  });
  
  // Format-specific rules
  switch (format) {
    case 'standard':
      // Would check set legality
      break;
    case 'modern':
      // Would check banned list
      break;
    case 'legacy':
      // Would check restricted list
      break;
    case 'casual':
    default:
      // No additional restrictions
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Mana cost validation
export function validateManaCost(cost: string): boolean {
  if (!cost) return true;
  
  // Simple mana cost pattern: {1}{R}{G} etc.
  const pattern = /^(\{[0-9WUBRGCX]\})*$/;
  return pattern.test(cost);
}

// Card rules validation
export function validateCardRules(rules: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Validate effects structure
    if (rules.on_play && !Array.isArray(rules.on_play)) {
      errors.push('on_play must be an array');
    }
    
    if (rules.on_enter && !Array.isArray(rules.on_enter)) {
      errors.push('on_enter must be an array');
    }
    
    if (rules.activated && !Array.isArray(rules.activated)) {
      errors.push('activated must be an array');
    }
    
    if (rules.triggers && !Array.isArray(rules.triggers)) {
      errors.push('triggers must be an array');
    }
    
    // Validate effect operations
    const validateEffects = (effects: any[]) => {
      effects.forEach((effect, index) => {
        if (!effect.op) {
          errors.push(`Effect ${index} missing operation type`);
        }
        
        // Basic operation validation
        switch (effect.op) {
          case 'draw':
            if (typeof effect.count !== 'number' || effect.count < 1) {
              errors.push(`Draw effect ${index} needs positive count`);
            }
            break;
          case 'damage':
            if (typeof effect.amount !== 'number' || effect.amount < 0) {
              errors.push(`Damage effect ${index} needs non-negative amount`);
            }
            break;
          case 'buff':
          case 'debuff':
            if (!effect.selector) {
              errors.push(`Buff/Debuff effect ${index} needs selector`);
            }
            break;
        }
      });
    };
    
    if (rules.on_play) validateEffects(rules.on_play);
    if (rules.on_enter) validateEffects(rules.on_enter);
    
  } catch (error) {
    errors.push('Invalid rules structure');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
