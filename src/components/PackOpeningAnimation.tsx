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
  const [enlargedCard, setEnlargedCard] = useState<number>(-1);
  const [screenShake, setScreenShake] = useState(false);
  const [explosionParticles, setExplosionParticles] = useState<Array<{id: number, x: number, y: number, type: string}>>([]);

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
    
    if (!animationState.revealedCards[cardIndex]) {
      // Reveal card with spectacular effects
      const newRevealed = [...animationState.revealedCards];
      newRevealed[cardIndex] = true;
      
      // Trigger screen shake for epic reveals
      const card = openResults[0]?.cards[cardIndex];
      if (card?.definition.rarity === 'mythic' || card?.foil) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);
      }
      
      // Add explosion particles
      const newParticles = Array.from({length: 20}, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        type: card?.definition.rarity || 'common'
      }));
      setExplosionParticles(prev => [...prev, ...newParticles]);
      
      // Clear particles after animation
      setTimeout(() => {
        setExplosionParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 3000);
      
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
    } else {
      // Enlarge already revealed card
      setEnlargedCard(cardIndex);
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
      animate={{ 
        opacity: 1,
        x: screenShake ? [0, -10, 10, -10, 10, 0] : 0,
        y: screenShake ? [0, -5, 5, -5, 5, 0] : 0
      }}
      exit={{ opacity: 0 }}
      transition={{
        x: { duration: 0.5 },
        y: { duration: 0.5 }
      }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden"
    >
      {/* Enhanced background particles with different types */}
      <div className="absolute inset-0">
        {/* Floating stars */}
        {[...Array(150)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [-50, -150],
              rotate: [0, 360],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 8
            }}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
            }}
          />
        ))}
        
        {/* Magic sparkles */}
        {[...Array(75)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180]
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 6
            }}
            className="absolute w-3 h-3 bg-purple-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
        ))}
        
        {/* Explosion particles */}
        {explosionParticles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              opacity: 1, 
              scale: 0,
              x: '50vw',
              y: '50vh'
            }}
            animate={{ 
              opacity: 0,
              scale: [0, 2, 0],
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              rotate: 360
            }}
            transition={{ 
              duration: 3,
              ease: "easeOut"
            }}
            className={cn(
              "absolute w-4 h-4 rounded-full",
              particle.type === 'mythic' && "bg-gradient-to-r from-yellow-400 to-orange-500",
              particle.type === 'rare' && "bg-gradient-to-r from-blue-400 to-purple-500",
              particle.type === 'uncommon' && "bg-gradient-to-r from-green-400 to-emerald-500",
              particle.type === 'common' && "bg-gray-400"
            )}
            style={{
              boxShadow: particle.type === 'mythic' ? '0 0 20px rgba(255, 215, 0, 0.8)' :
                        particle.type === 'rare' ? '0 0 15px rgba(59, 130, 246, 0.6)' :
                        particle.type === 'uncommon' ? '0 0 10px rgba(16, 185, 129, 0.5)' :
                        '0 0 5px rgba(156, 163, 175, 0.4)'
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

          <div className="grid grid-cols-5 gap-12 max-w-7xl">
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
                    initial={{ rotateY: 0 }}
                    animate={{ 
                      rotateY: animationState.revealedCards[index] ? 180 : 0 
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative w-full h-full preserve-3d"
                  >
                    {/* Card Back (visible by default) */}
                    <div className="absolute inset-0 backface-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-purple-800 via-indigo-800 to-purple-900 rounded-xl border-3 border-yellow-400 flex items-center justify-center shadow-xl relative overflow-hidden">
                        <div className="text-8xl opacity-50">🎴</div>
                        
                        {/* Ultra enhanced glow effect on hover */}
                        {hoveredCard === index && !animationState.revealedCards[index] && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 rounded-xl opacity-60 animate-pulse" />
                            <div className="absolute inset-0 shadow-2xl shadow-yellow-400/90 rounded-xl" />
                            <div className="absolute inset-[-6px] bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-xl opacity-80 -z-10 animate-pulse" />
                            <div className="absolute inset-[-10px] bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-200 rounded-xl opacity-40 -z-20 animate-pulse" />
                            
                            {/* Rotating sparkles around card */}
                            {[...Array(8)].map((_, sparkleIndex) => (
                              <motion.div
                                key={sparkleIndex}
                                animate={{ 
                                  rotate: 360,
                                  scale: [0.5, 1.5, 0.5]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: sparkleIndex * 0.2
                                }}
                                className="absolute w-3 h-3 bg-yellow-300 rounded-full"
                                style={{
                                  left: `${50 + 40 * Math.cos((sparkleIndex * Math.PI * 2) / 8)}%`,
                                  top: `${50 + 40 * Math.sin((sparkleIndex * Math.PI * 2) / 8)}%`,
                                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.9)'
                                }}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Card Front (hidden until revealed) */}
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

                {/* Enhanced click indicator with more effects */}
                {!animationState.revealedCards[index] && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      y: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-yellow-200">
                      ✨ ¡CLICK! ✨
                    </div>
                  </motion.div>
                )}
                
                {/* Revealed card effects */}
                {animationState.revealedCards[index] && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      🔍 Ver Más Grande
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

      {/* Enhanced Enlarged Card Modal */}
      <AnimatePresence>
        {enlargedCard !== -1 && openResults[0]?.cards[enlargedCard] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex items-center justify-center z-60 backdrop-blur-sm"
            onClick={() => setEnlargedCard(-1)}
          >
            {/* Background effects for enlarged card */}
            <div className="absolute inset-0">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 2, 0],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 4
                  }}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotateY: 180 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotateY: 0,
                y: [0, -10, 0]
              }}
              exit={{ scale: 0.3, opacity: 0, rotateY: 180 }}
              transition={{ 
                type: "spring", 
                duration: 0.8,
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative max-w-2xl max-h-[90vh] w-auto h-auto perspective-1000"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced glow based on rarity */}
              <div className={cn(
                "absolute inset-[-20px] rounded-2xl opacity-60 animate-pulse",
                openResults[0].cards[enlargedCard].definition.rarity === 'mythic' && "bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 shadow-2xl shadow-yellow-400/50",
                openResults[0].cards[enlargedCard].definition.rarity === 'rare' && "bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 shadow-2xl shadow-blue-400/50",
                openResults[0].cards[enlargedCard].definition.rarity === 'uncommon' && "bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 shadow-2xl shadow-green-400/50",
                openResults[0].cards[enlargedCard].definition.rarity === 'common' && "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400"
              )} />
              
              <CardView
                card={openResults[0].cards[enlargedCard].definition}
                foil={openResults[0].cards[enlargedCard].foil}
                size="large"
                className="w-full h-full shadow-2xl transform scale-110"
              />
              
              {/* Enhanced close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setEnlargedCard(-1)}
                className="absolute -top-6 -right-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white w-12 h-12 rounded-full font-bold shadow-lg flex items-center justify-center text-xl border-2 border-red-300"
              >
                ✕
              </motion.button>

              {/* Card details overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-16 left-0 right-0 text-center"
              >
                <div className="bg-black/70 text-white px-6 py-3 rounded-lg backdrop-blur-sm">
                  <h3 className="text-xl font-bold">{openResults[0].cards[enlargedCard].definition.name}</h3>
                                     <p className="text-sm text-gray-300 capitalize">
                     {openResults[0].cards[enlargedCard].definition.rarity} • 
                     {openResults[0].cards[enlargedCard].foil && " ✨ FOIL ✨"}
                   </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PackOpeningAnimation;
