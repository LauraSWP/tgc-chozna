'use client';

import React from 'react';
import { cn, formatManaCost, getRarityColor } from '@/lib/utils';
import type { CardDefinition } from '@/lib/game/types';

interface CardPreviewProps {
  card: Partial<CardDefinition>;
  frameStyle?: string;
  imageUrl?: string;
  className?: string;
}

const CardPreview: React.FC<CardPreviewProps> = ({ 
  card, 
  frameStyle = 'classic', 
  imageUrl,
  className 
}) => {
  const manaCost = formatManaCost(card.manaCost || '');
  const rarityColor = getRarityColor(card.rarity || 'common');

  const frameClasses = {
    classic: 'bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-400',
    modern: 'bg-gradient-to-br from-gray-50 to-blue-50 border-blue-400',
    vintage: 'bg-gradient-to-b from-amber-50 to-amber-100 border-amber-600',
    digital: 'bg-gradient-to-br from-cyan-50 to-purple-50 border-cyan-400',
    mystical: 'bg-gradient-to-b from-purple-50 to-pink-50 border-purple-400',
    industrial: 'bg-gradient-to-br from-gray-100 to-slate-100 border-slate-400',
  };

  const frameClass = frameClasses[frameStyle as keyof typeof frameClasses] || frameClasses.classic;

  return (
    <div className={cn(
      'relative w-48 h-64 rounded-lg border-2 shadow-lg overflow-hidden',
      frameClass,
      className
    )}>
      {/* Card Header */}
      <div className="absolute top-0 left-0 right-0 p-2 bg-black/10">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h3 className="text-sm font-bold text-gray-900 leading-tight">
              {card.name || 'Card Name'}
            </h3>
          </div>
          {manaCost.length > 0 && (
            <div className="flex gap-0.5 flex-shrink-0">
              {manaCost.map((symbol, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full bg-gray-200 border border-gray-400 flex items-center justify-center text-xs font-bold"
                >
                  {symbol}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Image */}
      <div className="absolute top-8 left-2 right-2 h-24 bg-gray-200 rounded border overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={card.name || 'Card image'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-2xl mb-1">🖼️</div>
              <div className="text-xs">No Image</div>
            </div>
          </div>
        )}
      </div>

      {/* Type Line */}
      <div className="absolute top-36 left-2 right-2 p-1 bg-white/80 rounded border text-center">
        <div className="text-xs font-semibold text-gray-800">
          {card.typeLine || 'Card Type'}
        </div>
      </div>

      {/* Rules Text */}
      <div className="absolute top-44 left-2 right-2 bottom-12 p-2 bg-white/80 rounded border overflow-hidden">
        <div className="text-xs text-gray-800 leading-tight">
          {card.keywords && card.keywords.length > 0 && (
            <div className="font-semibold mb-1">
              {card.keywords.join(', ')}
            </div>
          )}
          {card.flavorText && (
            <div className="italic text-gray-600 text-xs">
              "{card.flavorText}"
            </div>
          )}
        </div>
      </div>

      {/* Power/Toughness */}
      {card.power !== undefined && card.toughness !== undefined && (
        <div className="absolute bottom-2 right-2 w-8 h-6 bg-white rounded border border-gray-400 flex items-center justify-center">
          <span className="text-xs font-bold">
            {card.power}/{card.toughness}
          </span>
        </div>
      )}

      {/* Rarity Gem */}
      <div 
        className="absolute bottom-2 left-2 w-4 h-4 rounded-full border-2 border-white"
        style={{ backgroundColor: rarityColor }}
        title={`${card.rarity} rarity`}
      />

      {/* Frame Style Indicator */}
      <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/60 text-white text-xs rounded">
        {frameStyle}
      </div>

      {/* Set Symbol (placeholder) */}
      <div className="absolute bottom-8 right-2 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white font-bold">
        S
      </div>
    </div>
  );
};

export default CardPreview;
