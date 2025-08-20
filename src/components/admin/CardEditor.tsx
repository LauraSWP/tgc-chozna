'use client';

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadReferenceData();
    if (cardId) {
      loadCard();
    }
  }, [cardId]);

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

      // Save to database
      if (cardId) {
        const { error } = await supabase
          .from('card_definitions')
          .update(cardData)
          .eq('id', cardId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('card_definitions')
          .insert(cardData);
        
        if (error) throw error;
      }

      onSave?.(cardData);
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
    { value: 'classic', label: 'Classic', preview: '🖼️ Traditional card frame' },
    { value: 'modern', label: 'Modern', preview: '✨ Sleek modern design' },
    { value: 'vintage', label: 'Vintage', preview: '📜 Old-school style' },
    { value: 'digital', label: 'Digital', preview: '💾 Cyber theme' },
    { value: 'mystical', label: 'Mystical', preview: '🌟 Magical effects' },
    { value: 'industrial', label: 'Industrial', preview: '⚙️ Tech/metal theme' },
  ];

  const effectTemplates = [
    {
      name: 'Card Draw',
      description: 'Draw cards when played',
      template: { on_play: [{ op: 'draw', count: 1, target: 'self' }] }
    },
    {
      name: 'Direct Damage',
      description: 'Deal damage to any target',
      template: { on_play: [{ op: 'damage', amount: 2, target: 'any' }] }
    },
    {
      name: 'Creature Buff',
      description: 'Boost creature stats',
      template: { on_play: [{ op: 'buff', power: 1, toughness: 1, until: 'end_of_turn', selector: 'target_creature' }] }
    },
    {
      name: 'Destroy Effect',
      description: 'Destroy target permanent',
      template: { on_play: [{ op: 'destroy', selector: 'target_creature' }] }
    },
    {
      name: 'Enter Trigger',
      description: 'Effect when creature enters',
      template: { on_enter: [{ op: 'draw', count: 1, target: 'self' }] }
    },
    {
      name: 'Activated Ability',
      description: 'Pay cost to activate',
      template: { activated: [{ cost: '{1}, {T}', effects: [{ op: 'draw', count: 1, target: 'self' }] }] }
    },
    {
      name: 'Death Trigger',
      description: 'Effect when dies',
      template: { on_death: [{ op: 'damage', amount: 2, target: 'any' }] }
    },
    {
      name: 'Mana Generation',
      description: 'Add mana to pool',
      template: { activated: [{ cost: '{T}', effects: [{ op: 'gain_mana', colors: ['C'], amount: 1 }] }] }
    }
  ];

  const getRarityPullRate = (rarity?: string) => {
    switch (rarity) {
      case 'common': return '~66% of packs (10/15 cards)';
      case 'uncommon': return '~20% of packs (3/15 cards)';
      case 'rare': return '~7% of packs (1/15 cards)';
      case 'mythic': return '~0.9% of packs (1/8 rare slots)';
      case 'land': return '~7% of packs (1/15 cards)';
      case 'token': return 'Special tokens only';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{cardId ? 'Edit Card' : 'Create New Card'}</CardTitle>
          <CardDescription>
            {cardId ? 'Modify an existing card definition' : 'Create a new card for the game'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Card Preview and Image Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <h3 className="font-semibold mb-4">Card Preview</h3>
              <div className="space-y-4">
                {/* Card Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Card Artwork</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {imagePreview || form.image_url ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview || form.image_url}
                          alt="Card preview"
                          className="w-full h-32 object-cover rounded"
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
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-gray-400 text-4xl">🖼️</div>
                        <p className="text-sm text-gray-500">No image selected</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full text-sm"
                      id="image-upload"
                    />
                    
                    {imageFile && (
                      <Button
                        type="button"
                        onClick={() => handleImageUpload(imageFile)}
                        disabled={uploadingImage}
                        className="w-full"
                        size="sm"
                      >
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </Button>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Or paste image URL below
                    </div>
                    
                    <input
                      type="url"
                      value={form.image_url}
                      onChange={(e) => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {/* Frame Style */}
                <div>
                  <label className="block text-sm font-medium mb-2">Frame Style</label>
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
                  <label className="block text-sm font-medium mb-2">Live Preview</label>
                  <div className="flex justify-center">
                    <CardPreview
                      card={{
                        name: form.name || 'Card Name',
                        typeLine: form.type_line || 'Type — Subtype',
                        manaCost: form.mana_cost,
                        power: form.power,
                        toughness: form.toughness,
                        keywords: form.keywords,
                        flavorText: form.flavor_text,
                        rarity: rarities.find(r => r.id === form.rarity_id)?.code as any || 'common'
                      }}
                      frameStyle={form.frame_style}
                      imageUrl={imagePreview || form.image_url}
                      className="scale-75"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-4">Card Details</h3>
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">External Code</label>
              <input
                type="text"
                value={form.external_code}
                onChange={(e) => setForm(prev => ({ ...prev, external_code: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="BAS001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Card Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type Line *</label>
              <input
                type="text"
                value={form.type_line}
                onChange={(e) => setForm(prev => ({ ...prev, type_line: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Creature — Human Developer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mana Cost</label>
              <input
                type="text"
                value={form.mana_cost}
                onChange={(e) => setForm(prev => ({ ...prev, mana_cost: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="{2}{R}{G}"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Power</label>
              <input
                type="number"
                value={form.power || ''}
                onChange={(e) => setForm(prev => ({ ...prev, power: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full border rounded-md px-3 py-2"
                min="0"
                max="99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Toughness</label>
              <input
                type="number"
                value={form.toughness || ''}
                onChange={(e) => setForm(prev => ({ ...prev, toughness: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full border rounded-md px-3 py-2"
                min="0"
                max="99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rarity *</label>
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Set *</label>
              <select
                value={form.set_id}
                onChange={(e) => setForm(prev => ({ ...prev, set_id: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value="">Select a set</option>
                {sets.map(set => (
                  <option key={set.id} value={set.id}>
                    {set.name} ({set.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium mb-2">Keywords</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2"
                placeholder="flying, haste, etc."
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} type="button" variant="outline">
                Add
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
          </div>

          {/* Card Effects */}
          <div>
            <label className="block text-sm font-medium mb-2">Card Effects</label>
            
            {/* Effect Templates */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Quick Effect Templates</h4>
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
                + Draw Cards
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBasicEffect('damage')}
              >
                + Deal Damage
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBasicEffect('buff')}
              >
                + Buff Creature
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBasicEffect('destroy')}
              >
                + Destroy
              </Button>
            </div>

            {/* JSON Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Advanced JSON Editor</span>
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
                  Format JSON
                </Button>
              </div>
              <textarea
                value={rulesInput}
                onChange={(e) => setRulesInput(e.target.value)}
                className="w-full border rounded-md px-3 py-2 font-mono text-sm h-32"
                placeholder='{"on_play": [{"op": "draw", "count": 1, "target": "self"}]}'
              />
              <div className="text-xs text-gray-500">
                💡 Tip: Use templates above for quick setup, then customize in JSON editor
              </div>
            </div>
          </div>

            </div>
          </div>

          {/* Flavor and Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Flavor Text</label>
              <textarea
                value={form.flavor_text}
                onChange={(e) => setForm(prev => ({ ...prev, flavor_text: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 h-20 resize-none"
                placeholder="Funny or thematic quote..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Artist</label>
              <input
                type="text"
                value={form.artist}
                onChange={(e) => setForm(prev => ({ ...prev, artist: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Artist Name"
              />
            </div>
          </div>

          {/* Distribution Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Distribution Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Card is active (appears in packs and games)</span>
                  </label>
                </div>
              </div>

              {/* Pack Information */}
              <div>
                <label className="block text-sm font-medium mb-2">Pack Information</label>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• This card will appear in <strong>{sets.find(s => s.id === form.set_id)?.name || 'selected set'}</strong> booster packs</p>
                  <p>• Rarity: <strong>{rarities.find(r => r.id === form.rarity_id)?.display_name || 'Unknown'}</strong></p>
                  <p>• Approximate pull rate: {getRarityPullRate(rarities.find(r => r.id === form.rarity_id)?.code)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <label className="block text-sm font-medium mb-2">Quick Actions (After Save)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl mb-1">🎁</div>
                  <div className="text-xs">Give to Users</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <div className="text-xs">Add to Packs</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl mb-1">🏗️</div>
                  <div className="text-xs">Create Deck</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl mb-1">🔧</div>
                  <div className="text-xs">Test Effects</div>
                </div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : (cardId ? 'Update Card' : 'Create Card')}
            </Button>
            
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardEditor;
