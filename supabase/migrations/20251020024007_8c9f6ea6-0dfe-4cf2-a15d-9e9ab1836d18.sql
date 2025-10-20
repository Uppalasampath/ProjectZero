-- Create storage bucket for material images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'material-images',
  'material-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Create storage policies for material images
CREATE POLICY "Anyone can view material images"
ON storage.objects FOR SELECT
USING (bucket_id = 'material-images');

CREATE POLICY "Authenticated users can upload material images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'material-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own material images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'material-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own material images"
ON storage.objects FOR DELETE
USING (bucket_id = 'material-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to calculate distance using Haversine formula
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 NUMERIC,
  lon1 NUMERIC,
  lat2 NUMERIC,
  lon2 NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  r NUMERIC := 3959; -- Earth's radius in miles
  dlat NUMERIC;
  dlon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN r * c;
END;
$$;

-- Add user favorites table
CREATE TABLE IF NOT EXISTS public.material_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.waste_materials(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, material_id)
);

ALTER TABLE public.material_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
ON public.material_favorites FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add transaction ratings table
CREATE TABLE IF NOT EXISTS public.transaction_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  rated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(transaction_id, rated_by)
);

ALTER TABLE public.transaction_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create ratings for own transactions"
ON public.transaction_ratings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.transactions
    WHERE id = transaction_id
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

CREATE POLICY "Anyone can view ratings"
ON public.transaction_ratings FOR SELECT
USING (true);