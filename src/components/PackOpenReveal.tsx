'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CardView from '@/components/CardView';
import { cn, delay, formatCurrency } from '@/lib/utils';
import type { CardDefinition } from '@/lib/game/types';

interface PackResult {
  packNumber: number;
  cards: {
    userCardId: string;
    definition: CardDefinition;
    foil: boolean;
  }[];
}

interface PackOpenRevealProps {
  isOpen?: boolean;
  onOpenPack?: (setCode: string, quantity: number) => Promise<any>;
  userCoins?: number;
  className?: string;
}

const PackOpenReveal: React.FC<PackOpenRevealProps> = ({
  isOpen = true,
  onOpenPack,
  userCoins = 0,
  className
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [openResults, setOpenResults] = useState<PackResult[]>([]);
  const [currentlyRevealing, setCurrentlyRevealing] = useState<number>(-1);
  const [quantity, setQuantity] = useState(1);
  const [selectedSet, setSelectedSet] = useState('BASE');

  const packPrice = 150;
  const canAfford = userCoins >= packPrice * quantity;

  const handleOpenPack = async () => {
    if (!onOpenPack || !canAfford) return;

    setIsOpening(true);
    setOpenResults([]);
    setCurrentlyRevealing(-1);

    try {
      const result = await onOpenPack(selectedSet, quantity);
      
      if (result.success && result.packs) {
        setOpenResults(result.packs);
        
        // Reveal packs one by one with delay
        for (let i = 0; i < result.packs.length; i++) {
          await delay(500);
          setCurrentlyRevealing(i);
          await delay(2000); // Show each pack for 2 seconds
        }
        
        // Show all packs at the end
        setCurrentlyRevealing(-1);
      }
    } catch (error) {
      console.error('Pack opening failed:', error);
    } finally {
      setIsOpening(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, Math.min(10, newQuantity)));
  };

  if (!isOpen) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Pack Opening Interface */}
      <Card className="pack-opening-interface">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Abrir Sobres</span>
            <span className="text-sm font-normal">
              {formatCurrency(userCoins)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Set Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Set</label>
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              disabled={isOpening}
            >
              <option value="BASE">Base Set</option>
            </select>
          </div>

          {/* Quantity Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Cantidad (Cuesta: {formatCurrency(packPrice * quantity)})
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isOpening}
              >
                -
              </Button>
              <span className="w-12 text-center font-mono">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 10 || isOpening}
              >
                +
              </Button>
            </div>
          </div>

          {/* Open Button */}
          <Button
            onClick={handleOpenPack}
            disabled={!canAfford || isOpening}
            className="w-full"
            size="lg"
          >
            {isOpening ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Opening Pack{quantity > 1 ? 's' : ''}...
              </span>
            ) : (
              `Open ${quantity} Pack${quantity > 1 ? 's' : ''}`
            )}
          </Button>

          {!canAfford && (
            <p className="text-sm text-red-600 text-center">
              ¡No tienes suficientes moneditas! Te faltan {formatCurrency(packPrice * quantity - userCoins)}.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pack Opening Animation */}
      <AnimatePresence>
        {isOpening && currentlyRevealing >= 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <Card className="w-96 max-w-[90vw]">
              <CardHeader>
                <CardTitle className="text-center">
                  Pack {currentlyRevealing + 1} of {quantity}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="w-48 h-64 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4"
                  animate={{
                    rotateY: [0, 180, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  🎴 Booster Pack
                </motion.div>
                <div className="text-center text-sm text-gray-600">
                  Revealing cards...
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pack Results */}
      {openResults.length > 0 && !isOpening && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-center">
            Pack Opening Results
          </h3>
          
          {openResults.map((pack, packIndex) => (
            <Card key={packIndex} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-center">
                  Pack {pack.packNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {pack.cards.map((cardResult, cardIndex) => (
                    <motion.div
                      key={cardResult.userCardId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: cardIndex * 0.1,
                        duration: 0.3 
                      }}
                    >
                      <CardView
                        card={cardResult.definition}
                        foil={cardResult.foil}
                        size="small"
                        interactive
                        className="hover:scale-105 transition-transform"
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="font-semibold">
                  Total Cards: {openResults.reduce((sum, pack) => sum + pack.cards.length, 0)}
                </p>
                <p className="text-sm text-gray-600">
                  Foils: {openResults.reduce((sum, pack) => 
                    sum + pack.cards.filter(c => c.foil).length, 0
                  )}
                </p>
                <Button
                  onClick={() => setOpenResults([])}
                  variant="outline"
                  className="mt-4"
                >
                  Close Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PackOpenReveal;
