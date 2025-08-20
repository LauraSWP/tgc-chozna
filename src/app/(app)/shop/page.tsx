'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PackOpenReveal from '@/components/PackOpenReveal';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/utils';

interface UserCurrency {
  coins: number;
  gems: number;
}

export default function ShopPage() {
  const [userCurrency, setUserCurrency] = useState<UserCurrency>({ coins: 0, gems: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserCurrency();
  }, []);

  const fetchUserCurrency = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_currencies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserCurrency(data);
      }
    } catch (error) {
      console.error('Error fetching currency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackOpen = async (setCode: string, quantity: number) => {
    try {
      const response = await fetch('/api/packs/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          set_code: setCode,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Pack opening failed');
      }

      // Update currency after successful pack opening
      if (data.remainingCoins !== undefined) {
        setUserCurrency(prev => ({
          ...prev,
          coins: data.remainingCoins,
        }));
      }

      return data;
    } catch (error) {
      console.error('Pack opening error:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shop Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🛒 Card Shop
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Open booster packs to expand your collection
        </p>
        <div className="flex justify-center space-x-4 text-lg">
          <span>{formatCurrency(userCurrency.coins, 'coins')}</span>
          <span>{formatCurrency(userCurrency.gems, 'gems')}</span>
        </div>
      </div>

      {/* Featured Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Base Set Booster */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs font-bold">
            FEATURED
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📦 Base Set Booster
            </CardTitle>
            <CardDescription>
              15 cards including at least 1 rare or mythic rare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Contains:</h4>
                <ul className="text-sm space-y-1">
                  <li>• 10 Common cards</li>
                  <li>• 3 Uncommon cards</li>
                  <li>• 1 Rare or Mythic Rare</li>
                  <li>• 1 Basic Land</li>
                  <li>• 1% chance for foil upgrade</li>
                </ul>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">{formatCurrency(150, 'coins')}</p>
                <p className="text-sm text-gray-600">per pack</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bundle Deals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📦📦📦 Bundle Deal
            </CardTitle>
            <CardDescription>
              Get more value with bulk purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span>3 Packs</span>
                  <span className="font-mono">{formatCurrency(400, 'coins')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span>6 Packs</span>
                  <span className="font-mono">{formatCurrency(750, 'coins')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200">
                  <span>12 Packs</span>
                  <div className="text-right">
                    <div className="font-mono">{formatCurrency(1400, 'coins')}</div>
                    <div className="text-xs text-yellow-600">Save 200 coins!</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Currency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💎 Premium Currency
            </CardTitle>
            <CardDescription>
              Get gems for exclusive content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-4xl mb-2">💎</p>
                <p className="text-gray-600 mb-4">
                  Premium features coming soon!
                </p>
                <Button disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pack Opening Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Open Booster Packs</CardTitle>
          <CardDescription>
            Choose your packs and reveal your cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PackOpenReveal
            onOpenPack={handlePackOpen}
            userCoins={userCurrency.coins}
          />
        </CardContent>
      </Card>

      {/* Shop Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>💡 Pack Opening Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Each pack guarantees at least one rare or mythic rare card</li>
              <li>• Foil cards can replace any common card (1% chance)</li>
              <li>• Mythic rares appear in roughly 1 in 8 rare slots</li>
              <li>• All cards are immediately added to your collection</li>
              <li>• Duplicate cards can be used in different decks</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🪙 Earning Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Daily login bonus: +100 coins</li>
              <li>• Completing matches: +50 coins</li>
              <li>• Winning matches: +100 coins</li>
              <li>• First win of the day: +200 coins</li>
              <li>• Weekly quests: up to +500 coins</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Legal Text */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-xs text-gray-500 text-center">
            Pack contents are randomly determined. No real money transactions are involved. 
            This is a fan-made project for educational purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
