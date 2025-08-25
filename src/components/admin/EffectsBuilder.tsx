'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Effect {
  id: string;
  trigger: string;
  condition?: string;
  operation: string;
  target: string;
  value?: any;
  description: string;
}

interface EffectsBuilderProps {
  effects: any;
  onChange: (effects: any) => void;
  className?: string;
}

const EffectsBuilder: React.FC<EffectsBuilderProps> = ({ effects, onChange, className = '' }) => {
  const [currentEffect, setCurrentEffect] = useState<Partial<Effect>>({
    trigger: '',
    condition: '',
    operation: '',
    target: '',
    value: '',
  });

  const triggers = [
    { id: 'on_play', name: 'Al Jugar', description: 'Cuando juegas esta carta' },
    { id: 'on_enter', name: 'Al Entrar', description: 'Cuando entra al campo de batalla' },
    { id: 'on_leave', name: 'Al Salir', description: 'Cuando sale del campo de batalla' },
    { id: 'on_death', name: 'Al Morir', description: 'Cuando esta criatura muere' },
    { id: 'on_attack', name: 'Al Atacar', description: 'Cuando esta criatura ataca' },
    { id: 'on_block', name: 'Al Bloquear', description: 'Cuando esta criatura bloquea' },
    { id: 'on_damage_dealt', name: 'Al Infligir Daño', description: 'Cuando inflige daño' },
    { id: 'on_damage_taken', name: 'Al Recibir Daño', description: 'Cuando recibe daño' },
    { id: 'start_of_turn', name: 'Inicio del Turno', description: 'Al comienzo de tu turno' },
    { id: 'end_of_turn', name: 'Final del Turno', description: 'Al final del turno' },
    { id: 'static', name: 'Efecto Estático', description: 'Efecto permanente mientras está en juego' },
    { id: 'activated', name: 'Habilidad Activada', description: 'Habilidad que puedes activar pagando un coste' },
  ];

  const conditions = [
    { id: '', name: 'Siempre', description: 'Sin condición' },
    { id: 'if_controlling_X', name: 'Si controlas X', description: 'Solo si controlas algo específico' },
    { id: 'if_opponent_has_X', name: 'Si el oponente tiene X', description: 'Solo si el oponente cumple una condición' },
    { id: 'if_life_below_X', name: 'Si vida menor a X', description: 'Solo si tu vida es menor al valor' },
    { id: 'if_life_above_X', name: 'Si vida mayor a X', description: 'Solo si tu vida es mayor al valor' },
    { id: 'if_graveyard_has_X', name: 'Si cementerio tiene X', description: 'Solo si hay X cartas en el cementerio' },
    { id: 'if_hand_has_X', name: 'Si mano tiene X', description: 'Solo si tienes X cartas en mano' },
    { id: 'if_first_spell', name: 'Si primer hechizo', description: 'Solo si es el primer hechizo del turno' },
    { id: 'if_second_spell', name: 'Si segundo hechizo', description: 'Solo si es el segundo hechizo del turno' },
  ];

  const operations = [
    { 
      id: 'draw', 
      name: 'Robar Cartas', 
      description: 'Roba cartas',
      valueType: 'number',
      valueName: 'Cantidad de cartas'
    },
    { 
      id: 'damage', 
      name: 'Infligir Daño', 
      description: 'Inflige daño',
      valueType: 'number',
      valueName: 'Cantidad de daño'
    },
    { 
      id: 'heal', 
      name: 'Ganar Vida', 
      description: 'Gana vida',
      valueType: 'number',
      valueName: 'Cantidad de vida'
    },
    { 
      id: 'buff', 
      name: 'Dar Bonificación', 
      description: 'Otorga +X/+Y',
      valueType: 'power_toughness',
      valueName: 'Bonificación'
    },
    { 
      id: 'debuff', 
      name: 'Reducir Stats', 
      description: 'Reduce -X/-Y',
      valueType: 'power_toughness',
      valueName: 'Reducción'
    },
    { 
      id: 'destroy', 
      name: 'Destruir', 
      description: 'Destruye permanente',
      valueType: 'none'
    },
    { 
      id: 'exile', 
      name: 'Exiliar', 
      description: 'Exilia permanente',
      valueType: 'none'
    },
    { 
      id: 'return_to_hand', 
      name: 'Devolver a Mano', 
      description: 'Devuelve a la mano',
      valueType: 'none'
    },
    { 
      id: 'create_token', 
      name: 'Crear Ficha', 
      description: 'Crea una criatura ficha',
      valueType: 'token',
      valueName: 'Propiedades de la ficha'
    },
    { 
      id: 'search_library', 
      name: 'Buscar en Biblioteca', 
      description: 'Busca una carta en tu biblioteca',
      valueType: 'search',
      valueName: 'Criterio de búsqueda'
    },
    { 
      id: 'mill', 
      name: 'Enviar al Cementerio', 
      description: 'Envía cartas de la biblioteca al cementerio',
      valueType: 'number',
      valueName: 'Cantidad de cartas'
    },
    { 
      id: 'discard', 
      name: 'Descartar', 
      description: 'Descarta cartas de la mano',
      valueType: 'number',
      valueName: 'Cantidad de cartas'
    },
    { 
      id: 'add_mana', 
      name: 'Añadir Maná', 
      description: 'Añade maná a tu reserva',
      valueType: 'mana',
      valueName: 'Cantidad y tipo de maná'
    },
    { 
      id: 'counter_spell', 
      name: 'Contrarrestar', 
      description: 'Contrarresta un hechizo',
      valueType: 'none'
    },
    { 
      id: 'tap', 
      name: 'Girar', 
      description: 'Gira permanente',
      valueType: 'none'
    },
    { 
      id: 'untap', 
      name: 'Enderezar', 
      description: 'Endereza permanente',
      valueType: 'none'
    },
  ];

  const targets = [
    { id: 'self', name: 'Esta Carta', description: 'Afecta a esta carta' },
    { id: 'controller', name: 'Su Controlador', description: 'Afecta al jugador que controla esta carta' },
    { id: 'opponent', name: 'Oponente', description: 'Afecta a un oponente' },
    { id: 'all_opponents', name: 'Todos los Oponentes', description: 'Afecta a todos los oponentes' },
    { id: 'any_player', name: 'Cualquier Jugador', description: 'Afecta a cualquier jugador' },
    { id: 'target_creature', name: 'Criatura Objetivo', description: 'Afecta a una criatura específica' },
    { id: 'target_player', name: 'Jugador Objetivo', description: 'Afecta a un jugador específico' },
    { id: 'target_permanent', name: 'Permanente Objetivo', description: 'Afecta a un permanente específico' },
    { id: 'all_creatures', name: 'Todas las Criaturas', description: 'Afecta a todas las criaturas' },
    { id: 'all_permanents', name: 'Todos los Permanentes', description: 'Afecta a todos los permanentes' },
    { id: 'creatures_you_control', name: 'Criaturas que Controlas', description: 'Afecta a tus criaturas' },
    { id: 'permanents_you_control', name: 'Permanentes que Controlas', description: 'Afecta a tus permanentes' },
    { id: 'random_creature', name: 'Criatura al Azar', description: 'Afecta a una criatura elegida al azar' },
    { id: 'each_player', name: 'Cada Jugador', description: 'Afecta a cada jugador' },
  ];

  const addEffect = () => {
    if (!currentEffect.trigger || !currentEffect.operation || !currentEffect.target) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const newEffect = {
      op: currentEffect.operation,
      target: currentEffect.target,
      condition: currentEffect.condition,
      ...currentEffect.value
    };

    const triggerKey = currentEffect.trigger;
    const updatedEffects = { ...effects };
    
    if (!updatedEffects[triggerKey]) {
      updatedEffects[triggerKey] = [];
    }
    
    updatedEffects[triggerKey].push(newEffect);
    onChange(updatedEffects);

    // Reset form
    setCurrentEffect({
      trigger: '',
      condition: '',
      operation: '',
      target: '',
      value: '',
    });
  };

  const removeEffect = (triggerKey: string, index: number) => {
    const updatedEffects = { ...effects };
    updatedEffects[triggerKey].splice(index, 1);
    if (updatedEffects[triggerKey].length === 0) {
      delete updatedEffects[triggerKey];
    }
    onChange(updatedEffects);
  };

  const renderValueInput = () => {
    const selectedOp = operations.find(op => op.id === currentEffect.operation);
    if (!selectedOp || selectedOp.valueType === 'none') return null;

    switch (selectedOp.valueType) {
      case 'number':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">{selectedOp.valueName}</label>
            <input
              type="number"
              min="1"
              max="20"
              value={currentEffect.value?.amount || ''}
              onChange={(e) => setCurrentEffect(prev => ({
                ...prev,
                value: { amount: parseInt(e.target.value) || 1 }
              }))}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Ej: 2"
            />
          </div>
        );

      case 'power_toughness':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Fuerza</label>
              <input
                type="number"
                min="-10"
                max="10"
                value={currentEffect.value?.power || ''}
                onChange={(e) => setCurrentEffect(prev => ({
                  ...prev,
                  value: { ...prev.value, power: parseInt(e.target.value) || 0 }
                }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Ej: +2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resistencia</label>
              <input
                type="number"
                min="-10"
                max="10"
                value={currentEffect.value?.toughness || ''}
                onChange={(e) => setCurrentEffect(prev => ({
                  ...prev,
                  value: { ...prev.value, toughness: parseInt(e.target.value) || 0 }
                }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Ej: +2"
              />
            </div>
          </div>
        );

      case 'token':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de la Ficha</label>
              <input
                type="text"
                value={currentEffect.value?.name || ''}
                onChange={(e) => setCurrentEffect(prev => ({
                  ...prev,
                  value: { ...prev.value, name: e.target.value }
                }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Ej: Soldado"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Fuerza</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={currentEffect.value?.power || ''}
                  onChange={(e) => setCurrentEffect(prev => ({
                    ...prev,
                    value: { ...prev.value, power: parseInt(e.target.value) || 1 }
                  }))}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resistencia</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={currentEffect.value?.toughness || ''}
                  onChange={(e) => setCurrentEffect(prev => ({
                    ...prev,
                    value: { ...prev.value, toughness: parseInt(e.target.value) || 1 }
                  }))}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        );

      case 'mana':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                max="10"
                value={currentEffect.value?.amount || ''}
                onChange={(e) => setCurrentEffect(prev => ({
                  ...prev,
                  value: { ...prev.value, amount: parseInt(e.target.value) || 1 }
                }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={currentEffect.value?.color || ''}
                onChange={(e) => setCurrentEffect(prev => ({
                  ...prev,
                  value: { ...prev.value, color: e.target.value }
                }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Cualquier color</option>
                <option value="W">Blanco</option>
                <option value="U">Azul</option>
                <option value="B">Negro</option>
                <option value="R">Rojo</option>
                <option value="G">Verde</option>
                <option value="C">Incoloro</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const formatEffectDisplay = (effect: any, triggerKey: string): string => {
    const trigger = triggers.find(t => t.id === triggerKey)?.name || triggerKey;
    const operation = operations.find(op => op.id === effect.op)?.name || effect.op;
    const target = targets.find(t => t.id === effect.target)?.name || effect.target;
    
    let valueText = '';
    switch (effect.op) {
      case 'draw':
      case 'damage':
      case 'heal':
      case 'mill':
      case 'discard':
        valueText = ` ${effect.amount || 1}`;
        break;
      case 'buff':
      case 'debuff':
        valueText = ` +${effect.power || 0}/+${effect.toughness || 0}`;
        break;
      case 'create_token':
        valueText = ` ${effect.power || 1}/${effect.toughness || 1} ${effect.name || 'Ficha'}`;
        break;
      case 'add_mana':
        valueText = ` ${effect.amount || 1}${effect.color ? ` ${effect.color}` : ''}`;
        break;
    }

    return `${trigger}: ${operation}${valueText} → ${target}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Constructor de Efectos
            <span className="text-sm font-normal text-gray-600">
              (Crea efectos reales para el juego)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Effect Builder Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">
                1. ¿Cuándo? <span className="text-red-500">*</span>
              </label>
              <select
                value={currentEffect.trigger || ''}
                onChange={(e) => setCurrentEffect(prev => ({ ...prev, trigger: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Seleccionar disparador</option>
                {triggers.map(trigger => (
                  <option key={trigger.id} value={trigger.id}>
                    {trigger.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                2. ¿Si...? (Condición)
              </label>
              <select
                value={currentEffect.condition || ''}
                onChange={(e) => setCurrentEffect(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                {conditions.map(condition => (
                  <option key={condition.id} value={condition.id}>
                    {condition.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                3. ¿Qué hace? <span className="text-red-500">*</span>
              </label>
              <select
                value={currentEffect.operation || ''}
                onChange={(e) => setCurrentEffect(prev => ({ ...prev, operation: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Seleccionar acción</option>
                {operations.map(operation => (
                  <option key={operation.id} value={operation.id}>
                    {operation.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                4. ¿A qué/quién? <span className="text-red-500">*</span>
              </label>
              <select
                value={currentEffect.target || ''}
                onChange={(e) => setCurrentEffect(prev => ({ ...prev, target: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Seleccionar objetivo</option>
                {targets.map(target => (
                  <option key={target.id} value={target.id}>
                    {target.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Value Input */}
          {currentEffect.operation && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">5. Valores del Efecto</h4>
              {renderValueInput()}
            </div>
          )}

          {/* Add Effect Button */}
          <div className="flex justify-center">
            <Button
              onClick={addEffect}
              disabled={!currentEffect.trigger || !currentEffect.operation || !currentEffect.target}
              className="bg-blue-600 hover:bg-blue-700"
            >
              ➕ Añadir Efecto
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Current Effects Display */}
      {Object.keys(effects).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📝 Efectos Actuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(effects).map(([triggerKey, effectList]: [string, any]) => (
                <div key={triggerKey} className="border rounded-lg p-3 bg-gray-50">
                  <h4 className="font-medium text-gray-800 mb-2">
                    {triggers.find(t => t.id === triggerKey)?.name || triggerKey}
                  </h4>
                  {Array.isArray(effectList) && effectList.map((effect: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-1 px-2 bg-white rounded border">
                      <span className="text-sm">
                        {formatEffectDisplay(effect, triggerKey)}
                      </span>
                      <Button
                        onClick={() => removeEffect(triggerKey, index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded border">
        💡 <strong>Cómo funciona:</strong> Los efectos se ejecutarán automáticamente cuando ocurra el disparador especificado durante el juego. 
        Por ejemplo, "Al Jugar: Robar 2 → Su Controlador" hará que el jugador robe 2 cartas cada vez que juegue esta carta.
      </div>
    </div>
  );
};

export default EffectsBuilder;
