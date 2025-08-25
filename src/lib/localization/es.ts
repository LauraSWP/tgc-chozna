// Spanish localization constants
export const ES_TRANSLATIONS = {
  // UI Elements
  ui: {
    uniqueCards: 'Cartas Únicas',
    totalCards: 'Total de Cartas',
    foilCards: 'Cartas Holográficas',
    mythicCards: 'Cartas Míticas',
    searchCards: 'Buscar cartas...',
    allRarities: 'Todas las Rarezas',
    allTypes: 'Todos los Tipos',
    sortByName: 'Ordenar por Nombre',
    sortByRarity: 'Ordenar por Rareza',
    sortByAcquired: 'Ordenar por Adquisición',
    sortByCount: 'Ordenar por Cantidad',
    foilsOnly: 'Solo Holográficas',
    yourCollection: 'Tu Colección',
    noCardsFound: 'No se encontraron cartas',
    cardDetails: 'Detalles de la Carta',
    yourCopies: 'Tus Copias',
    total: 'Total',
    foils: 'Holográficas',
    regular: 'Normales',
    oracleText: 'Texto de Reglas',
    flavorText: 'Texto de Ambientación',
    copies: 'copias',
    type: 'Tipo',
    rarity: 'Rareza',
    set: 'Edición',
    manaCost: 'Coste de Maná',
    powerToughness: 'Fuerza/Resistencia',
    loadingCollection: 'Cargando tu colección...',
    tryAdjustingFilters: 'Prueba a ajustar tus filtros o abre algunos sobres en la tienda!',
  },

  // Card Types
  cardTypes: {
    creature: 'Criatura',
    instant: 'Instantáneo',
    sorcery: 'Conjuro',
    artifact: 'Artefacto',
    enchantment: 'Encantamiento',
    planeswalker: 'Planeswalker',
    land: 'Tierra',
    legendary: 'Legendario',
    tribal: 'Tribal',
  },

  // Rarities
  rarities: {
    common: 'Común',
    uncommon: 'Poco Común',
    rare: 'Rara',
    mythic: 'Mítica',
    land: 'Tierra',
    token: 'Ficha',
  },

  // Mana Colors (for accessibility)
  manaColors: {
    W: 'Blanco',
    U: 'Azul',
    B: 'Negro',
    R: 'Rojo',
    G: 'Verde',
    C: 'Incoloro',
  },

  // Keywords with explanations
  keywords: {
    flying: {
      name: 'Volar',
      description: 'Esta criatura solo puede ser bloqueada por criaturas con volar o alcance.',
    },
    vigilance: {
      name: 'Vigilancia',
      description: 'Esta criatura no gira al atacar.',
    },
    haste: {
      name: 'Prisa',
      description: 'Esta criatura puede atacar y usar habilidades de girar inmediatamente.',
    },
    trample: {
      name: 'Arrrollar',
      description: 'El daño extra de esta criatura se asigna al jugador defensor.',
    },
    first_strike: {
      name: 'Daño de Primer Golpe',
      description: 'Esta criatura inflige daño de combate antes que las criaturas sin daño de primer golpe.',
    },
    double_strike: {
      name: 'Doble Golpe',
      description: 'Esta criatura inflige daño de primer golpe y daño de combate normal.',
    },
    deathtouch: {
      name: 'Toque Mortal',
      description: 'Cualquier cantidad de daño que esta criatura inflija a una criatura es suficiente para destruirla.',
    },
    lifelink: {
      name: 'Vínculo Vital',
      description: 'El daño infligido por esta criatura también hace que ganes esa cantidad de vida.',
    },
    reach: {
      name: 'Alcance',
      description: 'Esta criatura puede bloquear criaturas con volar.',
    },
    defender: {
      name: 'Defensor',
      description: 'Esta criatura no puede atacar.',
    },
    hexproof: {
      name: 'Antimaleficio',
      description: 'Esta criatura no puede ser objetivo de hechizos o habilidades controlados por tus oponentes.',
    },
    indestructible: {
      name: 'Indestructible',
      description: 'El daño y los efectos que dicen "destruir" no destruyen esta criatura.',
    },
    menace: {
      name: 'Amenaza',
      description: 'Esta criatura solo puede ser bloqueada por dos o más criaturas.',
    },
    flash: {
      name: 'Destello',
      description: 'Puedes jugar esta carta en cualquier momento en que pudieras jugar un instantáneo.',
    },
    prowess: {
      name: 'Destreza',
      description: 'Siempre que juegues un hechizo que no sea criatura, esta criatura obtiene +1/+1 hasta el final del turno.',
    },
  },

  // Game zones
  zones: {
    library: 'Biblioteca',
    hand: 'Mano',
    battlefield: 'Campo de Batalla',
    graveyard: 'Cementerio',
    exile: 'Exilio',
    stack: 'Pila',
  },

  // Game actions
  actions: {
    attack: 'Atacar',
    block: 'Bloquear',
    tap: 'Girar',
    untap: 'Enderezar',
    sacrifice: 'Sacrificar',
    destroy: 'Destruir',
    exile: 'Exiliar',
    return: 'Regresar',
    draw: 'Robar',
    discard: 'Descartar',
  },
};

// Utility function to get keyword explanation
export function getKeywordExplanation(keyword: string): { name: string; description: string } | null {
  const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, '_');
  return ES_TRANSLATIONS.keywords[normalizedKeyword as keyof typeof ES_TRANSLATIONS.keywords] || null;
}

// Utility function to translate card type
export function translateCardType(type: string): string {
  const lowerType = type.toLowerCase();
  const cardTypeEntries = [
    ['creature', ES_TRANSLATIONS.cardTypes.creature],
    ['instant', ES_TRANSLATIONS.cardTypes.instant], 
    ['sorcery', ES_TRANSLATIONS.cardTypes.sorcery],
    ['artifact', ES_TRANSLATIONS.cardTypes.artifact],
    ['enchantment', ES_TRANSLATIONS.cardTypes.enchantment],
    ['planeswalker', ES_TRANSLATIONS.cardTypes.planeswalker],
    ['land', ES_TRANSLATIONS.cardTypes.land],
    ['legendary', ES_TRANSLATIONS.cardTypes.legendary],
    ['tribal', ES_TRANSLATIONS.cardTypes.tribal],
  ];
  
  for (const [english, spanish] of cardTypeEntries) {
    if (lowerType.includes(english)) {
      return type.replace(new RegExp(english, 'gi'), spanish);
    }
  }
  return type;
}

// Utility function to translate rarity
export function translateRarity(rarity: string): string {
  return ES_TRANSLATIONS.rarities[rarity.toLowerCase() as keyof typeof ES_TRANSLATIONS.rarities] || rarity;
}
