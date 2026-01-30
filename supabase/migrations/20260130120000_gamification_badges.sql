-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT NOT NULL, -- Lucide icon name
    category TEXT NOT NULL CHECK (category IN ('TRAVEL', 'SOCIAL', 'PLANNING')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Read only for everyone)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users(id) conceptually, but we match profiles
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges are viewable by everyone" ON public.user_badges FOR SELECT USING (true);

-- Seed initial badges
INSERT INTO public.badges (slug, name, description, icon_name, category) VALUES
('first-trip', 'Primo Passo', 'Hai creato il tuo primo viaggio.', 'MapPin', 'TRAVEL'),
('planner-pro', 'Pianificatore', 'Hai creato 5 viaggi.', 'Calendar', 'PLANNING'),
('globetrotter', 'Globetrotter', 'Hai visitato 3 paesi diversi.', 'Globe', 'TRAVEL'),
('social-butterfly', 'Social', 'Hai invitato un amico nel tuo viaggio.', 'Users', 'SOCIAL')
ON CONFLICT (slug) DO NOTHING;

-- Create a view for easy stats fetching
CREATE OR REPLACE VIEW public.profile_stats AS
SELECT 
    p.user_id,
    p.username,
    COUNT(DISTINCT t.id) as total_trips,
    COUNT(DISTINCT COALESCE(t.country_code, td.country_code)) as countries_visited
FROM 
    public.profiles p
LEFT JOIN 
    public.trips t ON t.user_id = p.user_id AND t.status IN ('completed', 'upcoming', 'planning') -- Count all for now, or just completed? Let's count all public ones usually
LEFT JOIN
    public.trip_destinations td ON td.trip_id = t.id
GROUP BY 
    p.user_id, p.username;
