'use client';

import React, { useState } from 'react';
import { getKeywordExplanation } from '@/lib/localization/es';

interface KeywordTooltipProps {
  keyword: string;
  children: React.ReactNode;
  className?: string;
}

const KeywordTooltip: React.FC<KeywordTooltipProps> = ({ keyword, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const keywordData = getKeywordExplanation(keyword);

  if (!keywordData) {
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
            {keywordData.name}
          </div>
          <div className="text-gray-200 leading-relaxed">
            {keywordData.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordTooltip;
