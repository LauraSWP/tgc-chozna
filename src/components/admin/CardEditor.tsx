'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { validateCardRules, validateManaCost } from '@/lib/validate';
import { cn } from '@/lib/utils';
import type { CardDefinition } from '@/lib/game/types';
import CardPreview from '@/components/admin/CardPreview';

interface CardEditorProps {
  cardId?: string;
  onSave?: (card: any) => void;
  onCancel?: () => void;
}

interface CardForm {
  external_code: string;
  name: string;
  type_line: string;
  mana_cost: string;
  power: number | null;
  toughness: number | null;
  keywords: string[];
  rules_json: any;
  flavor_text: string;
  artist: string;
  rarity_id: number;
  set_id: string;
  is_active: boolean;
  image_url: string;
  frame_style: string;
}

const CardEditor: React.FC<CardEditorProps> = ({ cardId, onSave, onCancel }) => {
  const router = useRouter();
  const [form, setForm] = useState<CardForm>({
    external_code: '',
    name: '',
    type_line: '',
    mana_cost: '',
    power: null,
    toughness: null,
    keywords: [],
    rules_json: {},
    flavor_text: '',
    artist: '',
    rarity_id: 1,
    set_id: '',
    is_active: true,
    image_url: '',
    frame_style: 'classic',
  });

  const [rarities, setRarities] = useState<any[]>([]);
  const [sets, setSets] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [rulesInput, setRulesInput] = useState('{}');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [manaCostBuilder, setManaCostBuilder] = useState<string[]>([]);

  useEffect(() => {
    loadReferenceData();
    if (cardId) {
      loadCard();
    }
  }, [cardId]);

  useEffect(() => {
    // Parse existing mana cost into builder array
    if (form.mana_cost) {
      const symbols = form.mana_cost.match(/\{[^}]+\}/g) || [];
      setManaCostBuilder(symbols.map(s => s.slice(1, -1)));
    }
  }, [form.mana_cost]);

  // Mana cost builder functions
  const addManaSymbol = (symbol: string) => {
    const newCost = [...manaCostBuilder, symbol];
    setManaCostBuilder(newCost);
    setForm(prev => ({ 
      ...prev, 
      mana_cost: newCost.map(s => `{${s}}`).join('') 
    }));
  };

  const removeManaSymbol = (index: number) => {
    const newCost = manaCostBuilder.filter((_, i) => i !== index);
    setManaCostBuilder(newCost);
    setForm(prev => ({ 
      ...prev, 
      mana_cost: newCost.map(s => `{${s}}`).join('') 
    }));
  };

  const clearManaCost = () => {
    setManaCostBuilder([]);
    setForm(prev => ({ ...prev, mana_cost: '' }));
  };

  const loadReferenceData = async () => {
    try {
      const [raritiesRes, setsRes] = await Promise.all([
        supabase.from('rarities').select('*').order('id'),
        supabase.from('card_sets').select('*').order('name')
      ]);

      if (raritiesRes.data) setRarities(raritiesRes.data);
      if (setsRes.data) setSets(setsRes.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadCard = async () => {
    if (!cardId) return;

    try {
      const { data, error } = await supabase
        .from('card_definitions')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error) throw error;

      if (data) {
        setForm({
          external_code: data.external_code || '',
          name: data.name || '',
          type_line: data.type_line || '',
          mana_cost: data.mana_cost || '',
          power: data.power,
          toughness: data.toughness,
          keywords: data.keywords || [],
          rules_json: data.rules_json || {},
          flavor_text: data.flavor_text || '',
          artist: data.artist || '',
          rarity_id: data.rarity_id || 1,
          set_id: data.set_id || '',
          is_active: data.is_active ?? true,
          image_url: data.image_url || '',
          frame_style: data.frame_style || 'classic',
        });
        
        setRulesInput(JSON.stringify(data.rules_json || {}, null, 2));
      }
    } catch (error) {
      console.error('Error loading card:', error);
      setErrors(['Failed to load card']);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      // Validate form
      const validationErrors = [];

      if (!form.name.trim()) validationErrors.push('Name is required');
      if (!form.type_line.trim()) validationErrors.push('Type line is required');
      if (form.mana_cost && !validateManaCost(form.mana_cost)) {
        validationErrors.push('Invalid mana cost format');
      }

      // Validate rules JSON
      let parsedRules = {};
      try {
        parsedRules = JSON.parse(rulesInput);
        const rulesValidation = validateCardRules(parsedRules);
        if (!rulesValidation.valid) {
          validationErrors.push(...rulesValidation.errors);
        }
      } catch (e) {
        validationErrors.push('Invalid rules JSON');
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      // Prepare data
      const cardData = {
        ...form,
        rules_json: parsedRules,
        power: form.power || null,
        toughness: form.toughness || null,
      };

      // Save to database using the admin API
      const method = cardId ? 'PUT' : 'POST';
      const url = '/api/admin/cards';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardId ? { id: cardId, ...cardData } : cardData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save card');
      }
      
      const result = await response.json();

      // Call onSave callback if provided, otherwise navigate to cards page
      if (onSave) {
        onSave(cardData);
      } else {
        router.push('/admin/cards');
      }
    } catch (error: any) {
      console.error('Error saving card:', error);
      setErrors([error.message || 'Failed to save card']);
    } finally {
      setIsLoading(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !form.keywords.includes(keywordInput.trim())) {
      setForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addBasicEffect = (effectType: string) => {
    let newEffect = {};
    
    switch (effectType) {
      case 'draw':
        newEffect = { op: 'draw', count: 1, target: 'self' };
        break;
      case 'damage':
        newEffect = { op: 'damage', amount: 1, target: 'any' };
        break;
      case 'buff':
        newEffect = { op: 'buff', power: 1, toughness: 1, until: 'end_of_turn', selector: 'self' };
        break;
      case 'destroy':
        newEffect = { op: 'destroy', selector: 'target_creature' };
        break;
    }

    try {
      const currentRules = JSON.parse(rulesInput);
      if (!currentRules.on_play) currentRules.on_play = [];
      currentRules.on_play.push(newEffect);
      setRulesInput(JSON.stringify(currentRules, null, 2));
    } catch (e) {
      setRulesInput(JSON.stringify({ on_play: [newEffect] }, null, 2));
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('card-images')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('card-images')
        .getPublicUrl(fileName);

      setForm(prev => ({ ...prev, image_url: publicUrl }));
      setImagePreview(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => [...prev, 'Failed to upload image']);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const frameStyles = [
    { value: 'classic', label: 'Clásico', preview: '🖼️ Marco tradicional de carta' },
    { value: 'modern', label: 'Moderno', preview: '✨ Diseño moderno y elegante' },
    { value: 'vintage', label: 'Vintage', preview: '📜 Estilo retro' },
    { value: 'digital', label: 'Digital', preview: '💾 Tema cibernético' },
    { value: 'mystical', label: 'Místico', preview: '🌟 Efectos mágicos' },
    { value: 'industrial', label: 'Industrial', preview: '⚙️ Tema tecnológico/metal' },
  ];

  const manaSymbols = [
    { symbol: '0', color: 'bg-gray-300', label: 'Cero' },
    { symbol: '1', color: 'bg-gray-300', label: 'Uno' },
    { symbol: '2', color: 'bg-gray-300', label: 'Dos' },
    { symbol: '3', color: 'bg-gray-300', label: 'Tres' },
    { symbol: '4', color: 'bg-gray-300', label: 'Cuatro' },
    { symbol: '5', color: 'bg-gray-300', label: 'Cinco' },
    { symbol: '6', color: 'bg-gray-300', label: 'Seis' },
    { symbol: 'X', color: 'bg-gray-400', label: 'Variable' },
    { symbol: 'W', color: 'bg-yellow-200', label: 'Blanco' },
    { symbol: 'U', color: 'bg-blue-200', label: 'Azul' },
    { symbol: 'B', color: 'bg-gray-800', label: 'Negro' },
    { symbol: 'R', color: 'bg-red-200', label: 'Rojo' },
    { symbol: 'G', color: 'bg-green-200', label: 'Verde' },
    { symbol: 'C', color: 'bg-gray-200', label: 'Incoloro' },
  ];

  const effectTemplates = [
    {
      name: 'Robar Cartas',
      description: 'Roba cartas al jugarse',
      template: { on_play: [{ op: 'draw', count: 1, target: 'self' }] }
    },
    {
      name: 'Daño Directo',
      description: 'Hace daño a cualquier objetivo',
      template: { on_play: [{ op: 'damage', amount: 2, target: 'any' }] }
    },
    {
      name: 'Potenciar Criatura',
      description: 'Mejora las estadísticas de criatura',
      template: { on_play: [{ op: 'buff', power: 1, toughness: 1, until: 'end_of_turn', selector: 'target_creature' }] }
    },
    {
      name: 'Destruir',
      description: 'Destruye permanente objetivo',
      template: { on_play: [{ op: 'destroy', selector: 'target_creature' }] }
    },
    {
      name: 'Al Entrar',
      description: 'Efecto cuando la criatura entra',
      template: { on_enter: [{ op: 'draw', count: 1, target: 'self' }] }
    },
    {
      name: 'Habilidad Activada',
      description: 'Paga un coste para activar',
      template: { activated: [{ cost: '{1}, {T}', effects: [{ op: 'draw', count: 1, target: 'self' }] }] }
    },
    {
      name: 'Al Morir',
      description: 'Efecto cuando muere',
      template: { on_death: [{ op: 'damage', amount: 2, target: 'any' }] }
    },
    {
      name: 'Generar Maná',
      description: 'Añade maná al pool',
      template: { activated: [{ cost: '{T}', effects: [{ op: 'gain_mana', colors: ['C'], amount: 1 }] }] }
    }
  ];

  const getRarityPullRate = (rarity?: string) => {
    switch (rarity) {
      case 'common': return '~66% de sobres (10/15 cartas)';
      case 'uncommon': return '~20% de sobres (3/15 cartas)';
      case 'rare': return '~7% de sobres (1/15 cartas)';
      case 'mythic': return '~0.9% de sobres (1/8 espacios raros)';
      case 'land': return '~7% de sobres (1/15 cartas)';
      case 'token': return 'Solo fichas especiales';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {cardId ? '✏️ Editar Carta' : '🆕 Crear Nueva Carta'}
          </CardTitle>
          <CardDescription className="text-lg">
            {cardId ? 'Modifica una carta existente' : 'Crea una nueva carta para el juego'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Main Layout: Image Preview + Form */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column: Large Image Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🎨 Vista Previa de la Carta
                </h3>
                <div className="space-y-4">
                  {/* Large Card Image */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      🖼️ Imagen de la Carta
                      <span className="text-xs text-gray-500 ml-2">(Esta será la imagen principal de tu carta)</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                      {imagePreview || form.image_url ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview || form.image_url}
                            alt="Vista previa de carta"
                            className="w-full h-64 object-cover rounded-lg shadow-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImagePreview('');
                              setImageFile(null);
                              setForm(prev => ({ ...prev, image_url: '' }));
                            }}
                          >
                            🗑️ Quitar Imagen
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 py-8">
                          <div className="text-gray-400 text-6xl">🖼️</div>
                          <div>
                            <p className="font-medium text-gray-600">No hay imagen seleccionada</p>
                            <p className="text-sm text-gray-500">Sube una imagen para ver cómo quedará tu carta</p>
                          </div>
                        </div>
                      )}
                    </div>
                  
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="w-full text-sm border rounded-md px-3 py-2"
                          id="image-upload"
                        />
                        {imageFile && (
                          <Button
                            type="button"
                            onClick={() => handleImageUpload(imageFile)}
                            disabled={uploadingImage}
                            size="sm"
                          >
                            {uploadingImage ? '⬆️ Subiendo...' : '⬆️ Subir'}
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-center text-xs text-gray-500">
                        O pega una URL de imagen aquí abajo
                      </div>
                      
                      <input
                        type="url"
                        value={form.image_url}
                        onChange={(e) => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </div>

                  {/* Frame Style */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      🖼️ Estilo del Marco
                      <span className="text-xs text-gray-500 ml-2">(Cambia el diseño del borde de la carta)</span>
                    </label>
                    <select
                      value={form.frame_style}
                      onChange={(e) => setForm(prev => ({ ...prev, frame_style: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      {frameStyles.map(style => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {frameStyles.find(s => s.value === form.frame_style)?.preview}
                    </p>
                  </div>

                  {/* Live Preview */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      ⚡ Vista Previa en Vivo
                      <span className="text-xs text-gray-500 ml-2">(Así se verá tu carta en el juego)</span>
                    </label>
                    <div className="flex justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
                      <CardPreview
                        card={{
                          name: form.name || 'Nombre de la Carta',
                          typeLine: form.type_line || 'Tipo — Subtipo',
                          manaCost: form.mana_cost,
                          power: form.power ?? undefined,
                          toughness: form.toughness ?? undefined,
                          keywords: form.keywords,
                          flavorText: form.flavor_text,
                          rarity: rarities.find(r => r.id === form.rarity_id)?.code as any || 'common'
                        }}
                        frameStyle={form.frame_style}
                        imageUrl={imagePreview || form.image_url}
                        className="scale-90"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📝 Detalles de la Carta
              </h3>
              
              {/* Basic Card Information */}
              <div className="space-y-6 bg-white p-6 rounded-lg border">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  ℹ️ Información Básica
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      🏷️ Código Externo
                      <span className="text-xs text-gray-500 ml-2">(Identificador único, ej: BAS001)</span>
                    </label>
                    <input
                      type="text"
                      value={form.external_code}
                      onChange={(e) => setForm(prev => ({ ...prev, external_code: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="BAS001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      📛 Nombre de la Carta *
                      <span className="text-xs text-gray-500 ml-2">(El nombre que aparecerá en la carta)</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Desarrollador Cafetero"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      🎭 Línea de Tipo *
                      <span className="text-xs text-gray-500 ml-2">(Qué tipo de carta es, ej: Criatura — Humano Desarrollador)</span>
                    </label>
                    <input
                      type="text"
                      value={form.type_line}
                      onChange={(e) => setForm(prev => ({ ...prev, type_line: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Criatura — Humano Desarrollador"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Mana Cost Builder */}
              <div className="space-y-4 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  ⚡ Constructor de Coste de Maná
                  <span className="text-xs text-gray-500 ml-2">(Haz clic en los símbolos para añadir maná)</span>
                </h4>
                
                {/* Current Mana Cost Display */}
                <div className="bg-white p-4 rounded-md border">
                  <label className="block text-sm font-medium mb-2">Coste Actual:</label>
                  <div className="flex items-center gap-2 flex-wrap min-h-10">
                    {manaCostBuilder.length > 0 ? (
                      <>
                        {manaCostBuilder.map((symbol, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => removeManaSymbol(index)}
                            className={`w-8 h-8 rounded-full border-2 border-gray-400 text-sm font-bold flex items-center justify-center hover:bg-red-100 transition-colors ${
                              manaSymbols.find(m => m.symbol === symbol)?.color || 'bg-gray-300'
                            } ${symbol === 'B' ? 'text-white' : 'text-black'}`}
                            title={`Clic para quitar ${symbol}`}
                          >
                            {symbol}
                          </button>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearManaCost}
                        >
                          🗑️ Limpiar
                        </Button>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">Sin coste de maná</span>
                    )}
                  </div>
                </div>

                {/* Mana Symbol Buttons */}
                <div>
                  <label className="block text-sm font-medium mb-2">Símbolos de Maná Disponibles:</label>
                  <div className="grid grid-cols-7 md:grid-cols-14 gap-2">
                    {manaSymbols.map((mana) => (
                      <button
                        key={mana.symbol}
                        type="button"
                        onClick={() => addManaSymbol(mana.symbol)}
                        className={`w-10 h-10 rounded-full border-2 border-gray-400 text-sm font-bold flex items-center justify-center hover:scale-110 transition-transform ${
                          mana.color
                        } ${mana.symbol === 'B' ? 'text-white' : 'text-black'}`}
                        title={`Añadir ${mana.label}`}
                      >
                        {mana.symbol}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Los números representan maná incoloro, las letras representan colores específicos
                  </p>
                </div>
              </div>

              {/* Creature Stats */}
              <div className="space-y-4 bg-orange-50 p-6 rounded-lg border">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  💪 Estadísticas de Criatura
                  <span className="text-xs text-gray-500 ml-2">(Solo para criaturas)</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      ⚔️ Poder
                      <span className="text-xs text-gray-500 ml-2">(Daño que hace al atacar)</span>
                    </label>
                    <input
                      type="number"
                      value={form.power || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, power: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      max="99"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      🛡️ Resistencia
                      <span className="text-xs text-gray-500 ml-2">(Daño que puede recibir antes de morir)</span>
                    </label>
                    <input
                      type="number"
                      value={form.toughness || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, toughness: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      max="99"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 bg-white p-3 rounded border">
                  💡 <strong>Tip:</strong> Solo rellena estos campos si tu carta es una criatura. Las cartas de hechizo, encantamiento, etc. no necesitan poder y resistencia.
                </div>
              </div>

              {/* Rarity and Set */}
              <div className="space-y-4 bg-purple-50 p-6 rounded-lg border">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  💎 Rareza y Colección
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      ⭐ Rareza de la Carta *
                      <span className="text-xs text-gray-500 ml-2">(Qué tan rara es en los sobres)</span>
                    </label>
                    <select
                      value={form.rarity_id}
                      onChange={(e) => setForm(prev => ({ ...prev, rarity_id: parseInt(e.target.value) }))}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    >
                      {rarities.map(rarity => (
                        <option key={rarity.id} value={rarity.id}>
                          {rarity.display_name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      📊 Probabilidad: {getRarityPullRate(rarities.find(r => r.id === form.rarity_id)?.code)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      📚 Colección *
                      <span className="text-xs text-gray-500 ml-2">(A qué set pertenece esta carta)</span>
                    </label>
                    <select
                      value={form.set_id}
                      onChange={(e) => setForm(prev => ({ ...prev, set_id: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Selecciona una colección</option>
                      {sets.map(set => (
                        <option key={set.id} value={set.id}>
                          {set.name} ({set.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords Section */}
          <div className="space-y-4 bg-green-50 p-6 rounded-lg border">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              🏷️ Palabras Clave
              <span className="text-xs text-gray-500 ml-2">(Habilidades especiales de la carta)</span>
            </h4>
            
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2"
                placeholder="volar, prisa, vigilancia, etc."
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} type="button" variant="outline">
                ➕ Añadir
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {form.keywords.map(keyword => (
                <span
                  key={keyword}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="text-xs text-gray-500 bg-white p-3 rounded border">
              💡 <strong>Tip:</strong> Las palabras clave son habilidades especiales como "volar" (no puede ser bloqueada), "prisa" (puede atacar inmediatamente), etc.
            </div>
          </div>

          {/* Card Effects Section */}
          <div className="space-y-4 bg-red-50 p-6 rounded-lg border">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              ⚡ Efectos de la Carta
              <span className="text-xs text-gray-500 ml-2">(Qué hace la carta cuando se juega)</span>
            </h4>
            
            {/* Effect Templates */}
            <div className="mb-4">
              <h5 className="text-sm font-medium mb-2">🚀 Plantillas de Efectos Rápidos</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {effectTemplates.map((template, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 flex flex-col items-center text-center"
                    onClick={() => setRulesInput(JSON.stringify(template.template, null, 2))}
                    title={template.description}
                  >
                    <span className="text-xs font-medium">{template.name}</span>
                    <span className="text-xs text-gray-500">{template.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Basic Effect Buttons */}
            <div className="mb-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBasicEffect('draw')}
              >
                + Robar Cartas
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBasicEffect('damage')}
              >
                + Hacer Daño
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBasicEffect('buff')}
              >
                + Potenciar Criatura
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBasicEffect('destroy')}
              >
                + Destruir
              </Button>
            </div>

            {/* JSON Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">🔧 Editor JSON Avanzado</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(rulesInput);
                      setRulesInput(JSON.stringify(parsed, null, 2));
                    } catch (e) {
                      // Invalid JSON, don't format
                    }
                  }}
                >
                  📐 Formatear JSON
                </Button>
              </div>
              <textarea
                value={rulesInput}
                onChange={(e) => setRulesInput(e.target.value)}
                className="w-full border rounded-md px-3 py-2 font-mono text-sm h-32"
                placeholder='{"on_play": [{"op": "draw", "count": 1, "target": "self"}]}'
              />
              <div className="text-xs text-gray-500 bg-white p-3 rounded border">
                💡 <strong>Tip:</strong> Usa las plantillas de arriba para configuración rápida, luego personaliza en el editor JSON
              </div>
            </div>
          </div>

          {/* Flavor Text and Artist */}
          <div className="space-y-4 bg-yellow-50 p-6 rounded-lg border">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              📝 Texto y Créditos
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  💬 Texto de Sabor
                  <span className="text-xs text-gray-500 ml-2">(Frase divertida o temática)</span>
                </label>
                <textarea
                  value={form.flavor_text}
                  onChange={(e) => setForm(prev => ({ ...prev, flavor_text: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 h-20 resize-none"
                  placeholder="Una cita divertida o temática..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  🎨 Artista
                  <span className="text-xs text-gray-500 ml-2">(Quién creó la imagen)</span>
                </label>
                <input
                  type="text"
                  value={form.artist}
                  onChange={(e) => setForm(prev => ({ ...prev, artist: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Nombre del Artista"
                />
              </div>
            </div>
          </div>

          {/* Distribution Settings */}
          <div className="space-y-4 bg-purple-50 p-6 rounded-lg border">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              📊 Configuración de Distribución
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  ✅ Disponibilidad
                  <span className="text-xs text-gray-500 ml-2">(Si aparece en sobres y juegos)</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">La carta está activa (aparece en sobres y juegos)</span>
                  </label>
                </div>
              </div>

              {/* Pack Information */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  📦 Información de Sobres
                </label>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Esta carta aparecerá en sobres de <strong>{sets.find(s => s.id === form.set_id)?.name || 'colección seleccionada'}</strong></p>
                  <p>• Rareza: <strong>{rarities.find(r => r.id === form.rarity_id)?.display_name || 'Desconocida'}</strong></p>
                  <p>• Probabilidad aproximada: {getRarityPullRate(rarities.find(r => r.id === form.rarity_id)?.code)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                🚀 Acciones Rápidas (Después de Guardar)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl mb-1">🎁</div>
                  <div className="text-xs">Dar a Usuarios</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <div className="text-xs">Añadir a Sobres</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl mb-1">🏗️</div>
                  <div className="text-xs">Crear Mazo</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl mb-1">🔧</div>
                  <div className="text-xs">Probar Efectos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Errores:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 text-lg py-3"
            >
              {isLoading ? '⏳ Guardando...' : (cardId ? '💾 Actualizar Carta' : '🚀 Crear Carta')}
            </Button>
            
            <Button
              onClick={onCancel || (() => router.back())}
              variant="outline"
              disabled={isLoading}
              className="px-8 py-3"
            >
              ❌ Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardEditor;
