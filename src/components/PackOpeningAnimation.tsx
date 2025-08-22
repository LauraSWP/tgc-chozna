'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CardView from '@/components/CardView';
import { cn, formatCurrency } from '@/lib/utils';
import type { CardDefinition } from '@/lib/game/types';

interface PackResult {
  packNumber: number;
  cards: {
    userCardId: string;
    definition: CardDefinition;
    foil: boolean;
  }[];
}

interface PackOpeningAnimationProps {
  isOpen?: boolean;
  onOpenPack?: (setCode: string, quantity: number) => Promise<any>;
  userCoins?: number;
  className?: string;
}

interface AnimationState {
  phase: 'idle' | 'opening' | 'revealing' | 'displaying' | 'completed';
  currentCard: number;
  revealedCards: boolean[];
}

const PackOpeningAnimation: React.FC<PackOpeningAnimationProps> = ({
  isOpen = true,
  onOpenPack,
  userCoins = 0,
  className
}) => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    phase: 'idle',
    currentCard: -1,
    revealedCards: []
  });
  const [openResults, setOpenResults] = useState<PackResult[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSet, setSelectedSet] = useState('BASE');
  const [hoveredCard, setHoveredCard] = useState<number>(-1);

  const packPrice = 150;
  const canAfford = userCoins >= packPrice * quantity;

  const getRarityAura = (rarity: string, foil: boolean = false) => {
    const baseClass = "absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300";
    
    if (foil) {
      return `${baseClass} bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 animate-pulse shadow-2xl shadow-rainbow-500/50`;
    }
    
    switch (rarity?.toLowerCase()) {
      case 'mythic':
        return `${baseClass} bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 animate-pulse shadow-2xl shadow-orange-500/50`;
      case 'rare':
        return `${baseClass} bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-pulse shadow-xl shadow-blue-500/40`;
      case 'uncommon':
        return `${baseClass} bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 animate-pulse shadow-lg shadow-green-500/30`;
      case 'common':
      default:
        return `${baseClass} bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 shadow-md shadow-gray-500/20`;
    }
  };

  const getParticleEffect = (rarity: string, foil: boolean = false) => {
    if (foil) return "animate-bounce";
    
    switch (rarity?.toLowerCase()) {
      case 'mythic':
        return "animate-ping";
      case 'rare':
        return "animate-pulse";
      case 'uncommon':
        return "animate-bounce";
      default:
        return "";
    }
  };

  const handleOpenPack = async () => {
    if (!onOpenPack || !canAfford) return;

    setAnimationState({ phase: 'opening', currentCard: -1, revealedCards: [] });
    setOpenResults([]);

    try {
      const result = await onOpenPack(selectedSet, quantity);
      
      if (result.success && result.packs) {
        setOpenResults(result.packs);
        
        // Start pack opening animation
        setTimeout(() => {
          setAnimationState(prev => ({ 
            ...prev, 
            phase: 'revealing',
            revealedCards: new Array(result.packs[0]?.cards.length || 0).fill(false)
          }));
        }, 2000);
      }
    } catch (error) {
      console.error('Pack opening failed:', error);
      setAnimationState({ phase: 'idle', currentCard: -1, revealedCards: [] });
    }
  };

  const handleCardClick = (cardIndex: number) => {
    if (animationState.phase !== 'revealing') return;
    
    const newRevealed = [...animationState.revealedCards];
    newRevealed[cardIndex] = true;
    
    setAnimationState(prev => ({
      ...prev,
      revealedCards: newRevealed,
      currentCard: cardIndex
    }));

    // Check if all cards are revealed
    if (newRevealed.every(revealed => revealed)) {
      setTimeout(() => {
        setAnimationState(prev => ({ ...prev, phase: 'completed' }));
      }, 1000);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, Math.min(10, newQuantity)));
  };

  const resetAnimation = () => {
    setAnimationState({ phase: 'idle', currentCard: -1, revealedCards: [] });
    setOpenResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className={cn('relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900', className)}>
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {animationState.phase === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8"
        >
          <Card className="w-full max-w-md bg-black/50 backdrop-blur border-purple-500/30">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                ✨ Abrir Sobres Mágicos ✨
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white/80 mb-2">Set Mágico</label>
                  <select
                    value={selectedSet}
                    onChange={(e) => setSelectedSet(e.target.value)}
                    className="w-full bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="BASE">Base Set Místico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 mb-2">
                    Cantidad de Sobres (Cuesta: {formatCurrency(packPrice * quantity)})
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="bg-purple-600 hover:bg-purple-700 border-purple-500"
                    >
                      -
                    </Button>
                    <span className="text-2xl font-bold text-white w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 10}
                      className="bg-purple-600 hover:bg-purple-700 border-purple-500"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="text-white/60">
                  💰 Moneditas disponibles: {formatCurrency(userCoins)}
                </div>

                <Button
                  onClick={handleOpenPack}
                  disabled={!canAfford}
                  className="w-full py-4 text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-2xl shadow-orange-500/30 transform hover:scale-105 transition-all duration-300"
                >
                  🎴 ¡ABRIR {quantity} SOBRE{quantity > 1 ? 'S' : ''}! 🎴
                </Button>

                {!canAfford && (
                  <p className="text-red-400 text-sm">
                    ¡Necesitas {formatCurrency(packPrice * quantity - userCoins)} moneditas más!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pack Opening Animation */}
      <AnimatePresence>
        {animationState.phase === 'opening' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <motion.div
              initial={{ scale: 0.5, rotateY: 0 }}
              animate={{ 
                scale: [0.5, 1.2, 1],
                rotateY: [0, 180, 360],
                rotateX: [0, 10, 0]
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="relative"
            >
              {/* 3D Pack */}
              <div className="w-64 h-80 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-2xl border-4 border-yellow-400 relative overflow-hidden">
                {/* Pack shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse" />
                
                {/* Pack logo/text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="text-4xl mb-4">🎴</div>
                  <div className="text-xl font-bold">SOBRE</div>
                  <div className="text-lg">MÁGICO</div>
                </div>

                {/* Opening effect */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-yellow-400 shadow-lg shadow-yellow-400/50"
                />
              </div>

              {/* Magical particles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400
                  }}
                  transition={{
                    delay: 1 + Math.random(),
                    duration: 1.5,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-400 rounded-full"
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Revealing Phase */}
      {animationState.phase === 'revealing' && openResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 p-8 min-h-screen"
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ✨ ¡Revela tus Cartas! ✨
            </h2>
            <p className="text-white/80">Haz clic en cada carta para revelarla</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {openResults[0]?.cards.map((cardResult, index) => (
              <motion.div
                key={cardResult.userCardId}
                initial={{ 
                  opacity: 0, 
                  y: 100, 
                  rotateY: 180,
                  scale: 0.5
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  rotateY: animationState.revealedCards[index] ? 0 : 180,
                  scale: hoveredCard === index ? 1.1 : 1
                }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                className="relative group cursor-pointer perspective-1000"
                onClick={() => handleCardClick(index)}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(-1)}
              >
                <div className="relative w-full h-48 preserve-3d transition-transform duration-500">
                  {/* Card Back */}
                  <div className={cn(
                    "absolute inset-0 backface-hidden",
                    animationState.revealedCards[index] && "rotate-y-180"
                  )}>
                    <div className="w-full h-full bg-gradient-to-br from-purple-800 via-indigo-800 to-purple-900 rounded-lg border-2 border-yellow-400 flex items-center justify-center shadow-xl">
                      <div className="text-6xl opacity-50">🎴</div>
                      {hoveredCard === index && !animationState.revealedCards[index] && (
                        <div className="absolute inset-0 bg-yellow-400/20 rounded-lg animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Card Front */}
                  <div className={cn(
                    "absolute inset-0 backface-hidden rotate-y-180 transform-gpu",
                    !animationState.revealedCards[index] && "rotate-y-0"
                  )}>
                    <div className="relative">
                      <CardView
                        card={cardResult.definition}
                        foil={cardResult.foil}
                        size="medium"
                        className="transform hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Rarity Aura */}
                      <div className={getRarityAura(cardResult.definition.rarity, cardResult.foil)} />
                      
                      {/* Foil shine effect */}
                      {cardResult.foil && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-lg animate-pulse" />
                      )}

                      {/* Particle effects for rare cards */}
                      {(cardResult.definition.rarity === 'mythic' || cardResult.definition.rarity === 'rare') && (
                        <div className={cn("absolute inset-0", getParticleEffect(cardResult.definition.rarity, cardResult.foil))}>
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                              style={{
                                left: `${20 + (i * 10)}%`,
                                top: `${10 + (i % 3) * 30}%`,
                                animationDelay: `${i * 0.1}s`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reveal indicator */}
                {!animationState.revealedCards[index] && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                      ¡Click!
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2">
              <span className="text-white/80">Reveladas:</span>
              {animationState.revealedCards.map((revealed, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full transition-colors duration-300",
                    revealed ? "bg-yellow-400" : "bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Completed Phase */}
      {animationState.phase === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 p-8 min-h-screen flex flex-col items-center justify-center"
        >
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🎉 ¡Increíble Apertura! 🎉
            </h2>
            <p className="text-xl text-white/80">
              Total de cartas: {openResults[0]?.cards.length || 0}
            </p>
            <p className="text-lg text-white/60">
              Foils: {openResults[0]?.cards.filter(c => c.foil).length || 0}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={resetAnimation}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-3 text-lg font-bold shadow-xl"
            >
              🎴 Abrir Otro Sobre
            </Button>
            
            <Button
              onClick={() => {
                setAnimationState({ phase: 'idle', currentCard: -1, revealedCards: [] });
                setOpenResults([]);
              }}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg font-bold"
            >
              ✨ Volver al Inicio
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PackOpeningAnimation;
