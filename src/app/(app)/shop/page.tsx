'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PackOpeningAnimation from '@/components/PackOpeningAnimation';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/utils';

interface UserCurrency {
  coins: number;
}

export default function ShopPage() {
  const [userCurrency, setUserCurrency] = useState<UserCurrency>({ coins: 0 });
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
      const response = await fetch('/api/open-pack-direct', {
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          🛒 Tienda de Sobres
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Abre sobres y consigue cartas chulas
        </p>
        <div className="flex justify-center text-lg">
          <span className="font-semibold text-yellow-600">💰 {formatCurrency(userCurrency.coins)}</span>
        </div>
      </div>

      {/* Featured Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Base Set Booster */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-500 text-white px-2 py-1 text-xs font-bold">
            RECOMENDADO
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📦 Sobre Base
            </CardTitle>
            <CardDescription>
              15 cartas incluyendo al menos 1 rara o mítica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Contiene:</h4>
                <ul className="text-sm space-y-1">
                  <li>• 10 Cartas comunes</li>
                  <li>• 3 Cartas infrecuentes</li>
                  <li>• 1 Carta rara o mítica</li>
                  <li>• 1 Tierra básica</li>
                  <li>• 1% de chance foil</li>
                </ul>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">{formatCurrency(150)}</p>
                <p className="text-sm text-gray-600">por sobre</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bundle Deals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📦📦📦 Packs
            </CardTitle>
            <CardDescription>
              Más sobres, más diversión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span>3 Sobres</span>
                  <span className="font-mono">{formatCurrency(400)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span>6 Sobres</span>
                  <span className="font-mono">{formatCurrency(750)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200">
                  <span>12 Sobres</span>
                  <div className="text-right">
                    <div className="font-mono">{formatCurrency(1400)}</div>
                    <div className="text-xs text-yellow-600">¡Ahorras 200 moneditas!</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen Simple */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎮 ¡Simple y Directo!
            </CardTitle>
            <CardDescription>
              Solo moneditas, solo diversión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🪙</p>
                <p className="text-gray-600 mb-4">
                  Todo se compra con moneditas. Nada de complicaciones.
                </p>
                <Button disabled>
                  ¡Así de Simple!
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pack Opening Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Abrir Sobres</CardTitle>
          <CardDescription>
            Elige tus sobres y descubre tus cartas con increíbles animaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Set Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Set</label>
              <select
                value="BASE"
                className="w-full border rounded-md px-3 py-2"
                disabled
              >
                <option value="BASE">Base Set</option>
              </select>
            </div>

            {/* Quantity Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Cantidad (Cuesta: {formatCurrency(150)})
              </label>
              <div className="flex items-center gap-2">
                <span className="w-12 text-center font-mono">1</span>
              </div>
            </div>

            {/* Open Button */}
            <button
              onClick={() => {
                // Trigger the pack opening animation
                window.dispatchEvent(new CustomEvent('openPackAnimation'));
              }}
              disabled={userCurrency.coins < 150}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              🎴 ¡ABRIR SOBRE MÁGICO! 🎴
            </button>

            {userCurrency.coins < 150 && (
              <p className="text-sm text-red-600 text-center">
                ¡No tienes suficientes moneditas! Te faltan {formatCurrency(150 - userCurrency.coins)}.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Pack Opening Animation */}
      <PackOpeningAnimation
        onOpenPack={handlePackOpen}
        userCoins={userCurrency.coins}
      />

      {/* Shop Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🪙 Consigue Moneditas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Entrar cada día: +100 moneditas</li>
              <li>• Jugar partidas: +50 moneditas</li>
              <li>• Ganar partidas: +100 moneditas</li>
              <li>• Primera victoria del día: +200 moneditas</li>
              <li>• Misiones: hasta +500 moneditas</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Legal Text */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-xs text-gray-500 text-center">
            Todo es aleatorio y gratis. Solo para pasar el rato con los colegas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
