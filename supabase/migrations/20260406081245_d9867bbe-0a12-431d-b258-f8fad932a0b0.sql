
-- 1. Add unique constraint on votes to prevent duplicate voting per category
ALTER TABLE public.votes ADD CONSTRAINT unique_voter_category UNIQUE (voter_nic, category);

-- 2. Remove overly permissive UPDATE policy on app_config
DROP POLICY IF EXISTS "Anyone can update app_config" ON public.app_config;

-- 3. Remove overly permissive UPDATE policy on contestants  
DROP POLICY IF EXISTS "Anyone can update contestants" ON public.contestants;

-- 4. Remove overly permissive INSERT policy on contestants (will use edge function)
-- Keep it but make it slightly more restrictive - require nic to be set
DROP POLICY IF EXISTS "Anyone can insert contestants" ON public.contestants;
CREATE POLICY "Users can insert their own contestant entry" ON public.contestants
FOR INSERT TO public
WITH CHECK (nic IS NOT NULL);

-- 5. Storage: Remove any overly permissive policies on storage.objects for contestant-photos
-- Add specific INSERT policy for contestant-photos bucket
DROP POLICY IF EXISTS "Anyone can upload contestant photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view contestant photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for contestant-photos" ON storage.objects;

CREATE POLICY "Anyone can view contestant photos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'contestant-photos');

CREATE POLICY "Anyone can upload contestant photos" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'contestant-photos');
