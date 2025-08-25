'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ManaSymbol from '@/components/ManaSymbol';

interface ManaCostBuilderProps {
  manaCost: string;
  onChange: (manaCost: string) => void;
  className?: string;
}

const ManaCostBuilder: React.FC<ManaCostBuilderProps> = ({ manaCost, onChange, className = '' }) => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(() => {
    // Parse existing mana cost
    const symbols = manaCost.match(/\{[^}]+\}/g) || [];
    return symbols.map(s => s.slice(1, -1));
  });

  const manaTypes = [
    { symbol: 'W', name: 'Blanco', description: 'Maná Blanco', icon: '☀️', color: 'text-yellow-600 bg-yellow-100' },
    { symbol: 'U', name: 'Azul', description: 'Maná Azul', icon: '💧', color: 'text-blue-600 bg-blue-100' },
    { symbol: 'B', name: 'Negro', description: 'Maná Negro', icon: '💀', color: 'text-purple-600 bg-purple-100' },
    { symbol: 'R', name: 'Rojo', description: 'Maná Rojo', icon: '🔥', color: 'text-red-600 bg-red-100' },
    { symbol: 'G', name: 'Verde', description: 'Maná Verde', icon: '🌿', color: 'text-green-600 bg-green-100' },
    { symbol: 'C', name: 'Incoloro', description: 'Maná Incoloro', icon: '◇', color: 'text-gray-600 bg-gray-100' },
  ];

  const colorlessOptions = Array.from({ length: 16 }, (_, i) => i.toString());

  const hybridMana = [
    { symbol: 'W/U', name: 'Blanco/Azul', icon: '☀️💧' },
    { symbol: 'W/B', name: 'Blanco/Negro', icon: '☀️💀' },
    { symbol: 'U/B', name: 'Azul/Negro', icon: '💧💀' },
    { symbol: 'U/R', name: 'Azul/Rojo', icon: '💧🔥' },
    { symbol: 'B/R', name: 'Negro/Rojo', icon: '💀🔥' },
    { symbol: 'B/G', name: 'Negro/Verde', icon: '💀🌿' },
    { symbol: 'R/G', name: 'Rojo/Verde', icon: '🔥🌿' },
    { symbol: 'R/W', name: 'Rojo/Blanco', icon: '🔥☀️' },
    { symbol: 'G/W', name: 'Verde/Blanco', icon: '🌿☀️' },
    { symbol: 'G/U', name: 'Verde/Azul', icon: '🌿💧' },
  ];

  const phyrexianMana = [
    { symbol: 'W/P', name: 'Blanco Phyrexiano', icon: '☀️⚡' },
    { symbol: 'U/P', name: 'Azul Phyrexiano', icon: '💧⚡' },
    { symbol: 'B/P', name: 'Negro Phyrexiano', icon: '💀⚡' },
    { symbol: 'R/P', name: 'Rojo Phyrexiano', icon: '🔥⚡' },
    { symbol: 'G/P', name: 'Verde Phyrexiano', icon: '🌿⚡' },
  ];

  const addSymbol = (symbol: string) => {
    const newSymbols = [...selectedSymbols, symbol];
    setSelectedSymbols(newSymbols);
    const newManaCost = newSymbols.map(s => `{${s}}`).join('');
    onChange(newManaCost);
  };

  const removeSymbol = (index: number) => {
    const newSymbols = selectedSymbols.filter((_, i) => i !== index);
    setSelectedSymbols(newSymbols);
    const newManaCost = newSymbols.map(s => `{${s}}`).join('');
    onChange(newManaCost);
  };

  const clearAll = () => {
    setSelectedSymbols([]);
    onChange('');
  };

  const getConvertedManaCost = () => {
    let total = 0;
    selectedSymbols.forEach(symbol => {
      if (/^\d+$/.test(symbol)) {
        total += parseInt(symbol);
      } else if (symbol.includes('/P')) {
        // Phyrexian mana can be paid with 2 life instead
        total += 1;
      } else if (symbol.includes('/')) {
        // Hybrid mana
        total += 1;
      } else {
        // Regular colored mana
        total += 1;
      }
    });
    return total;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          🎯 Constructor de Coste de Maná
          <span className="text-sm font-normal text-gray-600">
            (CMC: {getConvertedManaCost()})
          </span>
        </h3>

        {/* Current Mana Cost Display */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">Coste Actual:</span>
            {selectedSymbols.length === 0 ? (
              <span className="text-gray-500 italic">Sin coste de maná</span>
            ) : (
              <div className="flex gap-1">
                {selectedSymbols.map((symbol, index) => (
                  <div key={index} className="relative group">
                    <ManaSymbol symbol={symbol} size="lg" />
                    <button
                      onClick={() => removeSymbol(index)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={clearAll} variant="outline" size="sm" disabled={selectedSymbols.length === 0}>
              🗑️ Limpiar Todo
            </Button>
          </div>
        </div>

        {/* Mana Type Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Basic Mana */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 border-b pb-1">Maná Básico</h4>
            <div className="grid grid-cols-2 gap-2">
              {manaTypes.map(mana => (
                <button
                  key={mana.symbol}
                  onClick={() => addSymbol(mana.symbol)}
                  className={`p-3 rounded-lg border-2 border-transparent hover:border-gray-300 transition-all ${mana.color} text-center`}
                  title={mana.description}
                >
                  <div className="text-2xl mb-1">{mana.icon}</div>
                  <div className="text-xs font-medium">{mana.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Colorless Numbers */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 border-b pb-1">Maná Incoloro</h4>
            <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
              {colorlessOptions.map(num => (
                <button
                  key={num}
                  onClick={() => addSymbol(num)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded border text-center font-bold text-gray-700 transition-colors"
                  title={`${num} maná incoloro`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Hybrid Mana */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 border-b pb-1">Maná Híbrido</h4>
            <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
              {hybridMana.map(hybrid => (
                <button
                  key={hybrid.symbol}
                  onClick={() => addSymbol(hybrid.symbol)}
                  className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded border text-center text-xs transition-colors"
                  title={`Maná ${hybrid.name}`}
                >
                  <div className="text-sm">{hybrid.icon}</div>
                  <div className="text-xs">{hybrid.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Phyrexian Mana */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 border-b pb-1">Maná Phyrexiano</h4>
            <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
              {phyrexianMana.map(phyrexian => (
                <button
                  key={phyrexian.symbol}
                  onClick={() => addSymbol(phyrexian.symbol)}
                  className="p-2 bg-gradient-to-r from-red-100 to-black-100 hover:from-red-200 hover:to-gray-200 rounded border text-center text-xs transition-colors"
                  title={`${phyrexian.name} (Puedes pagar con 2 vidas)`}
                >
                  <div className="text-sm">{phyrexian.icon}</div>
                  <div className="text-xs">{phyrexian.name}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Presets */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-3">Presets Comunes</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setSelectedSymbols(['1']);
                onChange('{1}');
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              1 - Coste bajo
            </Button>
            <Button
              onClick={() => {
                setSelectedSymbols(['2']);
                onChange('{2}');
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              2 - Coste medio
            </Button>
            <Button
              onClick={() => {
                setSelectedSymbols(['3']);
                onChange('{3}');
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              3 - Coste alto
            </Button>
            <Button
              onClick={() => {
                setSelectedSymbols(['1', 'W']);
                onChange('{1}{W}');
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              1W - Criatura pequeña
            </Button>
            <Button
              onClick={() => {
                setSelectedSymbols(['2', 'U']);
                onChange('{2}{U}');
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              2U - Hechizo medio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManaCostBuilder;
