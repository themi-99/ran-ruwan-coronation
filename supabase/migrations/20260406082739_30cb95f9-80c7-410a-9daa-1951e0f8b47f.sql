
-- Switch contestants policy to use app_metadata
DROP POLICY IF EXISTS "Authenticated users can register as contestant" ON public.contestants;
CREATE POLICY "Authenticated users can register as contestant"
  ON public.contestants FOR INSERT
  TO authenticated
  WITH CHECK (
    nic IS NOT NULL
    AND nic = ((auth.jwt() -> 'app_metadata') ->> 'custom_nic')
  );

-- Switch votes policy to use app_metadata
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.votes;
CREATE POLICY "Authenticated users can vote"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (
    voter_nic IS NOT NULL
    AND candidate_nic IS NOT NULL
    AND category IS NOT NULL
    AND voter_nic = ((auth.jwt() -> 'app_metadata') ->> 'custom_nic')
  );

-- Switch storage policies to use app_metadata
DROP POLICY IF EXISTS "Authenticated users can upload contestant photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload contestant photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contestant-photos'
    AND (storage.foldername(name))[1] = ((auth.jwt() -> 'app_metadata') ->> 'custom_nic')
  );

DROP POLICY IF EXISTS "Admins can update contestant photos" ON storage.objects;
CREATE POLICY "Admins can update contestant photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'contestant-photos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE nic = ((auth.jwt() -> 'app_metadata') ->> 'custom_nic')
      AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete contestant photos" ON storage.objects;
CREATE POLICY "Admins can delete contestant photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'contestant-photos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE nic = ((auth.jwt() -> 'app_metadata') ->> 'custom_nic')
      AND is_admin = true
    )
  );
