// Card mechanics system with actual effects
export interface MechanicEffect {
  id: string;
  name: string;
  nameES: string;
  description: string;
  descriptionES: string;
  type: 'static' | 'triggered' | 'activated' | 'replacement';
  category: 'evasion' | 'combat' | 'utility' | 'protection' | 'tempo';
  effects: {
    // Combat modifiers
    canAttack?: boolean;
    canBlock?: boolean;
    canBeBlocked?: boolean;
    canBeBlockedBy?: string[]; // conditions like "flying", "reach"
    blockRestrictions?: string[]; // can only be blocked by X
    damageModifiers?: {
      firstStrike?: boolean;
      doubleStrike?: boolean;
      trample?: boolean;
      deathtouch?: boolean;
      lifelink?: boolean;
    };
    
    // Protection and targeting
    protection?: {
      hexproof?: boolean;
      shroud?: boolean;
      indestructible?: boolean;
      colors?: string[];
      cardTypes?: string[];
    };
    
    // Triggered abilities
    triggers?: {
      entersBattlefield?: string; // effect description
      leavesBattlefield?: string;
      dies?: string;
      attacks?: string;
      blocks?: string;
      dealsDamage?: string;
      takesDamage?: string;
    };
    
    // Static abilities
    static?: {
      powerBonus?: number;
      toughnessBonus?: number;
      costsLess?: { amount: number; condition?: string };
      grantsAbilities?: string[]; // to other creatures
    };
  };
}

