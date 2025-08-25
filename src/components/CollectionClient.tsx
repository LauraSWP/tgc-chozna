'use client';

// Updated: Fixed property names to match CardDefinition type (typeLine, oracleText, manaCost, flavorText)
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CardView from '@/components/CardView';
import { cn } from '@/lib/utils';
import type { CardDefinition } from '@/lib/game/types';

interface UserCard {
  id: string;
  card_def_id: string;
  foil: boolean;
  acquired_at: string;
}

interface CardGroup {
  definition: CardDefinition & {
    // Additional database fields for compatibility
    rarities?: any;
    card_sets?: any;
    oracleText?: string;
  };
  cards: UserCard[];
  totalCount: number;
  foilCount: number;
}

interface CollectionSummary {
  rarity: string;
  total_cards: number;
  foil_cards: number;
}

interface CollectionClientProps {
  collection: CardGroup[];
  summary: CollectionSummary[];
  totalCards: number;
}

const CollectionClient: React.FC<CollectionClientProps> = ({
  collection: initialCollection,
  summary: initialSummary,
  totalCards: initialTotalCards
}) => {
  const [collection, setCollection] = useState<CardGroup[]>(initialCollection);
  const [summary, setSummary] = useState<CollectionSummary[]>(initialSummary);
  const [totalCards, setTotalCards] = useState(initialTotalCards);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'acquired' | 'count'>('name');
  const [showFoilsOnly, setShowFoilsOnly] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardGroup | null>(null);

  // Fetch collection data on mount
  useEffect(() => {
    const fetchCollection = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching collection from API...');
        const response = await fetch('/api/collection');
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API response data:', data);
          setCollection(data.collection || []);
          setSummary(data.summary || []);
          setTotalCards(data.totalCards || 0);
        } else {
          const errorText = await response.text();
          console.error('API error:', response.status, errorText);
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (initialCollection.length === 0) {
      fetchCollection();
    }
  }, [initialCollection]);

  // Filter and sort collection
  const filteredCollection = useMemo(() => {
    const filtered = collection.filter(group => {
      const card = group.definition;
      
      // Search filtering - use correct property names from CardDefinition type
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (card.typeLine || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (card.oracleText || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Rarity filtering
      const matchesRarity = selectedRarity === 'all' || card.rarities?.code === selectedRarity;
      
      // Type filtering - use typeLine property
      const matchesType = selectedType === 'all' || (card.typeLine || '').toLowerCase().includes(selectedType.toLowerCase());
      
      // Foil filtering
      const matchesFoil = !showFoilsOnly || group.foilCount > 0;
      
      return matchesSearch && matchesRarity && matchesType && matchesFoil;
    });

    // Sort collection
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.definition.name.localeCompare(b.definition.name);
        case 'rarity':
          const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'mythic': 4, 'land': 0 };
          const aRarity = rarityOrder[a.definition.rarities?.code as keyof typeof rarityOrder] || 0;
          const bRarity = rarityOrder[b.definition.rarities?.code as keyof typeof rarityOrder] || 0;
          return bRarity - aRarity;
        case 'acquired':
          const aDate = new Date(a.cards[0]?.acquired_at || 0);
          const bDate = new Date(b.cards[0]?.acquired_at || 0);
          return bDate.getTime() - aDate.getTime();
        case 'count':
          return b.totalCount - a.totalCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [collection, searchTerm, selectedRarity, selectedType, sortBy, showFoilsOnly]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const stats = {
      totalUnique: collection.length,
      totalCards,
      totalFoils: collection.reduce((sum, group) => sum + group.foilCount, 0),
      byRarity: {} as Record<string, { count: number, foils: number }>
    };

    collection.forEach(group => {
      const rarity = group.definition.rarities?.code || 'unknown';
      if (!stats.byRarity[rarity]) {
        stats.byRarity[rarity] = { count: 0, foils: 0 };
      }
      stats.byRarity[rarity].count += group.totalCount;
      stats.byRarity[rarity].foils += group.foilCount;
    });

    return stats;
  }, [collection, totalCards]);

  if (isLoading && collection.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collection Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summaryStats.totalUnique}</div>
              <div className="text-sm text-gray-600">Unique Cards</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summaryStats.totalCards}</div>
              <div className="text-sm text-gray-600">Total Cards</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summaryStats.totalFoils}</div>
              <div className="text-sm text-gray-600">Foil Cards</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {summaryStats.byRarity.mythic?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Mythic Cards</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
            
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="mythic">Mythic</option>
              <option value="land">Land</option>
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="creature">Creatures</option>
              <option value="instant">Instants</option>
              <option value="sorcery">Sorceries</option>
              <option value="artifact">Artifacts</option>
              <option value="enchantment">Enchantments</option>
              <option value="land">Lands</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded-md px-3 py-2"
            >
              <option value="name">Sort by Name</option>
              <option value="rarity">Sort by Rarity</option>
              <option value="acquired">Sort by Acquired</option>
              <option value="count">Sort by Count</option>
            </select>
            
            <label className="flex items-center gap-2 px-3 py-2">
              <input
                type="checkbox"
                checked={showFoilsOnly}
                onChange={(e) => setShowFoilsOnly(e.target.checked)}
              />
              <span className="text-sm">Foils Only ✨</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Collection Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            Your Collection ({filteredCollection.length} cards)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCollection.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">No cards found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or open some packs in the shop!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredCollection.map((group) => (
                <div
                  key={group.definition.id}
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedCard(group)}
                >
                  <CardView
                    card={group.definition}
                    foil={group.foilCount > 0}
                    size="small"
                    interactive
                    className="transition-transform hover:scale-105"
                  />
                  
                  {/* Count badge */}
                  <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full">
                    {group.totalCount}
                    {group.foilCount > 0 && (
                      <span className="ml-1">✨{group.foilCount}</span>
                    )}
                  </div>
                  
                  {/* Rarity indicator */}
                  <div className={cn(
                    "absolute bottom-2 right-2 w-3 h-3 rounded-full",
                    group.definition.rarities?.code === 'mythic' && "bg-orange-400",
                    group.definition.rarities?.code === 'rare' && "bg-blue-400",
                    group.definition.rarities?.code === 'uncommon' && "bg-green-400",
                    group.definition.rarities?.code === 'common' && "bg-gray-400",
                    group.definition.rarities?.code === 'land' && "bg-purple-400"
                  )} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedCard(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedCard.definition.name}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCard(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <CardView
                  card={selectedCard.definition}
                  foil={selectedCard.foilCount > 0}
                  size="large"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Card Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Type:</strong> {selectedCard.definition.typeLine}</div>
                    <div><strong>Rarity:</strong> {selectedCard.definition.rarities?.display_name}</div>
                    <div><strong>Set:</strong> {selectedCard.definition.card_sets?.name}</div>
                    {selectedCard.definition.manaCost && (
                      <div><strong>Mana Cost:</strong> {selectedCard.definition.manaCost}</div>
                    )}
                    {selectedCard.definition.power !== null && selectedCard.definition.toughness !== null && (
                      <div><strong>P/T:</strong> {selectedCard.definition.power}/{selectedCard.definition.toughness}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Your Copies</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total:</strong> {selectedCard.totalCount} copies</div>
                    <div><strong>Foils:</strong> {selectedCard.foilCount} copies ✨</div>
                    <div><strong>Regular:</strong> {selectedCard.totalCount - selectedCard.foilCount} copies</div>
                  </div>
                </div>
                
                {selectedCard.definition.oracleText && (
                  <div>
                    <h3 className="font-semibold mb-2">Oracle Text</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded">
                      {selectedCard.definition.oracleText}
                    </p>
                  </div>
                )}
                
                {selectedCard.definition.flavorText && (
                  <div>
                    <h3 className="font-semibold mb-2">Flavor Text</h3>
                    <p className="text-sm italic text-gray-600">
                      "{selectedCard.definition.flavorText}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionClient;
