import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Fun card data with inside jokes and special effects
const seedCards = [
  // COMMON CARDS (15 cards)
  {
    external_code: "BAS001",
    name: "Coffee-Powered Coder",
    type_line: "Creature — Human Developer",
    mana_cost: "{1}{B}",
    power: 1,
    toughness: 2,
    keywords: ["haste"],
    rules_json: {
      on_enter: [
        { op: "draw", count: 1, target: "self" }
      ]
    },
    flavor_text: "\"I can code for 48 hours straight, but only if there's caffeine.\"",
    artist: "AI Assistant",
    rarity: "common"
  },
  {
    external_code: "BAS002", 
    name: "Debugging Session",
    type_line: "Sorcery",
    mana_cost: "{2}{U}",
    rules_json: {
      on_play: [
        { op: "search", zone: "library", criteria: "instant", quantity: 1 }
      ]
    },
    flavor_text: "Sometimes the bug is in your head, not your code.",
    artist: "Stack Overflow",
    rarity: "common"
  },
  {
    external_code: "BAS003",
    name: "Rubber Duck",
    type_line: "Artifact Creature — Duck",
    mana_cost: "{1}",
    power: 0,
    toughness: 1,
    keywords: ["defender"],
    rules_json: {
      activated: [
        {
          cost: "{T}",
          effects: [{ op: "draw", count: 1, target: "self" }],
          description: "Tap: Explain your problem to the duck, draw a card."
        }
      ]
    },
    flavor_text: "The most patient debugging partner you'll ever have.",
    artist: "Bath & Beyond",
    rarity: "common"
  },
  {
    external_code: "BAS004",
    name: "Stack Overflow Search",
    type_line: "Instant",
    mana_cost: "{U}",
    rules_json: {
      on_play: [
        { op: "draw", count: 2, target: "self" },
        { op: "discard", count: 1, target: "self" }
      ]
    },
    flavor_text: "\"This question was asked 5 years ago and marked as duplicate.\"",
    artist: "The Internet",
    rarity: "common"
  },
  {
    external_code: "BAS005",
    name: "Merge Conflict",
    type_line: "Enchantment",
    mana_cost: "{1}{R}",
    rules_json: {
      triggers: [
        {
          condition: { when: "spell_cast", types: ["instant", "sorcery"] },
          effects: [{ op: "damage", amount: 1, target: "any" }]
        }
      ]
    },
    flavor_text: "When two developers touch the same file...",
    artist: "Git",
    rarity: "common"
  },
  {
    external_code: "BAS006",
    name: "Junior Developer",
    type_line: "Creature — Human Intern",
    mana_cost: "{W}",
    power: 1,
    toughness: 1,
    rules_json: {
      on_enter: [
        { op: "create_token", name: "Bug", power: 0, toughness: 1, types: ["Artifact"] }
      ]
    },
    flavor_text: "Eager to help, but sometimes creates more work.",
    artist: "HR Department",
    rarity: "common"
  },
  {
    external_code: "BAS007",
    name: "Legacy Code",
    type_line: "Artifact",
    mana_cost: "{3}",
    rules_json: {
      static: [
        { op: "buff", power: -1, toughness: -1, until: "permanent", selector: "all_creatures" }
      ]
    },
    flavor_text: "\"Nobody knows how it works, but don't touch it.\"",
    artist: "Previous Developer",
    rarity: "common"
  },
  {
    external_code: "BAS008",
    name: "Code Review",
    type_line: "Sorcery",
    mana_cost: "{1}{W}",
    rules_json: {
      on_play: [
        { op: "tap", selector: "target_creature" },
        { op: "draw", count: 1, target: "self" }
      ]
    },
    flavor_text: "\"Have you considered a different approach?\"",
    artist: "Senior Dev",
    rarity: "common"
  },
  {
    external_code: "BAS009",
    name: "Caffeine Rush",
    type_line: "Instant",
    mana_cost: "{R}",
    rules_json: {
      on_play: [
        { op: "buff", power: 2, toughness: 0, until: "end_of_turn", selector: "target_creature" },
        { op: "damage", amount: 1, target: "player", selector: "self" }
      ]
    },
    flavor_text: "\"I'll sleep when the project ships.\"",
    artist: "Energy Drink Inc",
    rarity: "common"
  },
  {
    external_code: "BAS010",
    name: "Pair Programming",
    type_line: "Enchantment",
    mana_cost: "{1}{G}",
    rules_json: {
      static: [
        { op: "buff", power: 1, toughness: 1, until: "permanent", selector: "all_your_creatures" }
      ]
    },
    flavor_text: "Two minds are better than one, even if they argue constantly.",
    artist: "Agile Methodology",
    rarity: "common"
  },
  {
    external_code: "BAS011",
    name: "Documentation",
    type_line: "Artifact",
    mana_cost: "{2}",
    rules_json: {
      activated: [
        {
          cost: "{1}, {T}",
          effects: [{ op: "search", zone: "library", criteria: "any", quantity: 1 }]
        }
      ]
    },
    flavor_text: "\"The code is self-documenting\" - Every developer ever",
    artist: "Future You",
    rarity: "common"
  },
  {
    external_code: "BAS012",
    name: "Unit Test",
    type_line: "Instant",
    mana_cost: "{1}{U}",
    rules_json: {
      on_play: [
        { op: "counter", target: "spell" }
      ]
    },
    flavor_text: "Expected: Success. Actual: Exception.",
    artist: "QA Team",
    rarity: "common"
  },
  {
    external_code: "BAS013",
    name: "Keyboard Warrior",
    type_line: "Creature — Human Programmer",
    mana_cost: "{2}{R}",
    power: 2,
    toughness: 1,
    keywords: ["haste", "first_strike"],
    flavor_text: "Types 120 WPM and isn't afraid to use it.",
    artist: "Mechanical Keyboard Gang",
    rarity: "common"
  },
  {
    external_code: "BAS014",
    name: "Backup Server",
    type_line: "Artifact",
    mana_cost: "{3}",
    rules_json: {
      triggers: [
        {
          condition: { when: "dies", source: "any" },
          effects: [{ op: "return", from: "graveyard", to: "hand", selector: "target_card" }]
        }
      ]
    },
    flavor_text: "When the main server goes down, this one probably will too.",
    artist: "IT Department",
    rarity: "common"
  },
  {
    external_code: "BAS015",
    name: "Basic Island of Isolation",
    type_line: "Basic Land — Island",
    rules_json: {
      activated: [
        {
          cost: "{T}",
          effects: [{ op: "gain_mana", colors: ["U"], amount: 1 }]
        }
      ]
    },
    flavor_text: "Where developers go to think deeply... or procrastinate.",
    artist: "Remote Work",
    rarity: "land"
  },

  // UNCOMMON CARDS (8 cards)
  {
    external_code: "BAS016",
    name: "Senior Developer",
    type_line: "Creature — Human Mentor",
    mana_cost: "{2}{W}{U}",
    power: 2,
    toughness: 3,
    keywords: ["vigilance"],
    rules_json: {
      on_enter: [
        { op: "search", zone: "library", criteria: "creature", quantity: 1 }
      ],
      activated: [
        {
          cost: "{1}, {T}",
          effects: [{ op: "buff", power: 1, toughness: 1, until: "permanent", selector: "target_creature" }],
          description: "Mentor a junior developer"
        }
      ]
    },
    flavor_text: "\"I've been debugging since before you were born.\"",
    artist: "20 Years Experience",
    rarity: "uncommon"
  },
  {
    external_code: "BAS017",
    name: "Production Deployment",
    type_line: "Sorcery",
    mana_cost: "{3}{R}{R}",
    rules_json: {
      on_play: [
        { op: "damage", amount: 5, target: "any" },
        { op: "damage", amount: 1, target: "player", selector: "self" }
      ]
    },
    flavor_text: "\"It works on my machine!\"",
    artist: "DevOps Nightmare",
    rarity: "uncommon"
  },
  {
    external_code: "BAS018",
    name: "Code Refactor",
    type_line: "Sorcery",
    mana_cost: "{2}{G}{U}",
    rules_json: {
      on_play: [
        { op: "destroy", selector: "target_artifact" },
        { op: "create_token", name: "Clean Code", power: 3, toughness: 3, types: ["Artifact", "Creature"] }
      ]
    },
    flavor_text: "Making the code better, one function at a time.",
    artist: "Clean Code Evangelist",
    rarity: "uncommon"
  },
  {
    external_code: "BAS019",
    name: "Agile Sprint",
    type_line: "Enchantment",
    mana_cost: "{1}{R}{W}",
    rules_json: {
      triggers: [
        {
          condition: { when: "phase_begin", phase: "beginning:upkeep" },
          effects: [
            { op: "draw", count: 1, target: "self" },
            { op: "damage", amount: 1, target: "player", selector: "self" }
          ]
        }
      ]
    },
    flavor_text: "Two weeks to change the world. Or at least fix the login button.",
    artist: "Scrum Master",
    rarity: "uncommon"
  },
  {
    external_code: "BAS020",
    name: "Open Source Contribution",
    type_line: "Instant",
    mana_cost: "{1}{G}",
    rules_json: {
      on_play: [
        { op: "buff", power: 2, toughness: 2, until: "permanent", selector: "all_your_creatures" },
        { op: "draw", count: 1, target: "all" }
      ]
    },
    flavor_text: "When you give back to the community, everyone benefits.",
    artist: "GitHub",
    rarity: "uncommon"
  },
  {
    external_code: "BAS021",
    name: "Machine Learning Model",
    type_line: "Artifact Creature — Construct AI",
    mana_cost: "{4}",
    power: 1,
    toughness: 1,
    rules_json: {
      triggers: [
        {
          condition: { when: "deals_damage", source: "self" },
          effects: [{ op: "buff", power: 1, toughness: 1, until: "permanent", selector: "self" }]
        }
      ]
    },
    flavor_text: "It learns from every interaction. Mostly how to break things.",
    artist: "Neural Network",
    rarity: "uncommon"
  },
  {
    external_code: "BAS022",
    name: "Database Query",
    type_line: "Sorcery",
    mana_cost: "{X}{U}{U}",
    rules_json: {
      on_play: [
        { op: "search", zone: "library", criteria: "any", quantity: 3 },
        { op: "mill", count: 2, target: "self" }
      ]
    },
    flavor_text: "SELECT * FROM knowledge WHERE understanding > 0;",
    artist: "SQL Wizard",
    rarity: "uncommon"
  },
  {
    external_code: "BAS023",
    name: "Continuous Integration",
    type_line: "Enchantment",
    mana_cost: "{2}{U}{W}",
    rules_json: {
      static: [
        { op: "buff", power: 1, toughness: 1, until: "permanent", selector: "all_artifacts" }
      ],
      triggers: [
        {
          condition: { when: "enters_battlefield", source: "any" },
          effects: [{ op: "draw", count: 1, target: "self" }]
        }
      ]
    },
    flavor_text: "Every commit is tested. Every test is a prayer.",
    artist: "Jenkins",
    rarity: "uncommon"
  },

  // RARE CARDS (6 cards)
  {
    external_code: "BAS024",
    name: "Tech Lead",
    type_line: "Legendary Creature — Human Architect",
    mana_cost: "{3}{W}{U}",
    power: 3,
    toughness: 4,
    keywords: ["vigilance", "hexproof"],
    rules_json: {
      on_enter: [
        { op: "search", zone: "library", criteria: "artifact", quantity: 2 }
      ],
      static: [
        { op: "buff", power: 1, toughness: 1, until: "permanent", selector: "all_your_creatures" }
      ]
    },
    flavor_text: "Writes the code that writes the code.",
    artist: "System Architecture",
    rarity: "rare"
  },
  {
    external_code: "BAS025",
    name: "Zero-Day Exploit",
    type_line: "Instant",
    mana_cost: "{2}{B}{B}",
    rules_json: {
      on_play: [
        { op: "destroy", selector: "target_permanent" },
        { op: "damage", amount: 3, target: "player" }
      ]
    },
    flavor_text: "\"We'll patch it in the next release...\"",
    artist: "Black Hat Hacker",
    rarity: "rare"
  },
  {
    external_code: "BAS026",
    name: "Artificial General Intelligence",
    type_line: "Legendary Artifact Creature — AI God",
    mana_cost: "{7}",
    power: 5,
    toughness: 5,
    keywords: ["flying", "trample"],
    rules_json: {
      on_enter: [
        { op: "draw", count: 3, target: "self" },
        { op: "create_token", name: "Singularity", power: 2, toughness: 2, types: ["Artifact", "Creature"], keywords: ["flying"] }
      ],
      activated: [
        {
          cost: "{2}, {T}",
          effects: [{ op: "destroy", selector: "all_creatures" }],
          description: "The machines have taken over"
        }
      ]
    },
    flavor_text: "When AI becomes truly intelligent, will it still write bugs?",
    artist: "The Future",
    rarity: "rare"
  },
  {
    external_code: "BAS027",
    name: "Quantum Computer",
    type_line: "Legendary Artifact",
    mana_cost: "{5}",
    rules_json: {
      activated: [
        {
          cost: "{3}, {T}",
          effects: [
            { op: "draw", count: 5, target: "self" },
            { op: "discard", count: 3, target: "self" }
          ],
          description: "Process all possibilities simultaneously"
        }
      ]
    },
    flavor_text: "It can solve any problem, assuming the problem is keeping it cold enough.",
    artist: "Quantum Physics",
    rarity: "rare"
  },
  {
    external_code: "BAS028",
    name: "The Blockchain",
    type_line: "Legendary Enchantment",
    mana_cost: "{3}{G}{U}",
    rules_json: {
      static: [
        { op: "buff", power: 0, toughness: 3, until: "permanent", selector: "all_permanents" }
      ],
      triggers: [
        {
          condition: { when: "enters_battlefield", source: "any" },
          effects: [
            { op: "create_token", name: "Block", power: 0, toughness: 1, types: ["Artifact"] },
            { op: "gain_mana", colors: ["C"], amount: 1 }
          ]
        }
      ]
    },
    flavor_text: "Immutable, decentralized, and uses more energy than a small country.",
    artist: "Crypto Bro",
    rarity: "rare"
  },
  {
    external_code: "BAS029",
    name: "Serverless Architecture",
    type_line: "Enchantment",
    mana_cost: "{2}{U}{G}",
    rules_json: {
      static: [
        { op: "gain_mana", colors: ["U", "G"], amount: 2 }
      ],
      triggers: [
        {
          condition: { when: "spell_cast" },
          effects: [{ op: "draw", count: 1, target: "self" }]
        }
      ]
    },
    flavor_text: "No servers to manage! (They're just someone else's servers.)",
    artist: "Cloud Provider",
    rarity: "rare"
  },

  // MYTHIC RARE CARDS (3 cards)
  {
    external_code: "BAS030",
    name: "The Architect",
    type_line: "Legendary Creature — Human God",
    mana_cost: "{4}{W}{U}{B}",
    power: 6,
    toughness: 6,
    keywords: ["flying", "vigilance", "lifelink"],
    rules_json: {
      on_enter: [
        { op: "search", zone: "library", criteria: "any", quantity: 5 },
        { op: "draw", count: 3, target: "self" }
      ],
      activated: [
        {
          cost: "{2}{W}{U}{B}, {T}",
          effects: [
            { op: "create_token", name: "Perfect System", power: 4, toughness: 4, types: ["Artifact", "Creature"], keywords: ["indestructible"] }
          ],
          description: "Design the perfect system"
        }
      ]
    },
    flavor_text: "\"I have seen the future of technology, and it is beautiful.\"",
    artist: "Legendary Developer",
    rarity: "mythic"
  },
  {
    external_code: "BAS031",
    name: "Stack Overflow",
    type_line: "Legendary Sorcery",
    mana_cost: "{X}{X}{R}{R}",
    rules_json: {
      on_play: [
        { op: "damage", amount: 999, target: "all" },
        { op: "mill", count: 20, target: "all" }
      ]
    },
    flavor_text: "Maximum recursion depth exceeded. Core dumped.",
    artist: "Infinite Loop",
    rarity: "mythic"
  },
  {
    external_code: "BAS032",
    name: "The Cloud",
    type_line: "Legendary Land",
    rules_json: {
      activated: [
        {
          cost: "{T}",
          effects: [{ op: "gain_mana", colors: ["W", "U", "B", "R", "G"], amount: 1 }]
        },
        {
          cost: "{5}, {T}",
          effects: [
            { op: "search", zone: "library", criteria: "any", quantity: 10 },
            { op: "draw", count: 7, target: "self" }
          ],
          description: "Access infinite storage"
        }
      ]
    },
    flavor_text: "Everything is in the cloud. Even things that shouldn't be.",
    artist: "Amazon Web Services",
    rarity: "mythic"
  },

  // TOKEN CARDS (2 cards)
  {
    external_code: "TOK001",
    name: "Bug Token",
    type_line: "Artifact Creature — Bug",
    mana_cost: "",
    power: 0,
    toughness: 1,
    flavor_text: "It's not a bug, it's a feature!",
    artist: "QA Team",
    rarity: "token"
  },
  {
    external_code: "TOK002", 
    name: "Feature Request",
    type_line: "Enchantment Token",
    mana_cost: "",
    rules_json: {
      static: [
        { op: "buff", power: 1, toughness: 0, until: "permanent", selector: "all_your_creatures" }
      ]
    },
    flavor_text: "\"Can we make it do this one more thing?\"",
    artist: "Product Manager",
    rarity: "token"
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Get the base set ID
    const { data: baseSet, error: setError } = await supabase
      .from('card_sets')
      .select('id')
      .eq('code', 'BASE')
      .single();

    if (setError || !baseSet) {
      console.error('❌ Base set not found:', setError);
      return;
    }

    console.log('✅ Found base set:', baseSet.id);

    // Get rarity mappings
    const { data: rarities } = await supabase
      .from('rarities')
      .select('id, code');

    const rarityMap = new Map(rarities?.map(r => [r.code, r.id]) || []);

    // Prepare card data for insertion
    const cardsToInsert = seedCards.map(card => ({
      set_id: baseSet.id,
      external_code: card.external_code,
      name: card.name,
      rarity_id: rarityMap.get(card.rarity),
      type_line: card.type_line,
      mana_cost: card.mana_cost || null,
      power: card.power || null,
      toughness: card.toughness || null,
      keywords: card.keywords || [],
      rules_json: card.rules_json || {},
      flavor_text: card.flavor_text || null,
      artist: card.artist || null,
      image_url: null // We'll add images later
    }));

    console.log(`🃏 Inserting ${cardsToInsert.length} cards...`);

    // Insert cards in batches to avoid hitting limits
    const batchSize = 10;
    for (let i = 0; i < cardsToInsert.length; i += batchSize) {
      const batch = cardsToInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from('card_definitions')
        .insert(batch);

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} cards)`);
      }
    }

    console.log('🎉 Database seeding completed!');
    console.log(`📊 Inserted ${cardsToInsert.length} cards total`);
    console.log('📈 Rarity breakdown:');
    
    const breakdown = cardsToInsert.reduce((acc, card) => {
      const rarity = seedCards.find(sc => sc.external_code === card.external_code)?.rarity || 'unknown';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(breakdown).forEach(([rarity, count]) => {
      console.log(`   ${rarity}: ${count} cards`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
