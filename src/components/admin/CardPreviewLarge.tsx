'use client';

import React from 'react';
import ManaSymbol from '@/components/ManaSymbol';
import PowerToughnessDisplay from '@/components/PowerToughnessDisplay';
import KeywordTooltip from '@/components/KeywordTooltip';
import { translateCardType, translateRarity } from '@/lib/localization/es';
import { getRarityColor } from '@/lib/utils';

interface CardPreviewLargeProps {
  cardData: {
    name: string;
    type_line: string;
    mana_cost: string;
    power?: number;
    toughness?: number;
    keywords: string[];
    rules_json: any;
    flavor_text?: string;
    rarity_id: number;
    image_url?: string;
    artist?: string;
  };
  rarities: any[];
  className?: string;
}

const CardPreviewLarge: React.FC<CardPreviewLargeProps> = ({ cardData, rarities, className = '' }) => {
  const rarity = rarities.find(r => r.id === cardData.rarity_id);
  const rarityColor = getRarityColor(rarity?.code || 'common');
  const translatedType = translateCardType(cardData.type_line || '');
  const translatedRarity = translateRarity(rarity?.code || 'common');
  const manaCost = cardData.mana_cost ? cardData.mana_cost.match(/\{[^}]+\}/g) || [] : [];

  // Extract effects from rules_json for display
  const effects = cardData.rules_json || {};
  const hasEffects = Object.keys(effects).some(key => 
    effects[key] && Array.isArray(effects[key]) && effects[key].length > 0
  );

  const formatEffectText = (effect: any): string => {
    if (!effect || !effect.op) return '';
    
    switch (effect.op) {
      case 'draw':
        return `Roba ${effect.count} carta${effect.count > 1 ? 's' : ''}`;
      case 'damage':
        return `Inflige ${effect.amount} de daño${effect.target ? ` a ${effect.target}` : ''}`;
      case 'heal':
        return `Gana ${effect.amount} vida${effect.target ? ` (${effect.target})` : ''}`;
      case 'buff':
        return `Obtiene +${effect.power || 0}/+${effect.toughness || 0}${effect.until ? ` hasta ${effect.until}` : ''}`;
      case 'destroy':
        return `Destruye ${effect.selector || 'objetivo'}`;
      case 'create_token':
        return `Crea una ficha ${effect.power}/${effect.toughness} ${effect.name}`;
      default:
        return JSON.stringify(effect);
    }
  };

  return (
    <div className={`w-96 h-[32rem] ${className}`}>
      <div
        className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-amber-50 to-white relative"
        style={{ 
          borderColor: rarityColor,
          borderWidth: '3px',
          borderStyle: 'solid',
          boxShadow: `0 0 20px ${rarityColor}40, 0 10px 30px rgba(0,0,0,0.3)`
        }}
      >
        {/* Header with name and mana cost */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 border-b border-gray-400">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-black leading-tight flex-1 pr-2">
              {cardData.name || 'Nombre de la Carta'}
            </h1>
            {manaCost.length > 0 && (
              <div className="flex gap-1 flex-shrink-0">
                {manaCost.map((symbol, index) => (
                  <ManaSymbol 
                    key={index} 
                    symbol={symbol.replace(/[{}]/g, '')} 
                    size="lg"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card image area */}
        <div className="relative bg-gradient-to-br from-blue-100 via-green-100 to-purple-100 mx-2 mt-2 rounded overflow-hidden h-48">
          {cardData.image_url ? (
            <img
              src={cardData.image_url}
              alt={cardData.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col">
              <div className="text-6xl mb-2">🎨</div>
              <span className="text-center text-sm">
                Imagen de la Carta
              </span>
            </div>
          )}
          
          {/* Rarity symbol */}
          <div 
            className="absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
            style={{ backgroundColor: rarityColor, color: rarity?.code === 'common' ? 'white' : 'black' }}
            title={translatedRarity}
          >
            {rarity?.code === 'mythic' ? '◆' : 
             rarity?.code === 'rare' ? '★' : 
             rarity?.code === 'uncommon' ? '◆' : '●'}
          </div>

          {/* Artist credit */}
          {cardData.artist && (
            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
              {cardData.artist}
            </div>
          )}
        </div>

        {/* Type line */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 mx-2 mt-2 rounded border border-gray-400">
          <span className="text-black font-semibold text-base">
            {translatedType || 'Tipo de Carta'}
          </span>
        </div>

        {/* Rules text area */}
        <div className="flex-1 bg-white rounded border border-gray-300 p-3 m-2 overflow-hidden relative">
          {/* Keywords with tooltips */}
          {cardData.keywords && cardData.keywords.length > 0 && (
            <div className="mb-3">
              {cardData.keywords.map((keyword, index) => (
                <KeywordTooltip key={index} keyword={keyword}>
                  <span className="font-semibold text-blue-700 mr-2 text-sm">
                    {keyword}
                    {index < cardData.keywords.length - 1 ? ', ' : ''}
                  </span>
                </KeywordTooltip>
              ))}
            </div>
          )}
          
          {/* Rules effects */}
          {hasEffects && (
            <div className="mb-3 space-y-1">
              {Object.entries(effects).map(([trigger, effectList]: [string, any]) => {
                if (!Array.isArray(effectList) || effectList.length === 0) return null;
                
                const triggerNames: Record<string, string> = {
                  on_play: 'Al jugar',
                  on_enter: 'Al entrar al campo',
                  on_leave: 'Al salir del campo',
                  on_death: 'Al morir',
                  static: 'Efecto permanente',
                  activated: 'Habilidad activada',
                  triggers: 'Habilidad disparada'
                };

                return (
                  <div key={trigger} className="text-sm">
                    <span className="font-semibold text-purple-700">
                      {triggerNames[trigger] || trigger}:
                    </span>
                    {' '}
                    {effectList.map((effect: any, idx: number) => (
                      <span key={idx}>
                        {formatEffectText(effect)}
                        {idx < effectList.length - 1 ? ', ' : '.'}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Flavor text */}
          {cardData.flavor_text && (
            <div className="border-t border-gray-200 pt-2 mt-2 mb-8">
              <p className="text-gray-600 italic text-sm leading-tight">
                <em>"{cardData.flavor_text}"</em>
              </p>
            </div>
          )}

          {/* Power/Toughness for creatures */}
          {(cardData.power !== undefined && cardData.power !== null) && 
           (cardData.toughness !== undefined && cardData.toughness !== null) && (
            <div className="absolute bottom-2 right-2">
              <PowerToughnessDisplay
                power={cardData.power}
                toughness={cardData.toughness}
                size="lg"
              />
            </div>
          )}

          {/* No content placeholder */}
          {!cardData.keywords?.length && !hasEffects && !cardData.flavor_text && (
            <div className="text-center text-gray-400 py-8">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-sm">
                Agrega mecánicas y efectos para ver el texto de la carta
              </p>
            </div>
          )}
        </div>

        {/* Card info footer */}
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t">
          <div className="flex justify-between items-center">
            <span>Rareza: {translatedRarity}</span>
            <span>TGC © 2024</span>
          </div>
        </div>

        {/* Rarity glow effect */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 1px ${rarityColor}60`,
          }}
        />
      </div>
    </div>
  );
};

export default CardPreviewLarge;
