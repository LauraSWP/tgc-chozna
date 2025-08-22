'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import CardView from '@/components/CardView';
import { cn } from '@/lib/utils';
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
  onOpenPack?: (setCode: string, quantity: number) => Promise<any>;
  userCoins?: number;
  className?: string;
}

interface AnimationState {
  phase: 'hidden' | 'opening' | 'revealing' | 'completed';
  currentCard: number;
  revealedCards: boolean[];
  isVisible: boolean;
}

const PackOpeningAnimation: React.FC<PackOpeningAnimationProps> = ({
  onOpenPack,
  userCoins = 0,
  className
}) => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    phase: 'hidden',
    currentCard: -1,
    revealedCards: [],
    isVisible: false
  });
  const [openResults, setOpenResults] = useState<PackResult[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number>(-1);

  // Listen for the button click to show the animation
  useEffect(() => {
    const handleShowPackOpening = () => {
      setAnimationState(prev => ({ ...prev, isVisible: true, phase: 'opening' }));
      startPackOpening();
    };

    // Listen for custom event from the shop button
    window.addEventListener('openPackAnimation', handleShowPackOpening);
    
    return () => {
      window.removeEventListener('openPackAnimation', handleShowPackOpening);
    };
  }, []);

  const startPackOpening = async () => {
    if (!onOpenPack) return;

    try {
      const result = await onOpenPack('BASE', 1);
      
      if (result.success && result.packs) {
        setOpenResults(result.packs);
        
        // After pack opening animation, show cards
        setTimeout(() => {
          setAnimationState(prev => ({ 
            ...prev, 
            phase: 'revealing',
            revealedCards: new Array(result.packs[0]?.cards.length || 0).fill(false)
          }));
        }, 3000);
      }
    } catch (error) {
      console.error('Pack opening failed:', error);
      closeAnimation();
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

  const closeAnimation = () => {
    setAnimationState({ 
      phase: 'hidden', 
      currentCard: -1, 
      revealedCards: [],
      isVisible: false 
    });
    setOpenResults([]);
  };

  if (!animationState.isVisible) return null;

  return (
    <motion.div
      id="pack-opening-fullscreen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden"
    >
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [-50, -100]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={closeAnimation}
        className="absolute top-4 right-4 z-60 text-white text-2xl hover:text-yellow-400 transition-colors"
      >
        ✕
      </button>

      {/* Pack Opening Animation */}
      {animationState.phase === 'opening' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, rotateY: 0 }}
            animate={{ 
              scale: [0.5, 1.5, 1.2],
              rotateY: [0, 180, 360, 540],
              rotateX: [0, 15, -15, 0]
            }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="relative"
          >
            {/* 3D Pack */}
            <div className="w-80 h-96 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl border-4 border-yellow-400 relative overflow-hidden">
              {/* Pack shine effect */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
              
              {/* Pack logo/text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-4"
                >
                  🎴
                </motion.div>
                <div className="text-2xl font-bold">SOBRE</div>
                <div className="text-xl">MÁGICO</div>
              </div>
            </div>

            {/* Explosion particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600
                }}
                transition={{
                  delay: 2 + Math.random() * 0.5,
                  duration: 2,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Card Revealing Phase */}
      {animationState.phase === 'revealing' && openResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ✨ ¡Revela tus Cartas! ✨
            </h2>
            <p className="text-xl text-white/80">Haz clic en cada carta para revelarla</p>
          </div>

          <div className="grid grid-cols-5 gap-6 max-w-6xl">
            {openResults[0]?.cards.map((cardResult, index) => (
              <motion.div
                key={cardResult.userCardId}
                initial={{ 
                  opacity: 0, 
                  y: 100, 
                  scale: 0.5
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: hoveredCard === index ? 1.1 : 1
                }}
                transition={{ 
                  delay: index * 0.2,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                className="relative group cursor-pointer"
                onClick={() => handleCardClick(index)}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(-1)}
              >
                <div className="relative w-40 h-56 perspective-1000">
                  {/* Card container with flip animation */}
                  <motion.div
                    initial={{ rotateY: 180 }}
                    animate={{ 
                      rotateY: animationState.revealedCards[index] ? 0 : 180 
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative w-full h-full preserve-3d"
                  >
                    {/* Card Back */}
                    <div className="absolute inset-0 backface-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-purple-800 via-indigo-800 to-purple-900 rounded-xl border-3 border-yellow-400 flex items-center justify-center shadow-xl">
                        <div className="text-8xl opacity-50">🎴</div>
                        {hoveredCard === index && !animationState.revealedCards[index] && (
                          <div className="absolute inset-0 bg-yellow-400/30 rounded-xl animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Card Front */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                      <div className="w-full h-full transform scale-110">
                        <CardView
                          card={cardResult.definition}
                          foil={cardResult.foil}
                          size="large"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Click indicator */}
                {!animationState.revealedCards[index] && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      ¡Click!
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2">
              <span className="text-white/80 text-lg">Reveladas:</span>
              {animationState.revealedCards.map((revealed, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-4 h-4 rounded-full transition-colors duration-300",
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
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <div className="text-center mb-8">
            <motion.h2
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
            >
              🎉 ¡Increíble Apertura! 🎉
            </motion.h2>
            <p className="text-2xl text-white/80">
              Total de cartas: {openResults[0]?.cards.length || 0}
            </p>
            <p className="text-xl text-white/60">
              Foils: {openResults[0]?.cards.filter(c => c.foil).length || 0}
            </p>
          </div>

          <div className="flex gap-6">
            <Button
              onClick={() => {
                closeAnimation();
                // Trigger opening another pack
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('openPackAnimation'));
                }, 100);
              }}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-4 text-xl font-bold shadow-xl rounded-xl"
            >
              🎴 Abrir Otro Sobre
            </Button>
            
            <Button
              onClick={closeAnimation}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-xl font-bold rounded-xl"
            >
              ✨ Cerrar
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PackOpeningAnimation;
