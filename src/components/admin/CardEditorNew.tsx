'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MechanicsSelector from '@/components/MechanicsSelector';
import ManaCostBuilder from '@/components/admin/ManaCostBuilder';
import CardPreviewLarge from '@/components/admin/CardPreviewLarge';
import EffectsBuilder from '@/components/admin/EffectsBuilder';
import { supabase } from '@/lib/supabaseClient';
import { validateCardRules, validateManaCost } from '@/lib/validate';

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

const CardEditorNew: React.FC<CardEditorProps> = ({ cardId, onSave, onCancel }) => {
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

      if (raritiesRes.error) throw raritiesRes.error;
      if (setsRes.error) throw setsRes.error;

      setRarities(raritiesRes.data || []);
      setSets(setsRes.data || []);
    } catch (error) {
      console.error('Error loading reference data:', error);
      setErrors(['Failed to load reference data']);
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

        if (data.image_url) {
          setImagePreview(data.image_url);
        }
      }
    } catch (error: any) {
      console.error('Error loading card:', error);
      setErrors([error.message || 'Failed to load card']);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      // Validate required fields
      if (!form.name.trim()) {
        throw new Error('Card name is required');
      }

      // Validate mana cost format
      if (form.mana_cost && !validateManaCost(form.mana_cost)) {
        throw new Error('Invalid mana cost format');
      }

      // Validate rules JSON
      if (form.rules_json && !validateCardRules(form.rules_json)) {
        throw new Error('Invalid rules format');
      }

      let imageUrl = form.image_url;

      // Upload image if new file selected
      if (imageFile) {
        setUploadingImage(true);
        const fileName = `card_${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('card-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('card-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        setUploadingImage(false);
      }

      const cardData = {
        ...form,
        image_url: imageUrl,
        keywords: form.keywords,
        rules_json: form.rules_json
      };

      let result;
      if (cardId) {
        // Update existing card
        result = await supabase
          .from('card_definitions')
          .update(cardData)
          .eq('id', cardId)
          .select()
          .single();
      } else {
        // Create new card
        result = await supabase
          .from('card_definitions')
          .insert(cardData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      if (onSave) {
        onSave(result.data);
      } else {
        router.push('/admin/cards');
      }
    } catch (error: any) {
      console.error('Error saving card:', error);
      setErrors([error.message || 'Failed to save card']);
    } finally {
      setIsLoading(false);
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left column - Form */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📝 Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre de la Carta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Ej: Dragón de Fuego"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Código Externo</label>
                  <input
                    type="text"
                    value={form.external_code}
                    onChange={(e) => setForm(prev => ({ ...prev, external_code: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Ej: DRG001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Línea de Tipo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.type_line}
                    onChange={(e) => setForm(prev => ({ ...prev, type_line: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Ej: Criatura — Dragón"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Artista</label>
                  <input
                    type="text"
                    value={form.artist}
                    onChange={(e) => setForm(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rareza</label>
                  <select
                    value={form.rarity_id}
                    onChange={(e) => setForm(prev => ({ ...prev, rarity_id: parseInt(e.target.value) }))}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    {rarities.map(rarity => (
                      <option key={rarity.id} value={rarity.id}>
                        {rarity.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fuerza</label>
                  <input
                    type="number"
                    value={form.power || ''}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      power: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Ej: 4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Resistencia</label>
                  <input
                    type="number"
                    value={form.toughness || ''}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      toughness: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Ej: 4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Texto de Ambientación</label>
                <textarea
                  value={form.flavor_text}
                  onChange={(e) => setForm(prev => ({ ...prev, flavor_text: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Texto evocativo que no afecta las reglas..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Mana Cost Builder */}
          <ManaCostBuilder
            manaCost={form.mana_cost}
            onChange={(manaCost) => setForm(prev => ({ ...prev, mana_cost: manaCost }))}
          />

          {/* Mechanics Selector */}
          <Card>
            <CardHeader>
              <CardTitle>🏷️ Mecánicas de la Carta</CardTitle>
            </CardHeader>
            <CardContent>
              <MechanicsSelector
                selectedMechanics={form.keywords}
                onMechanicsChange={(mechanics) => setForm(prev => ({ ...prev, keywords: mechanics }))}
              />
            </CardContent>
          </Card>

          {/* Effects Builder */}
          <EffectsBuilder
            effects={form.rules_json}
            onChange={(effects) => setForm(prev => ({ ...prev, rules_json: effects }))}
          />

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>🖼️ Imagen de la Carta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="w-full border rounded-md px-3 py-2"
                />
                
                {imagePreview && (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setForm(prev => ({ ...prev, image_url: '' }));
                      }}
                      variant="outline"
                      size="sm"
                    >
                      🗑️ Quitar Imagen
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {errors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-red-800">
                  <h4 className="font-semibold mb-2">Errores:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || uploadingImage}
                  className="flex-1"
                >
                  {isLoading ? '⏳ Guardando...' : cardId ? '💾 Guardar Cambios' : '✨ Crear Carta'}
                </Button>
                <Button
                  onClick={onCancel || (() => router.push('/admin/cards'))}
                  variant="outline"
                  disabled={isLoading}
                >
                  ❌ Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right column - Live Preview */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>👁️ Vista Previa en Vivo</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CardPreviewLarge
                  cardData={form}
                  rarities={rarities}
                />
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CardEditorNew;
