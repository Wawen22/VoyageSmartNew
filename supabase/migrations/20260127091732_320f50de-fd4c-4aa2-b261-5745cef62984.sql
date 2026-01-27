-- Create storage bucket for trip covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-covers', 'trip-covers', true);

-- Allow authenticated users to upload their own trip covers
CREATE POLICY "Users can upload trip covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'trip-covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own trip covers
CREATE POLICY "Users can update their own trip covers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'trip-covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own trip covers
CREATE POLICY "Users can delete their own trip covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'trip-covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access for trip cover images
CREATE POLICY "Trip covers are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'trip-covers');