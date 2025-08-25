'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CardView from '@/components/CardView';
import CardEditorNew from '@/components/admin/CardEditorNew';
import { supabase } from '@/lib/supabaseClient';
import { cn, getRarityColor } from '@/lib/utils';
import type { CardDefinition } from '@/lib/game/types';

interface CardWithRelations {
  id: string;
  external_code?: string;
  name: string;
  type_line: string;
  mana_cost?: string;
  power?: number;
  toughness?: number;
  keywords?: string[];
  rules_json: any;
  flavor_text?: string;
  artist?: string;
  is_active: boolean;
  rarities?: {
    code: string;
    display_name: string;
    color: string;
  };
  card_sets?: {
    code: string;
    name: string;
  };
}

interface CardManagementClientProps {
  initialCards: CardWithRelations[];
}

const CardManagementClient: React.FC<CardManagementClientProps> = ({ initialCards }) => {
  const [cards, setCards] = useState<CardWithRelations[]>(initialCards);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedSet, setSelectedSet] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Filters and search
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.type_line.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.external_code?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRarity = selectedRarity === 'all' || card.rarities?.code === selectedRarity;
      const matchesSet = selectedSet === 'all' || card.card_sets?.code === selectedSet;
      const matchesActive = showInactive || card.is_active;

      return matchesSearch && matchesRarity && matchesSet && matchesActive;
    });
  }, [cards, searchTerm, selectedRarity, selectedSet, showInactive]);

  // Get unique values for filters
  const rarities = useMemo(() => {
    const unique = new Set(cards.map(c => c.rarities?.code).filter(Boolean));
    return Array.from(unique);
  }, [cards]);

  const sets = useMemo(() => {
    const unique = new Set(cards.map(c => c.card_sets?.code).filter(Boolean));
    return Array.from(unique);
  }, [cards]);

  const handleToggleActive = async (cardId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('card_definitions')
        .update({ is_active: !currentActive })
        .eq('id', cardId);

      if (error) throw error;

      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, is_active: !currentActive } : card
      ));
    } catch (error) {
      console.error('Error toggling card active status:', error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('card_definitions')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      setCards(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleCardSaved = () => {
    // Refresh cards list
    window.location.reload();
  };

  const convertToCardDefinition = (card: CardWithRelations): CardDefinition => ({
    id: card.id,
    setCode: card.card_sets?.code || 'BASE',
    externalCode: card.external_code,
    name: card.name,
    rarity: card.rarities?.code as any || 'common',
    typeLine: card.type_line,
    manaCost: card.mana_cost,
    power: card.power,
    toughness: card.toughness,
    keywords: card.keywords,
    rules: card.rules_json || {},
    flavorText: card.flavor_text,
    artist: card.artist,
  });

  if (showEditor) {
    return (
      <CardEditorNew
        cardId={editingCard || undefined}
        onSave={handleCardSaved}
        onCancel={() => {
          setShowEditor(false);
          setEditingCard(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Search cards..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rarity</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="all">All Rarities</option>
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Set</label>
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="all">All Sets</option>
                {sets.map(set => (
                  <option key={set} value={set}>
                    {set}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show inactive cards</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredCards.length} of {cards.length} cards
        </p>
        <Button
          onClick={() => {
            setEditingCard(null);
            setShowEditor(true);
          }}
        >
          Create New Card
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map((card) => (
          <Card key={card.id} className={cn(
            'relative overflow-hidden',
            !card.is_active && 'opacity-50 border-red-300'
          )}>
            <CardContent className="p-4">
              {/* Card Preview */}
              <div className="mb-4 flex justify-center">
                <CardView
                  card={convertToCardDefinition(card)}
                  size="small"
                />
              </div>

              {/* Card Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Code:</span>
                  <span className="font-mono">{card.external_code || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-semibold">Rarity:</span>
                  <span
                    className="px-2 py-1 rounded text-xs text-white"
                    style={{ backgroundColor: getRarityColor(card.rarities?.code || 'common') }}
                  >
                    {card.rarities?.display_name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Set:</span>
                  <span>{card.card_sets?.code}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Status:</span>
                  <span className={card.is_active ? 'text-green-600' : 'text-red-600'}>
                    {card.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {card.keywords && card.keywords.length > 0 && (
                  <div>
                    <span className="font-semibold">Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {card.keywords.slice(0, 3).map(keyword => (
                        <span
                          key={keyword}
                          className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                      {card.keywords.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{card.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-2">
                <Button
                  onClick={() => {
                    setEditingCard(card.id);
                    setShowEditor(true);
                  }}
                  size="sm"
                  className="w-full"
                >
                  Edit
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleToggleActive(card.id, card.is_active)}
                    size="sm"
                    variant="outline"
                    className={card.is_active ? 'text-red-600' : 'text-green-600'}
                  >
                    {card.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  
                  <Button
                    onClick={() => handleDeleteCard(card.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No cards found matching your filters</p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedRarity('all');
                setSelectedSet('all');
                setShowInactive(false);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CardManagementClient;
