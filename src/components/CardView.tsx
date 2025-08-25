'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, getRarityColor } from '@/lib/utils';
import { translateCardType, translateRarity } from '@/lib/localization/es';
import ManaSymbol from '@/components/ManaSymbol';
import PowerToughnessDisplay from '@/components/PowerToughnessDisplay';
import KeywordTooltip from '@/components/KeywordTooltip';
import type { CardDefinition } from '@/lib/game/types';

interface CardViewProps {
  card: CardDefinition;
  foil?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xl';
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const CardView: React.FC<CardViewProps> = ({
  card,
  foil = false,
  size = 'medium',
  interactive = false,
  selected = false,
  onClick,
  className
}) => {
  const [showExpanded, setShowExpanded] = useState(false);
  
  // Enhanced size classes for larger display
  const sizeClasses = {
    small: 'w-32 h-44',    // Increased from w-24 h-32
    medium: 'w-48 h-64',   // Increased from w-32 h-44  
    large: 'w-64 h-88',    // Increased from w-48 h-64
    xl: 'w-80 h-[32rem]'   // New extra large size
  };

  const textSizes = {
    small: { name: 'text-xs', type: 'text-xs', rules: 'text-xs', flavor: 'text-xs' },
    medium: { name: 'text-sm', type: 'text-xs', rules: 'text-xs', flavor: 'text-xs' },
    large: { name: 'text-base', type: 'text-sm', rules: 'text-sm', flavor: 'text-xs' },
    xl: { name: 'text-lg', type: 'text-base', rules: 'text-sm', flavor: 'text-sm' }
  };

  const rarityColor = getRarityColor(card.rarity);
  const manaCost = card.manaCost ? card.manaCost.match(/\{[^}]+\}/g) || [] : [];
  const translatedType = translateCardType(card.typeLine || '');
  const translatedRarity = translateRarity(card.rarity);
  
  // Extract keywords from oracle text or keywords array
  const keywords = card.keywords || [];

  const handleCardClick = () => {
    if (interactive && onClick) {
      onClick();
    } else if (interactive) {
      setShowExpanded(true);
    }
  };

  return (
    <>
      {/* Expanded modal view */}
      {showExpanded && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowExpanded(false)}
        >
          <div 
            className="relative max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardView
              card={card}
              foil={foil}
              size="xl"
              className="shadow-2xl"
            />
            <button
              className="absolute -top-4 -right-4 text-white text-2xl hover:text-red-400 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setShowExpanded(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main card */}
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-200 group bg-gradient-to-b from-amber-50 to-white',
          sizeClasses[size],
          interactive && 'cursor-pointer card-hover',
          selected && 'ring-2 ring-blue-500 ring-offset-2',
          foil && 'foil-effect glow-foil',
          `card-rarity-${card.rarity}`,
          card.rarity === 'mythic' && 'glow-mythic mythic-aura',
          card.rarity === 'rare' && 'glow-rare rare-shimmer',
          card.rarity === 'uncommon' && 'glow-uncommon',
          className
        )}
        style={{ borderColor: rarityColor }}
        onClick={handleCardClick}
      >
        <CardContent className="p-2 h-full flex flex-col relative">
          {/* Header with name and mana cost */}
          <div className="flex justify-between items-start mb-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t px-2 py-1 -mx-2 -mt-2">
            <h3 className={`font-bold leading-tight flex-1 pr-2 text-black ${textSizes[size].name}`}>
              {card.name}
            </h3>
            {manaCost.length > 0 && (
              <div className="flex gap-1 flex-shrink-0">
                {manaCost.map((symbol, index) => (
                  <ManaSymbol 
                    key={index} 
                    symbol={symbol.replace(/[{}]/g, '')} 
                    size={size === 'small' ? 'xs' : size === 'xl' ? 'lg' : 'sm'}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Card image area */}
          <div className={`relative bg-gradient-to-br from-blue-100 via-green-100 to-purple-100 rounded mb-2 overflow-hidden ${
            size === 'small' ? 'h-16' : 
            size === 'medium' ? 'h-24' : 
            size === 'large' ? 'h-32' : 'h-48'
          }`}>
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <span className={`text-center ${textSizes[size].type}`}>
                  Sin Imagen
                </span>
              </div>
            )}
            
            {/* Foil overlay */}
            {foil && (
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
            )}
            
            {/* Rarity symbol */}
            <div 
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
              style={{ backgroundColor: rarityColor, color: card.rarity === 'common' ? 'white' : 'black' }}
              title={translatedRarity}
            >
              {card.rarity === 'mythic' ? '◆' : 
               card.rarity === 'rare' ? '★' : 
               card.rarity === 'uncommon' ? '◆' : '●'}
            </div>
          </div>

          {/* Type line */}
          <div className={`bg-gradient-to-r from-gray-100 to-gray-200 rounded px-2 py-1 mb-2 ${textSizes[size].type}`}>
            <span className="text-black font-semibold">
              {translatedType}
            </span>
          </div>

          {/* Oracle text area */}
          <div className="flex-1 bg-white rounded border border-gray-300 p-2 overflow-hidden">
            {/* Keywords with tooltips */}
            {keywords.length > 0 && (
              <div className={`mb-2 ${textSizes[size].rules}`}>
                {keywords.map((keyword, index) => (
                  <KeywordTooltip key={index} keyword={keyword}>
                    <span className="font-semibold text-blue-700 mr-1">
                      {keyword}
                      {index < keywords.length - 1 ? ', ' : ''}
                    </span>
                  </KeywordTooltip>
                ))}
              </div>
            )}
            
            {/* Oracle text */}
            {(card as any).oracleText && (
              <p className={`text-black leading-tight mb-2 ${textSizes[size].rules}`}>
                {(card as any).oracleText}
              </p>
            )}
            
            {/* Flavor text integrated within card */}
            {card.flavorText && (size === 'large' || size === 'xl') && (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className={`text-gray-600 italic leading-tight ${textSizes[size].flavor}`}>
                  <em>"{card.flavorText}"</em>
                </p>
              </div>
            )}
          </div>

          {/* Power/Toughness for creatures */}
          {card.power !== undefined && card.toughness !== undefined && (
            <div className="absolute bottom-2 right-2">
              <PowerToughnessDisplay
                power={card.power}
                toughness={card.toughness}
                size={size === 'small' ? 'sm' : size === 'xl' ? 'lg' : 'md'}
              />
            </div>
          )}

          {/* Foil indicator */}
          {foil && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-purple-400 text-white text-xs px-2 py-1 rounded-full animate-pulse shadow-lg">
              ✨ Holográfica
            </div>
          )}

          {/* Enhanced rarity particles */}
          {(card.rarity === 'mythic' || card.rarity === 'rare') && (
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-1.5 h-1.5 rounded-full animate-ping",
                    card.rarity === 'mythic' ? "bg-orange-400" : "bg-blue-400"
                  )}
                  style={{
                    left: `${10 + (i * 12)}%`,
                    top: `${15 + (i % 4) * 20}%`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default CardView;
