// Seedable random number generator for pack opening
// Ensures reproducible results for pack contents

export class SeededRNG {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  // Linear congruential generator
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.seed / Math.pow(2, 32);
  }
  
  // Random integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  // Random element from array
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
  
  // Shuffle array in place
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  
  // Weighted random selection
  weightedChoice<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
      throw new Error('Items and weights arrays must have same length');
    }
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = this.next() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }
}

// Pack opening with pity timer
export class PackOpeningRNG extends SeededRNG {
  private pityTimers: Map<string, number> = new Map();
  
  // Check if pity timer should trigger for rarity
  shouldTriggerPity(rarity: string, threshold: number = 20): boolean {
    const timer = this.pityTimers.get(rarity) || 0;
    return timer >= threshold;
  }
  
  // Increment pity timer for rarity
  incrementPity(rarity: string): void {
    const current = this.pityTimers.get(rarity) || 0;
    this.pityTimers.set(rarity, current + 1);
  }
  
  // Reset pity timer for rarity
  resetPity(rarity: string): void {
    this.pityTimers.set(rarity, 0);
  }
  
  // Open pack with pity protection
  openPackWithPity(
    pools: Record<string, any[]>,
    slots: Array<{ pool: string; mythic_chance?: number; foil_replaces?: boolean }>,
    pityThresholds: Record<string, number> = { mythic: 25, rare: 8 }
  ): { cards: any[]; foils: boolean[] } {
    const cards: any[] = [];
    const foils: boolean[] = [];
    
    slots.forEach(slot => {
      let { pool } = slot;
      const { mythic_chance = 0, foil_replaces = false } = slot;
      
      // Check foil replacement
      let isFoil = false;
      if (foil_replaces && this.next() < 0.01) { // 1% foil chance
        isFoil = true;
        // Foil can be any rarity - use weighted selection
        const foilPools = Object.keys(pools);
        const foilWeights = foilPools.map(p => {
          switch (p) {
            case 'common': return 50;
            case 'uncommon': return 25;
            case 'rare': return 15;
            case 'mythic': return 10;
            default: return 1;
          }
        });
        pool = this.weightedChoice(foilPools, foilWeights);
      }
      
      // Check mythic upgrade for rare slots
      if (pool === 'rare' && mythic_chance > 0) {
        if (this.shouldTriggerPity('mythic', pityThresholds.mythic)) {
          pool = 'mythic';
          this.resetPity('mythic');
        } else if (this.next() < mythic_chance) {
          pool = 'mythic';
          this.resetPity('mythic');
        } else {
          this.incrementPity('mythic');
        }
      }
      
      // Check rare pity for uncommon slots
      if (pool === 'uncommon' && this.shouldTriggerPity('rare', pityThresholds.rare)) {
        pool = 'rare';
        this.resetPity('rare');
      }
      
      // Select card from pool
      const poolCards = pools[pool] || [];
      if (poolCards.length > 0) {
        const card = this.choice(poolCards);
        cards.push(card);
        foils.push(isFoil);
      }
    });
    
    return { cards, foils };
  }
}

// Create RNG from user ID and timestamp for reproducible packs
export function createPackRNG(userId: string, timestamp: number): PackOpeningRNG {
  // Create deterministic seed from user ID and timestamp
  let seed = 0;
  for (let i = 0; i < userId.length; i++) {
    seed = (seed * 31 + userId.charCodeAt(i)) % Math.pow(2, 32);
  }
  seed = (seed + timestamp) % Math.pow(2, 32);
  
  return new PackOpeningRNG(seed);
}

// Utility functions for common randomization needs
export function shuffleDeck(cards: string[], seed?: number): string[] {
  const rng = new SeededRNG(seed || Date.now());
  return rng.shuffle(cards);
}

export function generateMatchSeed(): number {
  return Math.floor(Math.random() * Math.pow(2, 32));
}
