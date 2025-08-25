'use client';

import React from 'react';

interface PowerToughnessDisplayProps {
  power: number | null;
  toughness: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PowerToughnessDisplay: React.FC<PowerToughnessDisplayProps> = ({ 
  power, 
  toughness, 
  size = 'md',
  className = '' 
}) => {
  if (power === null || toughness === null) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-1 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-md shadow-lg ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center gap-2">
        {/* Attack (Power) */}
        <div className="flex items-center gap-1">
          <span className={`${iconSizes[size]} text-red-600`} title="Fuerza">⚔️</span>
          <span className="font-bold text-black">
            {power}
          </span>
        </div>
        
        {/* Separator */}
        <span className="text-gray-400 font-bold">/</span>
        
        {/* Defense (Toughness) */}
        <div className="flex items-center gap-1">
          <span className={`${iconSizes[size]} text-blue-600`} title="Resistencia">🛡️</span>
          <span className="font-bold text-black">
            {toughness}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PowerToughnessDisplay;
