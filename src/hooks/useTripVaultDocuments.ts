import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { encryptFile } from "@/utils/vaultCrypto";

export type VaultDocumentCategory =
  | "passport"
  | "insurance"
  | "visa"
  | "id"
  | "medical"
  | "other";

export interface TripVaultDocument {
  id: string;
  trip_id: string;
  created_by: string;
  title: string;
  category: VaultDocumentCategory | string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  encryption_version: number;
  encryption_iv: string;
  encryption_salt: string;
  created_at: string;
  updated_at: string;
}

interface CreateVaultDocumentInput {
  trip_id: string;
  title: string;
  category?: VaultDocumentCategory;
  file: File;
  passphrase: string;
}

export function useTripVaultDocuments(tripId?: string, enabled = true) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["trip-vault-documents", tripId],
    queryFn: async () => {
      if (!tripId || !user) return [];
      const { data, error } = await supabase
        .from("trip_vault_documents")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as TripVaultDocument[];
    },
    enabled: Boolean(tripId && user && enabled),
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateVaultDocumentInput) => {
      if (!user) throw new Error("Utente non autenticato");
      if (!tripId) throw new Error("Viaggio non valido");
      if (!input.passphrase) throw new Error("Passphrase mancante");

      const { encryptedBlob, iv, salt } = await encryptFile(input.file, input.passphrase);
      const fileExt = input.file.name.split(".").pop() || "bin";
      const filePath = `${user.id}/${tripId}/vault/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("vault-documents")
        .upload(filePath, encryptedBlob, {
          contentType: "application/octet-stream",
        });

      if (uploadError) throw uploadError;

      const { error } = await supabase.from("trip_vault_documents").insert({
        trip_id: input.trip_id,
        created_by: user.id,
        title: input.title,
        category: input.category || "other",
        file_path: filePath,
        file_name: input.file.name,
        mime_type: input.file.type || null,
        size_bytes: input.file.size,
        encryption_version: 1,
        encryption_iv: iv,
        encryption_salt: salt,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-vault-documents", tripId] });
      toast({ title: "Documento aggiunto alla Cassaforte" });
    },
    onError: (error: any) => {
      console.error(error);
      toast({
        title: "Errore",
        description: error?.message || "Impossibile salvare il documento.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: TripVaultDocument) => {
      const { error } = await supabase
        .from("trip_vault_documents")
        .delete()
        .eq("id", doc.id);
      if (error) throw error;

      await supabase.storage.from("vault-documents").remove([doc.file_path]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-vault-documents", tripId] });
      toast({ title: "Documento rimosso" });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il documento.",
        variant: "destructive",
      });
    },
  });

  return {
    ...query,
    createVaultDocument: createMutation,
    deleteVaultDocument: deleteMutation,
  };
}
