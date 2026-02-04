-- Trip Wallet documents table
CREATE TABLE public.trip_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  document_url TEXT NOT NULL,
  storage_path TEXT,
  notes TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX trip_documents_trip_id_idx ON public.trip_documents(trip_id);

ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view wallet documents"
ON public.trip_documents FOR SELECT
USING (public.is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can add wallet documents"
ON public.trip_documents FOR INSERT
WITH CHECK (public.is_trip_member(auth.uid(), trip_id) AND created_by = auth.uid());

CREATE POLICY "Trip members can update wallet documents"
ON public.trip_documents FOR UPDATE
USING (public.is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can delete wallet documents"
ON public.trip_documents FOR DELETE
USING (public.is_trip_member(auth.uid(), trip_id));

CREATE TRIGGER update_trip_documents_updated_at
BEFORE UPDATE ON public.trip_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trip Vault documents table (encrypted, private)
CREATE TABLE public.trip_vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  encryption_version INT NOT NULL DEFAULT 1,
  encryption_iv TEXT NOT NULL,
  encryption_salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX trip_vault_documents_trip_id_idx ON public.trip_vault_documents(trip_id);

ALTER TABLE public.trip_vault_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vault owners can view vault documents"
ON public.trip_vault_documents FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Vault owners can add vault documents"
ON public.trip_vault_documents FOR INSERT
WITH CHECK (created_by = auth.uid() AND public.is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Vault owners can update vault documents"
ON public.trip_vault_documents FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Vault owners can delete vault documents"
ON public.trip_vault_documents FOR DELETE
USING (created_by = auth.uid());

CREATE TRIGGER update_trip_vault_documents_updated_at
BEFORE UPDATE ON public.trip_vault_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for Vault documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault-documents', 'vault-documents', false);

-- Storage policies for vault-documents bucket
CREATE POLICY "Vault owner can view vault objects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vault-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vault owner can upload vault objects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vault-documents'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vault owner can delete vault objects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vault-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
