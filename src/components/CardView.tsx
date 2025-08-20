'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatManaCost, getRarityColor } from '@/lib/utils';
import type { CardDefinition } from '@/lib/game/types';

interface CardViewProps {
  card: CardDefinition;
  foil?: boolean;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const ManaSymbol: React.FC<{ symbol: string }> = ({ symbol }) => {
  const getSymbolClass = (sym: string) => {
    switch (sym) {
      case 'W': return 'mana-W';
      case 'U': return 'mana-U';
      case 'B': return 'mana-B';
      case 'R': return 'mana-R';
      case 'G': return 'mana-G';
      case 'C': return 'mana-C';
      default: return 'mana-C';
    }
  };

  return (
    <span className={cn('mana-symbol', getSymbolClass(symbol))}>
      {symbol}
    </span>
  );
};

const CardView: React.FC<CardViewProps> = ({
  card,
  foil = false,
  size = 'medium',
  interactive = false,
  selected = false,
  onClick,
  className
}) => {
  const sizeClasses = {
    small: 'w-24 h-32',
    medium: 'w-32 h-44',
    large: 'w-48 h-64'
  };

  const rarityColor = getRarityColor(card.rarity);
  const manaCost = formatManaCost(card.manaCost || '');

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        sizeClasses[size],
        interactive && 'cursor-pointer card-hover',
        selected && 'ring-2 ring-blue-500 ring-offset-2',
        foil && 'foil-effect',
        `card-rarity-${card.rarity}`,
        className
      )}
      style={{ borderColor: rarityColor }}
      onClick={onClick}
    >
      <CardContent className="p-2 h-full flex flex-col">
        {/* Header with name and mana cost */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xs font-semibold leading-tight flex-1 pr-1">
            {card.name}
          </h3>
          {manaCost.length > 0 && (
            <div className="flex gap-0.5 flex-shrink-0">
              {manaCost.map((symbol, index) => (
                <ManaSymbol key={index} symbol={symbol} />
              ))}
            </div>
          )}
        </div>

        {/* Card image */}
        <div className="flex-1 relative bg-gray-100 rounded mb-1 overflow-hidden">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-xs text-center">No Image</span>
            </div>
          )}
          
          {/* Foil overlay */}
          {foil && (
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
          )}
        </div>

        {/* Type line */}
        <div className="text-xs text-gray-600 mb-1 truncate">
          {card.typeLine}
        </div>

        {/* Power/Toughness for creatures */}
        {card.power !== undefined && card.toughness !== undefined && (
          <div className="absolute bottom-1 right-1 bg-white rounded px-1 text-xs font-bold border">
            {card.power}/{card.toughness}
          </div>
        )}

        {/* Keywords */}
        {card.keywords && card.keywords.length > 0 && (
          <div className="text-xs text-blue-600 truncate">
            {card.keywords.join(', ')}
          </div>
        )}

        {/* Foil indicator */}
        {foil && (
          <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 text-xs px-1 rounded">
            ✨
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardView;
