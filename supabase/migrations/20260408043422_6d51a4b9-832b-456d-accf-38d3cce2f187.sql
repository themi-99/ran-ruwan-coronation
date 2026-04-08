
-- Add is_judge column to profiles
ALTER TABLE public.profiles ADD COLUMN is_judge boolean NOT NULL DEFAULT false;

-- Drop existing unique constraints that limit to 1 vote per category
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS unique_vote_per_category;
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS unique_voter_category;
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_voter_nic_category_key;

-- Add new unique constraint: one vote per voter per candidate per category
ALTER TABLE public.votes ADD CONSTRAINT unique_voter_candidate_category UNIQUE (voter_nic, candidate_nic, category);
