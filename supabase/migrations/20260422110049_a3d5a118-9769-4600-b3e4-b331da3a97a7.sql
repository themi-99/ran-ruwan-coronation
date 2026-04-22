
-- Create judge_scores table for the new judges scoring engine
CREATE TABLE public.judge_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  judge_nic TEXT NOT NULL,
  candidate_nic TEXT NOT NULL,
  category TEXT NOT NULL,
  medal TEXT NOT NULL CHECK (medal IN ('gold', 'silver', 'bronze')),
  points INTEGER NOT NULL CHECK (points IN (5, 3, 1)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (judge_nic, candidate_nic)
);

-- Enable RLS
ALTER TABLE public.judge_scores ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read judge_scores"
ON public.judge_scores
FOR SELECT
TO public
USING (true);

-- Judges can insert their own scores
CREATE POLICY "Judges can insert own scores"
ON public.judge_scores
FOR INSERT
TO authenticated
WITH CHECK (
  judge_nic = ((auth.jwt() -> 'app_metadata'::text) ->> 'custom_nic'::text)
  AND EXISTS (SELECT 1 FROM public.profiles WHERE nic = judge_nic AND is_judge = true)
);

-- Judges can update their own scores
CREATE POLICY "Judges can update own scores"
ON public.judge_scores
FOR UPDATE
TO authenticated
USING (
  judge_nic = ((auth.jwt() -> 'app_metadata'::text) ->> 'custom_nic'::text)
  AND EXISTS (SELECT 1 FROM public.profiles WHERE nic = judge_nic AND is_judge = true)
);

-- Judges can delete their own scores
CREATE POLICY "Judges can delete own scores"
ON public.judge_scores
FOR DELETE
TO authenticated
USING (
  judge_nic = ((auth.jwt() -> 'app_metadata'::text) ->> 'custom_nic'::text)
  AND EXISTS (SELECT 1 FROM public.profiles WHERE nic = judge_nic AND is_judge = true)
);
