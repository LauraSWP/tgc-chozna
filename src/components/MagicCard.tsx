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

const ManaSymbol: React.FC<{ symbol: string }> = ({ symbol }) => {
  const getManaIcon = (sym: string) => {
    // Si es un número (maná incoloro)
    if (/^\d+$/.test(sym)) {
      return { icon: sym, color: 'text-gray-700', bg: 'bg-gray-300' };
    }
    
    switch (sym.toUpperCase()) {
      case 'B': return { icon: '☀️', color: 'text-yellow-400', bg: 'bg-yellow-100' };  // Blanco
      case 'A': return { icon: '💧', color: 'text-blue-400', bg: 'bg-blue-100' };     // Azul
      case 'N': return { icon: '💀', color: 'text-purple-400', bg: 'bg-purple-100' }; // Negro
      case 'R': return { icon: '🔥', color: 'text-red-400', bg: 'bg-red-100' };       // Rojo
      case 'V': return { icon: '🌿', color: 'text-green-400', bg: 'bg-green-100' };   // Verde
      // Compatibilidad con Magic en inglés
      case 'W': return { icon: '☀️', color: 'text-yellow-400', bg: 'bg-yellow-100' };
      case 'U': return { icon: '💧', color: 'text-blue-400', bg: 'bg-blue-100' };
      case 'G': return { icon: '🌿', color: 'text-green-400', bg: 'bg-green-100' };
      default: return { icon: sym, color: 'text-gray-400', bg: 'bg-gray-200' };
    }
  };

  const { icon, color, bg } = getManaIcon(symbol);
  
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${bg} border border-gray-400 text-xs font-bold ${color}`}>
      {icon}
    </span>
  );
};

// Colores por tipo de carta (como Magic) - Deprecated, usando getDominantManaColor ahora
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Función para obtener bordes especiales según rareza
  const getRarityBorder = (rarity: string): string => {
    if (!rarity) return 'border-2 border-gray-800';
    
    switch (rarity.toLowerCase()) {
      case 'mythic':
        return 'border-4 border-double border-orange-400 shadow-2xl shadow-orange-500/50';
      case 'rare':
        return 'border-4 border-blue-400 shadow-xl shadow-blue-500/30';
      case 'uncommon':
        return 'border-3 border-green-400 shadow-lg shadow-green-500/20';
      case 'common':
      default:
        return 'border-2 border-gray-800';
    }
  };

  // Función para obtener efectos especiales de rareza
  const getRarityEffects = (rarity: string): string => {
    if (!rarity) return '';
    
    switch (rarity.toLowerCase()) {
      case 'mythic':
        return 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-500/20 before:via-yellow-500/10 before:to-red-500/20 before:rounded-lg before:pointer-events-none';
      case 'rare':
        return 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/15 before:via-indigo-500/10 before:to-purple-500/15 before:rounded-lg before:pointer-events-none';
      case 'uncommon':
        return 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-500/10 before:via-emerald-500/5 before:to-teal-500/10 before:rounded-lg before:pointer-events-none';
      default:
        return '';
    }
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

  // Función para analizar el maná dominante y obtener color de fondo
  const getDominantManaColor = (manaCost: string, cardType: string, customColor?: string): string => {
    // Si hay un color personalizado asignado desde el admin, usarlo
    if (customColor) {
      return customColor;
    }

    // Colores por tipo de maná dominante
    const manaColors = {
      'B': 'from-yellow-600 via-yellow-500 to-yellow-700',  // Blanco
      'A': 'from-blue-600 via-blue-500 to-blue-700',       // Azul
      'N': 'from-purple-600 via-purple-500 to-purple-700', // Negro
      'R': 'from-red-600 via-red-500 to-red-700',          // Rojo
      'V': 'from-green-600 via-green-500 to-green-700',    // Verde
      'multicolor': 'from-orange-600 via-yellow-500 to-purple-600', // Multicolor
      'colorless': 'from-gray-600 via-gray-500 to-gray-700', // Incoloro
      'land': 'from-amber-600 via-brown-500 to-yellow-700'   // Tierras
    };

    // Si es una tierra, usar color de tierra
    if (cardType.toLowerCase().includes('tierra') || cardType.toLowerCase().includes('land')) {
      return manaColors.land;
    }

    if (!manaCost) {
      return manaColors.colorless;
    }

    // Extraer símbolos de maná
    const manaSymbols = manaCost.match(/\{[^}]+\}/g) || [];
    const colorCounts = { B: 0, A: 0, N: 0, R: 0, V: 0, W: 0, U: 0, G: 0 };
    
    manaSymbols.forEach(symbol => {
      const cleanSymbol = symbol.replace(/[{}]/g, '').toUpperCase();
      if (colorCounts.hasOwnProperty(cleanSymbol)) {
        colorCounts[cleanSymbol as keyof typeof colorCounts]++;
      }
    });

    // Convertir colores ingleses a españoles para compatibilidad
    colorCounts.B += colorCounts.W; // W -> B (Blanco)
    colorCounts.A += colorCounts.U; // U -> A (Azul) 
    colorCounts.V += colorCounts.G; // G -> V (Verde)

    // Encontrar el color dominante
    const totalColors = colorCounts.B + colorCounts.A + colorCounts.N + colorCounts.R + colorCounts.V;
    
    if (totalColors === 0) {
      return manaColors.colorless;
    }

    if (totalColors > 1) {
      // Verificar si hay un color claramente dominante (>50%)
      const maxCount = Math.max(colorCounts.B, colorCounts.A, colorCounts.N, colorCounts.R, colorCounts.V);
      if (maxCount / totalColors <= 0.5) {
        return manaColors.multicolor;
      }
    }

    // Retornar el color con más símbolos
    if (colorCounts.B >= Math.max(colorCounts.A, colorCounts.N, colorCounts.R, colorCounts.V)) return manaColors.B;
    if (colorCounts.A >= Math.max(colorCounts.N, colorCounts.R, colorCounts.V)) return manaColors.A;
    if (colorCounts.N >= Math.max(colorCounts.R, colorCounts.V)) return manaColors.N;
    if (colorCounts.R >= colorCounts.V) return manaColors.R;
    return manaColors.V;
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
      <div className={`w-full h-full rounded-lg overflow-hidden shadow-lg ${getRarityBorder(rarity)} bg-gradient-to-b ${getDominantManaColor(manaCost, type)} relative ${getRarityEffects(rarity)}`}>
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gray-200 to-gray-300 px-2 py-1 border-b border-gray-400">
          <div className="flex justify-between items-center">
            <span className={`font-bold text-black ${textSizes[size].name} truncate flex-1`}>
              {name}
            </span>
            <div className="flex items-center space-x-1 ml-2">
              {(manaCost?.match(/\{[^}]+\}/g) || []).map((symbol, index) => (
                <ManaSymbol key={index} symbol={symbol.replace(/[{}]/g, '')} />
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
