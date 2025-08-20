-- Add visual fields to card_definitions table
ALTER TABLE public.card_definitions 
ADD COLUMN IF NOT EXISTS frame_style text DEFAULT 'classic';

-- Update existing cards to have classic frame style
UPDATE public.card_definitions 
SET frame_style = 'classic' 
WHERE frame_style IS NULL;

-- Create storage bucket for card images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for card images
CREATE POLICY "Card images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'card-images');

CREATE POLICY "Admins can upload card images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'card-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update card images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'card-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete card images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'card-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add frame style index for queries
CREATE INDEX IF NOT EXISTS idx_card_definitions_frame_style 
ON public.card_definitions(frame_style);

-- Create pack assignment table for future use
CREATE TABLE IF NOT EXISTS public.card_pack_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_def_id uuid NOT NULL REFERENCES public.card_definitions(id) ON DELETE CASCADE,
  pack_config_id uuid NOT NULL REFERENCES public.pack_configs(id) ON DELETE CASCADE,
  weight int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(card_def_id, pack_config_id)
);

-- Add RLS for pack assignments
ALTER TABLE public.card_pack_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pack assignments are readable by all" ON public.card_pack_assignments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pack assignments" ON public.card_pack_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
