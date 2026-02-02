-- Add url column
ALTER TABLE public.trip_ideas ADD COLUMN IF NOT EXISTS url TEXT;

-- Migrate data: Move content to url for LINK type
UPDATE public.trip_ideas 
SET url = content, content = NULL 
WHERE type = 'LINK' AND url IS NULL;

-- Drop the check constraint on type (since we are unifying them)
ALTER TABLE public.trip_ideas DROP CONSTRAINT IF EXISTS trip_ideas_type_check;

-- Optionally, we can set all types to 'NOTE' or a new 'IDEA' type, or just leave them.
-- Let's default new ones to 'IDEA' if we keep the column, but strictly speaking we don't need to change old values if we just ignore the column in UI.
-- However, for consistency, let's update them.
UPDATE public.trip_ideas SET type = 'IDEA';
