import React from 'react';

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
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const rarityColors = {
  common: '#000000',
  uncommon: '#C0C0C0', 
  rare: '#FFD700',
  mythic: '#FF8C00'
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
  className = ''
}: MagicCardProps) {
  const sizeClasses = {
    small: 'w-32 h-44',
    medium: 'w-48 h-64',
    large: 'w-64 h-80'
  };

  const textSizes = {
    small: { name: 'text-xs', type: 'text-xs', rules: 'text-xs', pt: 'text-xs' },
    medium: { name: 'text-sm', type: 'text-xs', rules: 'text-xs', pt: 'text-sm' },
    large: { name: 'text-base', type: 'text-sm', rules: 'text-sm', pt: 'text-base' }
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative transform transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer`}>
      {/* Card Frame */}
      <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-800 bg-gradient-to-b from-gray-100 to-gray-200 relative">
        
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

        {/* Power/Toughness */}
        {(power !== undefined && toughness !== undefined) && (
          <div className="absolute bottom-2 right-2 bg-gray-200 border-2 border-gray-800 rounded-md px-2 py-1">
            <span className={`font-bold text-black ${textSizes[size].pt}`}>
              {power}/{toughness}
            </span>
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
  );
}
