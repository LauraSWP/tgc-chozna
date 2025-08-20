'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CardView from '@/components/CardView';
import { cn, formatNumber } from '@/lib/utils';
import { validateDeckFormat } from '@/lib/validate';
import type { CardDefinition } from '@/lib/game/types';

interface UserCard {
  id: string;
  card_def_id: string;
  foil: boolean;
  card_definitions: CardDefinition;
}

interface DeckCard {
  user_card_id: string;
  qty: number;
  is_sideboard: boolean;
}

interface DeckBuilderProps {
  collection: UserCard[];
  deckCards?: DeckCard[];
  onDeckUpdate?: (cards: DeckCard[]) => void;
  onSaveDeck?: (name: string, description?: string) => Promise<void>;
  className?: string;
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({
  collection,
  deckCards = [],
  onDeckUpdate,
  onSaveDeck,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showSideboard, setShowSideboard] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filter collection
  const filteredCollection = useMemo(() => {
    return collection.filter(userCard => {
      const card = userCard.card_definitions;
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.typeLine.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = selectedRarity === 'all' || card.rarity === selectedRarity;
      const matchesType = selectedType === 'all' || card.typeLine.toLowerCase().includes(selectedType.toLowerCase());
      
      return matchesSearch && matchesRarity && matchesType;
    });
  }, [collection, searchTerm, selectedRarity, selectedType]);

  // Group collection by card definition
  const groupedCollection = useMemo(() => {
    const groups = new Map<string, UserCard[]>();
    
    filteredCollection.forEach(userCard => {
      const key = userCard.card_def_id;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(userCard);
    });
    
    return Array.from(groups.entries()).map(([cardDefId, cards]) => ({
      cardDefId,
      cards,
      definition: cards[0].card_definitions,
      totalCount: cards.length,
      foilCount: cards.filter(c => c.foil).length,
    }));
  }, [filteredCollection]);

  // Calculate deck stats
  const deckStats = useMemo(() => {
    const mainboard = deckCards.filter(c => !c.is_sideboard);
    const sideboard = deckCards.filter(c => c.is_sideboard);
    
    const mainboardCount = mainboard.reduce((sum, card) => sum + card.qty, 0);
    const sideboardCount = sideboard.reduce((sum, card) => sum + card.qty, 0);
    
    // Build validation data
    const allCards = deckCards.map(deckCard => {
      const userCard = collection.find(c => c.id === deckCard.user_card_id);
      return {
        ...userCard?.card_definitions,
        qty: deckCard.qty
      };
    }).filter(Boolean);
    
    const validation = validateDeckFormat(allCards);
    
    return {
      mainboardCount,
      sideboardCount,
      validation
    };
  }, [deckCards, collection]);

  const getCardQuantityInDeck = (userCardId: string, isSideboard: boolean = false) => {
    const deckCard = deckCards.find(c => c.user_card_id === userCardId && c.is_sideboard === isSideboard);
    return deckCard?.qty || 0;
  };

  const updateCardQuantity = (userCardId: string, newQty: number, isSideboard: boolean = false) => {
    const updatedDeckCards = [...deckCards];
    const existingIndex = updatedDeckCards.findIndex(
      c => c.user_card_id === userCardId && c.is_sideboard === isSideboard
    );

    if (newQty <= 0) {
      if (existingIndex >= 0) {
        updatedDeckCards.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex >= 0) {
        updatedDeckCards[existingIndex].qty = newQty;
      } else {
        updatedDeckCards.push({
          user_card_id: userCardId,
          qty: newQty,
          is_sideboard: isSideboard
        });
      }
    }

    onDeckUpdate?.(updatedDeckCards);
  };

  const handleSaveDeck = async () => {
    if (!deckName.trim() || !onSaveDeck) return;
    
    setIsSaving(true);
    try {
      await onSaveDeck(deckName.trim(), deckDescription.trim() || undefined);
    } catch (error) {
      console.error('Failed to save deck:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}>
      {/* Collection Browser */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
            </div>

            {/* Collection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {groupedCollection.map(({ cardDefId, cards, definition, totalCount, foilCount }) => {
                const userCard = cards[0]; // Use first card for operations
                const inDeck = getCardQuantityInDeck(userCard.id, showSideboard);
                const maxCopies = Math.min(4, totalCount); // TCG rule: max 4 copies
                
                return (
                  <div key={cardDefId} className="relative">
                    <CardView
                      card={definition}
                      foil={foilCount > 0}
                      size="small"
                      interactive
                      selected={inDeck > 0}
                    />
                    
                    {/* Quantity controls */}
                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0 text-xs"
                        onClick={() => updateCardQuantity(userCard.id, Math.max(0, inDeck - 1), showSideboard)}
                        disabled={inDeck <= 0}
                      >
                        -
                      </Button>
                      
                      <span className="bg-white border rounded px-1 text-xs min-w-[1.5rem] text-center">
                        {inDeck}
                      </span>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0 text-xs"
                        onClick={() => updateCardQuantity(userCard.id, Math.min(maxCopies, inDeck + 1), showSideboard)}
                        disabled={inDeck >= maxCopies}
                      >
                        +
                      </Button>
                    </div>
                    
                    {/* Collection count */}
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                      {totalCount}{foilCount > 0 && '✨'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deck Panel */}
      <div className="space-y-4">
        {/* Deck Info */}
        <Card>
          <CardHeader>
            <CardTitle>Deck Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Deck name..."
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
            
            <textarea
              placeholder="Deck description..."
              value={deckDescription}
              onChange={(e) => setDeckDescription(e.target.value)}
              className="w-full border rounded-md px-3 py-2 h-20 resize-none"
            />
            
            <Button
              onClick={handleSaveDeck}
              disabled={!deckName.trim() || isSaving}
              className="w-full"
            >
              {isSaving ? 'Saving...' : 'Save Deck'}
            </Button>
          </CardContent>
        </Card>

        {/* Deck Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Deck Stats
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSideboard(!showSideboard)}
              >
                {showSideboard ? 'Sideboard' : 'Mainboard'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Cards:</span>
              <span className={cn(
                'font-mono',
                deckStats.mainboardCount < 60 && 'text-red-600',
                deckStats.mainboardCount === 60 && 'text-green-600'
              )}>
                {showSideboard ? deckStats.sideboardCount : deckStats.mainboardCount}
                {!showSideboard && '/60'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Legal:</span>
              <span className={deckStats.validation.valid ? 'text-green-600' : 'text-red-600'}>
                {deckStats.validation.valid ? 'Yes' : 'No'}
              </span>
            </div>
            
            {deckStats.validation.errors.length > 0 && (
              <div className="text-xs text-red-600 space-y-1">
                {deckStats.validation.errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
            
            {deckStats.validation.warnings.length > 0 && (
              <div className="text-xs text-yellow-600 space-y-1">
                {deckStats.validation.warnings.map((warning, index) => (
                  <div key={index}>• {warning}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Deck List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {showSideboard ? 'Sideboard' : 'Mainboard'} 
              ({showSideboard ? deckStats.sideboardCount : deckStats.mainboardCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {deckCards
                .filter(card => card.is_sideboard === showSideboard)
                .map(deckCard => {
                  const userCard = collection.find(c => c.id === deckCard.user_card_id);
                  if (!userCard) return null;
                  
                  return (
                    <div key={deckCard.user_card_id} className="flex items-center justify-between text-sm">
                      <span className="flex-1 truncate">
                        {deckCard.qty}x {userCard.card_definitions.name}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0 text-xs"
                        onClick={() => updateCardQuantity(deckCard.user_card_id, 0, showSideboard)}
                      >
                        ×
                      </Button>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeckBuilder;
