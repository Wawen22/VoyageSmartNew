-- Add social fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );
