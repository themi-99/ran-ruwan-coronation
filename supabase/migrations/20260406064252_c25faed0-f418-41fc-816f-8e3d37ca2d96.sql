
-- Create storage bucket for contestant photos
INSERT INTO storage.buckets (id, name, public) VALUES ('contestant-photos', 'contestant-photos', true);

-- Allow public read access to contestant photos
CREATE POLICY "Contestant photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'contestant-photos');

-- Allow anyone to upload contestant photos (since we use NIC-based auth, not Supabase auth)
CREATE POLICY "Anyone can upload contestant photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contestant-photos');

-- Allow anyone to update contestant photos
CREATE POLICY "Anyone can update contestant photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'contestant-photos');

-- Allow anyone to delete contestant photos
CREATE POLICY "Anyone can delete contestant photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'contestant-photos');
