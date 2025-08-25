'use client';

// Updated: Fixed property names to match CardDefinition type (typeLine, oracleText, manaCost, flavorText)
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CardView from '@/components/CardView';
import { cn } from '@/lib/utils';
import { ES_TRANSLATIONS, translateCardType, translateRarity } from '@/lib/localization/es';
import ManaSymbol from '@/components/ManaSymbol';
import PowerToughnessDisplay from '@/components/PowerToughnessDisplay';
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
  console.log('CollectionClient component rendered with props:', { 
    initialCollectionLength: initialCollection.length, 
    initialSummaryLength: initialSummary.length, 
    initialTotalCards 
  });
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
    console.log('CollectionClient useEffect triggered, initialCollection length:', initialCollection.length);
    
    const fetchCollection = async () => {
      console.log('Starting fetchCollection...');
      setIsLoading(true);
      try {
        console.log('Fetching collection from API...');
        const response = await fetch('/api/collection');
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API response data:', data);
          console.log('Setting collection with length:', data.collection?.length || 0);
          console.log('Setting totalCards:', data.totalCards || 0);
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

    // Always fetch collection data
    fetchCollection();
  }, []); // Remove dependency on initialCollection

  // Filter and sort collection
  const filteredCollection = useMemo(() => {
    console.log('Filtering collection with length:', collection.length);
    
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

    console.log('After filtering, collection length:', filtered.length);

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

    console.log('Final filtered collection length:', filtered.length);
    return filtered;
  }, [collection, searchTerm, selectedRarity, selectedType, sortBy, showFoilsOnly]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    console.log('Calculating summary stats with collection length:', collection.length, 'totalCards:', totalCards);
    
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

    console.log('Summary stats calculated:', stats);
    return stats;
  }, [collection, totalCards]);

  if (isLoading && collection.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>{ES_TRANSLATIONS.ui.loadingCollection}</p>
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
              <div className="text-sm text-gray-600">{ES_TRANSLATIONS.ui.uniqueCards}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summaryStats.totalCards}</div>
              <div className="text-sm text-gray-600">{ES_TRANSLATIONS.ui.totalCards}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summaryStats.totalFoils}</div>
              <div className="text-sm text-gray-600">{ES_TRANSLATIONS.ui.foilCards}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {summaryStats.byRarity.mythic?.count || 0}
              </div>
              <div className="text-sm text-gray-600">{ES_TRANSLATIONS.ui.mythicCards}</div>
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
              placeholder={ES_TRANSLATIONS.ui.searchCards}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
            
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">{ES_TRANSLATIONS.ui.allRarities}</option>
              <option value="common">{ES_TRANSLATIONS.rarities.common}</option>
              <option value="uncommon">{ES_TRANSLATIONS.rarities.uncommon}</option>
              <option value="rare">{ES_TRANSLATIONS.rarities.rare}</option>
              <option value="mythic">{ES_TRANSLATIONS.rarities.mythic}</option>
              <option value="land">{ES_TRANSLATIONS.rarities.land}</option>
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">{ES_TRANSLATIONS.ui.allTypes}</option>
              <option value="creature">{ES_TRANSLATIONS.cardTypes.creature}s</option>
              <option value="instant">{ES_TRANSLATIONS.cardTypes.instant}s</option>
              <option value="sorcery">{ES_TRANSLATIONS.cardTypes.sorcery}s</option>
              <option value="artifact">{ES_TRANSLATIONS.cardTypes.artifact}s</option>
              <option value="enchantment">{ES_TRANSLATIONS.cardTypes.enchantment}s</option>
              <option value="land">{ES_TRANSLATIONS.cardTypes.land}s</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded-md px-3 py-2"
            >
              <option value="name">{ES_TRANSLATIONS.ui.sortByName}</option>
              <option value="rarity">{ES_TRANSLATIONS.ui.sortByRarity}</option>
              <option value="acquired">{ES_TRANSLATIONS.ui.sortByAcquired}</option>
              <option value="count">{ES_TRANSLATIONS.ui.sortByCount}</option>
            </select>
            
            <label className="flex items-center gap-2 px-3 py-2">
              <input
                type="checkbox"
                checked={showFoilsOnly}
                onChange={(e) => setShowFoilsOnly(e.target.checked)}
              />
              <span className="text-sm">{ES_TRANSLATIONS.ui.foilsOnly} ✨</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Collection Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            {ES_TRANSLATIONS.ui.yourCollection} ({filteredCollection.length} cartas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCollection.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">{ES_TRANSLATIONS.ui.noCardsFound}</h3>
              <p className="text-gray-600">
                {ES_TRANSLATIONS.ui.tryAdjustingFilters}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCollection.map((group) => (
                <div
                  key={group.definition.id}
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedCard(group)}
                >
                  <CardView
                    card={group.definition}
                    foil={group.foilCount > 0}
                    size="medium"
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
            className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto"
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
                  <h3 className="font-semibold mb-2">{ES_TRANSLATIONS.ui.cardDetails}</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>{ES_TRANSLATIONS.ui.type}:</strong> {translateCardType(selectedCard.definition.typeLine || '')}</div>
                    <div><strong>{ES_TRANSLATIONS.ui.rarity}:</strong> {translateRarity(selectedCard.definition.rarity)}</div>
                    <div><strong>{ES_TRANSLATIONS.ui.set}:</strong> {selectedCard.definition.card_sets?.name}</div>
                    {selectedCard.definition.manaCost && (
                      <div className="flex items-center gap-2">
                        <strong>{ES_TRANSLATIONS.ui.manaCost}:</strong>
                        <div className="flex gap-1">
                          {(selectedCard.definition.manaCost.match(/\{[^}]+\}/g) || []).map((symbol, index) => (
                            <ManaSymbol key={index} symbol={symbol.replace(/[{}]/g, '')} size="sm" />
                          ))}
                        </div>
                      </div>
                    )}
                    {(selectedCard.definition.power !== null && selectedCard.definition.power !== undefined) && 
                     (selectedCard.definition.toughness !== null && selectedCard.definition.toughness !== undefined) && (
                      <div className="flex items-center gap-2">
                        <strong>{ES_TRANSLATIONS.ui.powerToughness}:</strong>
                        <PowerToughnessDisplay
                          power={selectedCard.definition.power}
                          toughness={selectedCard.definition.toughness}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{ES_TRANSLATIONS.ui.yourCopies}</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>{ES_TRANSLATIONS.ui.total}:</strong> {selectedCard.totalCount} {ES_TRANSLATIONS.ui.copies}</div>
                    <div><strong>{ES_TRANSLATIONS.ui.foils}:</strong> {selectedCard.foilCount} {ES_TRANSLATIONS.ui.copies} ✨</div>
                    <div><strong>{ES_TRANSLATIONS.ui.regular}:</strong> {selectedCard.totalCount - selectedCard.foilCount} {ES_TRANSLATIONS.ui.copies}</div>
                  </div>
                </div>
                
                {(selectedCard.definition as any).oracleText && (
                  <div>
                    <h3 className="font-semibold mb-2">{ES_TRANSLATIONS.ui.oracleText}</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded">
                      {(selectedCard.definition as any).oracleText}
                    </p>
                  </div>
                )}
                
                {selectedCard.definition.flavorText && (
                  <div>
                    <h3 className="font-semibold mb-2">{ES_TRANSLATIONS.ui.flavorText}</h3>
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
