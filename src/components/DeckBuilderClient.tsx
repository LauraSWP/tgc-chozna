'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DeckBuilder from '@/components/DeckBuilder';
import { cn } from '@/lib/utils';
import type { CardDefinition } from '@/lib/game/types';

interface UserCard {
  id: string;
  card_def_id: string;
  foil: boolean;
  card_definitions: CardDefinition & {
    // Additional database fields for compatibility
    rarities?: any;
    card_sets?: any;
    oracleText?: string;
  };
}

interface DeckCard {
  user_card_id: string;
  qty: number;
  is_sideboard: boolean;
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  format: string;
  is_legal: boolean;
  created_at: string;
  updated_at: string;
}

interface DeckSummary extends Deck {
  total_cards: number;
  mainboard_cards: number;
  sideboard_cards: number;
}

interface DeckBuilderClientProps {
  collection: UserCard[];
  decks: DeckSummary[];
}

const DeckBuilderClient: React.FC<DeckBuilderClientProps> = ({
  collection: initialCollection,
  decks: initialDecks
}) => {
  const [view, setView] = useState<'list' | 'builder'>('list');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [decks, setDecks] = useState<DeckSummary[]>(initialDecks);
  const [collection, setCollection] = useState<UserCard[]>(initialCollection);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch initial data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (initialCollection.length === 0 && initialDecks.length === 0) {
        setDataLoading(true);
        try {
          // Fetch collection and decks in parallel
          const [collectionResponse, decksResponse] = await Promise.all([
            fetch('/api/collection'),
            fetch('/api/decks')
          ]);

          if (collectionResponse.ok) {
            const collectionData = await collectionResponse.json();
            // Transform collection data for deck builder
            const transformedCollection: UserCard[] = [];
            collectionData.collection?.forEach((group: any) => {
              group.cards.forEach((userCard: any) => {
                transformedCollection.push({
                  id: userCard.id,
                  card_def_id: userCard.card_def_id,
                  foil: userCard.foil,
                  card_definitions: group.definition
                });
              });
            });
            setCollection(transformedCollection);
          }

          if (decksResponse.ok) {
            const decksData = await decksResponse.json();
            setDecks(decksData.decks || []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    fetchData();
  }, [initialCollection, initialDecks]);

  // Fetch deck details when a deck is selected
  const loadDeckDetails = async (deckId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/decks/${deckId}`);
      if (!response.ok) throw new Error('Failed to load deck');
      
      const data = await response.json();
      setSelectedDeck(data.deck);
      
      // Transform the deck cards data
      const transformedCards = data.cards.map((item: any) => ({
        user_card_id: item.user_card_id,
        qty: item.qty,
        is_sideboard: item.is_sideboard
      }));
      
      setDeckCards(transformedCards);
      setView('builder');
    } catch (error) {
      console.error('Error loading deck:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new deck
  const createNewDeck = () => {
    setSelectedDeck(null);
    setDeckCards([]);
    setView('builder');
  };

  // Save deck
  const saveDeck = async (name: string, description?: string) => {
    try {
      const deckData = {
        name,
        description,
        format: 'casual',
        cards: deckCards
      };

      let response;
      if (selectedDeck) {
        // Update existing deck
        response = await fetch(`/api/decks/${selectedDeck.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deckData)
        });
      } else {
        // Create new deck
        response = await fetch('/api/decks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deckData)
        });
      }

      if (!response.ok) throw new Error('Failed to save deck');

      // Refresh decks list
      const decksResponse = await fetch('/api/decks');
      if (decksResponse.ok) {
        const decksData = await decksResponse.json();
        setDecks(decksData.decks);
      }

      // Go back to list view
      setView('list');
    } catch (error) {
      console.error('Error saving deck:', error);
      throw error;
    }
  };

  // Delete deck
  const deleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck?')) return;

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete deck');

      // Remove from local state
      setDecks(decks.filter(d => d.id !== deckId));
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading deck builder...</p>
        </div>
      </div>
    );
  }

  if (view === 'builder') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {selectedDeck ? `Editing: ${selectedDeck.name}` : 'New Deck'}
            </h1>
            <p className="text-gray-600">Build your perfect deck from your collection</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setView('list')}
          >
            ← Back to Decks
          </Button>
        </div>

        {/* Deck Builder */}
        <DeckBuilder
          collection={collection}
          deckCards={deckCards}
          onDeckUpdate={setDeckCards}
          onSaveDeck={saveDeck}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🏗️ Deck Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create and manage your decks
          </p>
        </div>
        <Button onClick={createNewDeck}>
          + New Deck
        </Button>
      </div>

      {/* Decks List */}
      {decks.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">🃏</div>
              <h3 className="text-xl font-semibold">No decks yet!</h3>
              <p className="text-gray-600">
                Create your first deck to start building competitive strategies.
              </p>
              <Button onClick={createNewDeck}>
                Create Your First Deck
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Card key={deck.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{deck.name}</CardTitle>
                    {deck.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {deck.description}
                      </p>
                    )}
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    deck.is_legal 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  )}>
                    {deck.is_legal ? 'Legal' : 'Invalid'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Deck Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Format</div>
                      <div className="font-medium capitalize">{deck.format}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Cards</div>
                      <div className="font-medium">
                        {deck.mainboard_cards}
                        {deck.sideboard_cards > 0 && (
                          <span className="text-gray-500"> + {deck.sideboard_cards} SB</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Deck Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => loadDeckDetails(deck.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Edit'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteDeck(deck.id)}
                    >
                      🗑️
                    </Button>
                  </div>

                  {/* Last Modified */}
                  <div className="text-xs text-gray-500">
                    Updated {new Date(deck.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{decks.length}</div>
              <div className="text-sm text-gray-600">Total Decks</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {decks.filter(d => d.is_legal).length}
              </div>
              <div className="text-sm text-gray-600">Legal Decks</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{collection.length}</div>
              <div className="text-sm text-gray-600">Cards Available</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeckBuilderClient;
