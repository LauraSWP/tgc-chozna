'use client';

import React, { useState } from 'react';
import { getAvailableMechanics, getMechanicsByCategory, validateMechanicCombination, type MechanicEffect } from '@/lib/game/mechanics';

interface MechanicsSelectorProps {
  selectedMechanics: string[];
  onMechanicsChange: (mechanics: string[]) => void;
  className?: string;
}

const MechanicsSelector: React.FC<MechanicsSelectorProps> = ({ 
  selectedMechanics, 
  onMechanicsChange, 
  className = '' 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'Todas', nameES: 'Todas' },
    { id: 'evasion', name: 'Evasion', nameES: 'Evasión' },
    { id: 'combat', name: 'Combat', nameES: 'Combate' },
    { id: 'utility', name: 'Utility', nameES: 'Utilidad' },
    { id: 'protection', name: 'Protection', nameES: 'Protección' },
    { id: 'tempo', name: 'Tempo', nameES: 'Tempo' }
  ];

  const allMechanics = getAvailableMechanics();
  const filteredMechanics = allMechanics.filter(mechanic => {
    const matchesCategory = selectedCategory === 'all' || mechanic.category === selectedCategory;
    const matchesSearch = mechanic.nameES.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mechanic.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const validation = validateMechanicCombination(selectedMechanics);

  const handleMechanicToggle = (mechanicId: string) => {
    const newMechanics = selectedMechanics.includes(mechanicId)
      ? selectedMechanics.filter(id => id !== mechanicId)
      : [...selectedMechanics, mechanicId];
    
    onMechanicsChange(newMechanics);
  };

  const MechanicCard = ({ mechanic }: { mechanic: MechanicEffect }) => {
    const isSelected = selectedMechanics.includes(mechanic.id);
    
    return (
      <div
        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'bg-blue-100 border-blue-500 shadow-md' 
            : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-sm'
        }`}
        onClick={() => handleMechanicToggle(mechanic.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleMechanicToggle(mechanic.id)}
                className="rounded"
                onClick={(e) => e.stopPropagation()}
              />
              <h4 className="font-semibold text-gray-900">{mechanic.nameES}</h4>
              <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600">
                {mechanic.category === 'evasion' ? 'Evasión' :
                 mechanic.category === 'combat' ? 'Combate' :
                 mechanic.category === 'utility' ? 'Utilidad' :
                 mechanic.category === 'protection' ? 'Protección' : 'Tempo'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{mechanic.descriptionES}</p>
            <div className="text-xs text-gray-500 mt-1">
              Tipo: {mechanic.type === 'static' ? 'Estático' : 
                     mechanic.type === 'triggered' ? 'Disparado' : 
                     mechanic.type === 'activated' ? 'Activado' : 'Reemplazo'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-3">Mecánicas de la Carta</h3>
        
        {/* Search and filter */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar mecánicas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.nameES}
              </option>
            ))}
          </select>
        </div>

        {/* Validation errors */}
        {!validation.valid && validation.conflicts && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-1">Conflictos de Mecánicas:</h4>
            <ul className="text-sm text-red-700">
              {validation.conflicts.map((conflict, index) => (
                <li key={index}>• {conflict}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Selected mechanics summary */}
        {selectedMechanics.length > 0 && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-1">
              Mecánicas Seleccionadas ({selectedMechanics.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedMechanics.map(mechanicId => {
                const mechanic = allMechanics.find(m => m.id === mechanicId);
                return mechanic ? (
                  <span
                    key={mechanicId}
                    className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm"
                  >
                    {mechanic.nameES}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Mechanics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {filteredMechanics.map(mechanic => (
            <MechanicCard key={mechanic.id} mechanic={mechanic} />
          ))}
        </div>

        {filteredMechanics.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron mecánicas que coincidan con tu búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};

export default MechanicsSelector;
