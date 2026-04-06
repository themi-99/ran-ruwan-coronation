
-- Fix the remaining permissive INSERT on votes
DROP POLICY IF EXISTS "Anyone can insert votes" ON public.votes;
CREATE POLICY "Users can insert votes with valid NIC" ON public.votes
FOR INSERT TO public
WITH CHECK (voter_nic IS NOT NULL AND candidate_nic IS NOT NULL AND category IS NOT NULL);
