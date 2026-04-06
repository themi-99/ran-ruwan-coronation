
-- Fix contestants INSERT policy
DROP POLICY IF EXISTS "Users can insert their own contestant entry" ON public.contestants;
CREATE POLICY "Authenticated users can register as contestant"
  ON public.contestants FOR INSERT
  TO authenticated
  WITH CHECK (
    nic IS NOT NULL
    AND nic = (auth.jwt() -> 'user_metadata' ->> 'custom_nic')
  );

-- Fix votes INSERT policy
DROP POLICY IF EXISTS "Users can insert votes with valid NIC" ON public.votes;
CREATE POLICY "Authenticated users can vote"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (
    voter_nic IS NOT NULL
    AND candidate_nic IS NOT NULL
    AND category IS NOT NULL
    AND voter_nic = (auth.jwt() -> 'user_metadata' ->> 'custom_nic')
  );

-- Add unique constraint on votes if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_vote_per_category'
  ) THEN
    ALTER TABLE public.votes ADD CONSTRAINT unique_vote_per_category UNIQUE (voter_nic, category);
  END IF;
END $$;

-- Fix storage policies
DROP POLICY IF EXISTS "Anyone can upload contestant photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update contestant photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete contestant photos" ON storage.objects;

-- Authenticated users can upload to their own NIC folder
CREATE POLICY "Authenticated users can upload contestant photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contestant-photos'
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'user_metadata' ->> 'custom_nic')
  );

-- Only admins can update photos
CREATE POLICY "Admins can update contestant photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'contestant-photos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE nic = (auth.jwt() -> 'user_metadata' ->> 'custom_nic')
      AND is_admin = true
    )
  );

-- Only admins can delete photos
CREATE POLICY "Admins can delete contestant photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'contestant-photos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE nic = (auth.jwt() -> 'user_metadata' ->> 'custom_nic')
      AND is_admin = true
    )
  );
