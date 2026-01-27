-- Create storage bucket for trip documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-documents', 'trip-documents', true);

-- Storage policies for trip-documents bucket
CREATE POLICY "Trip members can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'trip-documents');

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'trip-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'trip-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add document columns to expenses
ALTER TABLE public.expenses ADD COLUMN receipt_url TEXT;

-- Add document columns to accommodations
ALTER TABLE public.accommodations ADD COLUMN document_url TEXT;

-- Add document columns to transports
ALTER TABLE public.transports ADD COLUMN document_url TEXT;