export const CARD_MECHANICS: Record<string, MechanicEffect> = {
  flying: {
    id: 'flying',
    name: 'Flying',
    nameES: 'Volar',
    description: 'This creature can only be blocked by creatures with flying or reach.',
    descriptionES: 'Esta criatura solo puede ser bloqueada por criaturas con volar o alcance.',
    type: 'static',
    category: 'evasion',
    effects: {
      canBeBlockedBy: ['flying', 'reach'],
    }
  },
  
  vigilance: {
    id: 'vigilance',
    name: 'Vigilance',
    nameES: 'Vigilancia',
    description: 'This creature doesn\'t tap when attacking.',
    descriptionES: 'Esta criatura no gira al atacar.',
    type: 'static',
    category: 'combat',
    effects: {
      // Implementation: creature doesn't tap when declared as attacker
    }
  },
  
  haste: {
    id: 'haste',
    name: 'Haste',
    nameES: 'Prisa',
    description: 'This creature can attack and use tap abilities immediately.',
    descriptionES: 'Esta criatura puede atacar y usar habilidades de girar inmediatamente.',
    type: 'static',
    category: 'tempo',
    effects: {
      // Implementation: ignore summoning sickness
    }
  },
  
  trample: {
    id: 'trample',
    name: 'Trample',
    nameES: 'Arrollar',
    description: 'Excess combat damage is dealt to the defending player.',
    descriptionES: 'El daño de combate excedente se inflige al jugador defensor.',
    type: 'static',
    category: 'combat',
    effects: {
      damageModifiers: {
        trample: true
      }
    }
  },
  
  first_strike: {
    id: 'first_strike',
    name: 'First Strike',
    nameES: 'Daño de Primer Golpe',
    description: 'This creature deals combat damage before creatures without first strike.',
    descriptionES: 'Esta criatura inflige daño de combate antes que las criaturas sin daño de primer golpe.',
    type: 'static',
    category: 'combat',
    effects: {
      damageModifiers: {
        firstStrike: true
      }
    }
  },
  
  double_strike: {
    id: 'double_strike',
    name: 'Double Strike',
    nameES: 'Doble Golpe',
    description: 'This creature deals first strike and regular combat damage.',
    descriptionES: 'Esta criatura inflige daño de primer golpe y daño de combate normal.',
    type: 'static',
    category: 'combat',
    effects: {
      damageModifiers: {
        doubleStrike: true
      }
    }
  },
  
  deathtouch: {
    id: 'deathtouch',
    name: 'Deathtouch',
    nameES: 'Toque Mortal',
    description: 'Any amount of damage this creature deals to a creature is enough to destroy it.',
    descriptionES: 'Cualquier cantidad de daño que esta criatura inflija a una criatura es suficiente para destruirla.',
    type: 'static',
    category: 'combat',
    effects: {
      damageModifiers: {
        deathtouch: true
      }
    }
  },
  
  lifelink: {
    id: 'lifelink',
    name: 'Lifelink',
    nameES: 'Vínculo Vital',
    description: 'Damage dealt by this creature also causes you to gain that much life.',
    descriptionES: 'El daño infligido por esta criatura también hace que ganes esa cantidad de vida.',
    type: 'static',
    category: 'utility',
    effects: {
      damageModifiers: {
        lifelink: true
      }
    }
  },
  
  reach: {
    id: 'reach',
    name: 'Reach',
    nameES: 'Alcance',
    description: 'This creature can block flying creatures.',
    descriptionES: 'Esta criatura puede bloquear criaturas con volar.',
    type: 'static',
    category: 'combat',
    effects: {
      canBlock: true, // can block flying creatures
    }
  },
  
  defender: {
    id: 'defender',
    name: 'Defender',
    nameES: 'Defensor',
    description: 'This creature can\'t attack.',
    descriptionES: 'Esta criatura no puede atacar.',
    type: 'static',
    category: 'combat',
    effects: {
      canAttack: false
    }
  },
  
  hexproof: {
    id: 'hexproof',
    name: 'Hexproof',
    nameES: 'Antimaleficio',
    description: 'This creature can\'t be the target of spells or abilities your opponents control.',
    descriptionES: 'Esta criatura no puede ser objetivo de hechizos o habilidades controlados por tus oponentes.',
    type: 'static',
    category: 'protection',
    effects: {
      protection: {
        hexproof: true
      }
    }
  },
  
  indestructible: {
    id: 'indestructible',
    name: 'Indestructible',
    nameES: 'Indestructible',
    description: 'Damage and effects that say "destroy" don\'t destroy this creature.',
    descriptionES: 'El daño y los efectos que dicen "destruir" no destruyen esta criatura.',
    type: 'static',
    category: 'protection',
    effects: {
      protection: {
        indestructible: true
      }
    }
  },
  
  menace: {
    id: 'menace',
    name: 'Menace',
    nameES: 'Amenaza',
    description: 'This creature can only be blocked by two or more creatures.',
    descriptionES: 'Esta criatura solo puede ser bloqueada por dos o más criaturas.',
    type: 'static',
    category: 'evasion',
    effects: {
      blockRestrictions: ['requires_multiple_blockers']
    }
  },
  
  flash: {
    id: 'flash',
    name: 'Flash',
    nameES: 'Destello',
    description: 'You may cast this spell any time you could cast an instant.',
    descriptionES: 'Puedes jugar esta carta en cualquier momento en que pudieras jugar un instantáneo.',
    type: 'static',
    category: 'tempo',
    effects: {
      // Implementation: can be cast at instant speed
    }
  }
};

// Utility functions
export function getMechanic(id: string): MechanicEffect | null {
  return CARD_MECHANICS[id] || null;
}

export function getAvailableMechanics(): MechanicEffect[] {
  return Object.values(CARD_MECHANICS);
}

export function getMechanicsByCategory(category: string): MechanicEffect[] {
  return Object.values(CARD_MECHANICS).filter(mechanic => mechanic.category === category);
}

export function validateMechanicCombination(mechanicIds: string[]): { valid: boolean; conflicts?: string[] } {
  const mechanics = mechanicIds.map(id => CARD_MECHANICS[id]).filter(Boolean);
  
  // Check for conflicting mechanics
  const conflicts: string[] = [];
  
  // First strike and double strike conflict
  if (mechanicIds.includes('first_strike') && mechanicIds.includes('double_strike')) {
    conflicts.push('First Strike and Double Strike cannot coexist');
  }
  
  // Defender and haste are contradictory (defender can't attack, haste helps attacking)
  if (mechanicIds.includes('defender') && mechanicIds.includes('haste')) {
    conflicts.push('Defender and Haste are contradictory');
  }
  
  return {
    valid: conflicts.length === 0,
    conflicts: conflicts.length > 0 ? conflicts : undefined
  };
}
