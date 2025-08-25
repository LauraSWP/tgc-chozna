'use client';

import React from 'react';
import { ES_TRANSLATIONS } from '@/lib/localization/es';

interface ManaSymbolProps {
  symbol: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const ManaSymbol: React.FC<ManaSymbolProps> = ({ symbol, size = 'md', className = '' }) => {
  const getManaIcon = (sym: string) => {
    // Handle numeric colorless mana
    if (/^\d+$/.test(sym)) {
      return { 
        icon: sym, 
        color: 'text-gray-700', 
        bg: 'bg-gray-200 border-gray-400',
        aria: `${sym} maná incoloro`
      };
    }
    
    switch (sym.toUpperCase()) {
      case 'W': 
        return { 
          icon: '☀️', 
          color: 'text-yellow-700', 
          bg: 'bg-yellow-100 border-yellow-400',
          aria: ES_TRANSLATIONS.manaColors.W
        };
      case 'U': 
        return { 
          icon: '💧', 
          color: 'text-blue-700', 
          bg: 'bg-blue-100 border-blue-400',
          aria: ES_TRANSLATIONS.manaColors.U
        };
      case 'B': 
        return { 
          icon: '💀', 
          color: 'text-purple-700', 
          bg: 'bg-gray-800 border-gray-600 text-white',
          aria: ES_TRANSLATIONS.manaColors.B
        };
      case 'R': 
        return { 
          icon: '🔥', 
          color: 'text-red-700', 
          bg: 'bg-red-100 border-red-400',
          aria: ES_TRANSLATIONS.manaColors.R
        };
      case 'G': 
        return { 
          icon: '🌿', 
          color: 'text-green-700', 
          bg: 'bg-green-100 border-green-400',
          aria: ES_TRANSLATIONS.manaColors.G
        };
      case 'C':
        return { 
          icon: '◇', 
          color: 'text-gray-700', 
          bg: 'bg-gray-200 border-gray-400',
          aria: ES_TRANSLATIONS.manaColors.C
        };
      default: 
        return { 
          icon: sym, 
          color: 'text-gray-700', 
          bg: 'bg-gray-200 border-gray-400',
          aria: `${sym} maná`
        };
    }
  };

  const sizeClasses = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
    xl: 'w-10 h-10 text-lg'
  };

  const { icon, bg, aria } = getManaIcon(symbol);
  
  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full border-2 font-bold select-none ${bg} ${sizeClasses[size]} ${className}`}
      title={aria}
      aria-label={aria}
    >
      {icon}
    </span>
  );
};

export default ManaSymbol;
