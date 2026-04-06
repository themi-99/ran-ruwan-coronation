
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Profiles: everyone can read
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);

-- Contestants: everyone can read and insert/update
CREATE POLICY "Anyone can read contestants" ON public.contestants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert contestants" ON public.contestants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update contestants" ON public.contestants FOR UPDATE USING (true);

-- Votes: everyone can read and insert
CREATE POLICY "Anyone can read votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert votes" ON public.votes FOR INSERT WITH CHECK (true);

-- App config: everyone can read, update
CREATE POLICY "Anyone can read app_config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Anyone can update app_config" ON public.app_config FOR UPDATE USING (true);
