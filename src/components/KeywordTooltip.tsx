'use client';

import React, { useState } from 'react';
import { getMechanic } from '@/lib/game/mechanics';

interface KeywordTooltipProps {
  keyword: string;
  children: React.ReactNode;
  className?: string;
}

const KeywordTooltip: React.FC<KeywordTooltipProps> = ({ keyword, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const mechanic = getMechanic(keyword.toLowerCase().replace(/\s+/g, '_'));

  if (!mechanic) {
    return <span className={className}>{children}</span>;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className="cursor-help underline decoration-dotted decoration-blue-500 hover:decoration-solid"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onTouchStart={() => setIsVisible(!isVisible)}
      >
        {children}
      </span>
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 mt-2 text-sm bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 -translate-x-1/2 left-1/2">
          {/* Arrow */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"></div>
          
          <div className="font-bold text-yellow-400 mb-1">
            {mechanic.nameES}
          </div>
          <div className="text-gray-200 leading-relaxed">
            {mechanic.descriptionES}
          </div>
          
          {/* Show mechanic category and type */}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-400">
              <span className="font-semibold">Tipo:</span> {mechanic.type === 'static' ? 'Estático' : 
                mechanic.type === 'triggered' ? 'Disparado' : 
                mechanic.type === 'activated' ? 'Activado' : 'Reemplazo'}
            </div>
            <div className="text-xs text-gray-400">
              <span className="font-semibold">Categoría:</span> {
                mechanic.category === 'evasion' ? 'Evasión' :
                mechanic.category === 'combat' ? 'Combate' :
                mechanic.category === 'utility' ? 'Utilidad' :
                mechanic.category === 'protection' ? 'Protección' : 'Tempo'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordTooltip;
