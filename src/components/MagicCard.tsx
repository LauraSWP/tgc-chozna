'use client';

import React, { useState } from 'react';

interface MagicCardProps {
  name: string;
  manaCost: string;
  type: string;
  power?: number;
  toughness?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  artwork?: string;
  rulesText: string;
  flavorText?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  onClick?: () => void;
}

// Colores por tipo de carta (como Magic)
const typeColors = {
  // Básicos
  'Criatura': 'from-green-700 via-green-600 to-green-800',
  'Instantáneo': 'from-blue-700 via-blue-600 to-blue-800', 
  'Conjuro': 'from-red-700 via-red-600 to-red-800',
  'Encantamiento': 'from-white-600 via-white-500 to-white-700',
  'Artefacto': 'from-gray-600 via-gray-500 to-gray-700',
  'Tierra': 'from-brown-600 via-amber-600 to-yellow-700',
  'Planeswalker': 'from-purple-700 via-purple-600 to-purple-800',
  
  // Magic colors
  'Creature': 'from-green-700 via-green-600 to-green-800',
  'Instant': 'from-blue-700 via-blue-600 to-blue-800',
  'Sorcery': 'from-red-700 via-red-600 to-red-800',
  'Enchantment': 'from-white-600 via-white-500 to-white-700',
  'Artifact': 'from-gray-600 via-gray-500 to-gray-700',
  'Land': 'from-brown-600 via-amber-600 to-yellow-700',
  
  // Default
  'default': 'from-gray-700 via-gray-600 to-gray-800'
};

const rarityColors = {
  common: '#6B7280',
  uncommon: '#10B981', 
  rare: '#3B82F6',
  mythic: '#F59E0B'
};

const raritySymbols = {
  common: '●',
  uncommon: '◆',
  rare: '★',
  mythic: '◆'
};

export default function MagicCard({ 
  name, 
  manaCost, 
  type, 
  power, 
  toughness, 
  rarity, 
  artwork, 
  rulesText, 
  flavorText,
  size = 'medium',
  className = '',
  onClick
}: MagicCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const sizeClasses = {
    small: 'w-40 h-56',
    medium: 'w-56 h-76',
    large: 'w-72 h-96',
    xl: 'w-80 h-[28rem]'
  };

  const textSizes = {
    small: { name: 'text-sm', type: 'text-xs', rules: 'text-xs', pt: 'text-sm' },
    medium: { name: 'text-base', type: 'text-sm', rules: 'text-sm', pt: 'text-base' },
    large: { name: 'text-lg', type: 'text-base', rules: 'text-base', pt: 'text-lg' },
    xl: { name: 'text-xl', type: 'text-lg', rules: 'text-lg', pt: 'text-xl' }
  };

  // Obtener color específico del tipo
  const getTypeColor = (cardType: string) => {
    const typeKey = Object.keys(typeColors).find(key => 
      cardType.toLowerCase().includes(key.toLowerCase())
    );
    return typeColors[typeKey as keyof typeof typeColors] || typeColors.default;
  };

  const handleCardClick = () => {
    setIsZoomed(true);
    if (onClick) onClick();
  };

  const handleCloseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
  };

  return (
    <>
      {/* Modal de Zoom */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleCloseZoom}
        >
          <div className="relative max-w-lg max-h-screen">
            <MagicCard
              name={name}
              manaCost={manaCost}
              type={type}
              power={power}
              toughness={toughness}
              rarity={rarity}
              artwork={artwork}
              rulesText={rulesText}
              flavorText={flavorText}
              size="xl"
              className="shadow-2xl"
            />
            <button
              className="absolute -top-10 -right-10 text-white text-2xl hover:text-red-400"
              onClick={handleCloseZoom}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Carta Normal */}
    <div 
      className={`${sizeClasses[size]} ${className} relative transform transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer`}
      onClick={handleCardClick}
    >
      {/* Card Frame */}
      <div className={`w-full h-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-800 bg-gradient-to-b ${getTypeColor(type)} relative`}>
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gray-200 to-gray-300 px-2 py-1 border-b border-gray-400">
          <div className="flex justify-between items-center">
            <span className={`font-bold text-black ${textSizes[size].name} truncate flex-1`}>
              {name}
            </span>
            <div className="flex items-center space-x-1 ml-2">
              {manaCost.split('').map((symbol, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full bg-gray-600 text-white text-xs flex items-center justify-center font-bold"
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Artwork Area */}
        <div className="relative bg-gradient-to-br from-blue-200 via-green-200 to-purple-200 mx-1 mt-1 rounded overflow-hidden" 
             style={{ height: size === 'small' ? '60px' : size === 'medium' ? '100px' : '140px' }}>
          {artwork ? (
            <img src={artwork} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400">
              <span className="text-gray-600 text-xs">Artwork</span>
            </div>
          )}
          
          {/* Rarity Symbol */}
          <div 
            className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: rarityColors[rarity], color: rarity === 'common' ? 'white' : 'black' }}
          >
            {raritySymbols[rarity]}
          </div>
        </div>

        {/* Type Line */}
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 px-2 py-1 mx-1 mt-1 rounded border border-gray-400">
          <span className={`text-black font-semibold ${textSizes[size].type}`}>
            {type}
          </span>
        </div>

        {/* Rules Text */}
        <div className="px-2 py-1 mx-1 mt-1 bg-white rounded border border-gray-300 flex-1 overflow-hidden">
          <p className={`text-black ${textSizes[size].rules} leading-tight`}>
            {rulesText}
          </p>
          {flavorText && (
            <p className={`text-gray-600 italic mt-1 ${textSizes[size].rules} leading-tight`}>
              <em>"{flavorText}"</em>
            </p>
          )}
        </div>

        {/* Power/Toughness with Icons */}
        {(power !== undefined && toughness !== undefined) && (
          <div className="absolute bottom-2 right-2 bg-gray-200 border-2 border-gray-800 rounded-md px-2 py-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-red-600">⚔️</span>
                <span className={`font-bold text-black ${textSizes[size].pt}`}>
                  {power}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600">🛡️</span>
                <span className={`font-bold text-black ${textSizes[size].pt}`}>
                  {toughness}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card Border Glow Effect */}
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 2px ${rarityColors[rarity]}40`,
          }}
        />
      </div>
    </div>
    </>
  );
}
