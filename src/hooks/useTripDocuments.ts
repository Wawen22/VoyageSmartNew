import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type WalletDocumentCategory =
  | "flight"
  | "hotel"
  | "passport"
  | "insurance"
  | "visa"
  | "ticket"
  | "other";

export interface TripWalletDocument {
  id: string;
  trip_id: string;
  created_by: string;
  title: string;
  category: WalletDocumentCategory | string;
  document_url: string;
  storage_path: string | null;
  notes: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateWalletDocumentInput {
  trip_id: string;
  title: string;
  category?: WalletDocumentCategory;
  document_url: string;
  storage_path?: string | null;
  notes?: string | null;
  is_pinned?: boolean;
}

interface UpdateWalletDocumentInput {
  id: string;
  title?: string;
  category?: WalletDocumentCategory;
  notes?: string | null;
  is_pinned?: boolean;
}

export function useTripDocuments(tripId?: string, enabled = true) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["trip-documents", tripId],
    queryFn: async () => {
      if (!tripId || !user) return [];
      const { data, error } = await supabase
        .from("trip_documents")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as TripWalletDocument[];
    },
    enabled: Boolean(tripId && user && enabled),
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateWalletDocumentInput) => {
      if (!user) throw new Error("Utente non autenticato");

      const { error } = await supabase.from("trip_documents").insert({
        trip_id: input.trip_id,
        created_by: user.id,
        title: input.title,
        category: input.category || "other",
        document_url: input.document_url,
        storage_path: input.storage_path || null,
        notes: input.notes || null,
        is_pinned: input.is_pinned ?? false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-documents", tripId] });
      toast({ title: "Documento aggiunto al Wallet" });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il documento.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateWalletDocumentInput) => {
      const { id, ...payload } = input;
      const { error } = await supabase
        .from("trip_documents")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-documents", tripId] });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il documento.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: Pick<TripWalletDocument, "id" | "storage_path">) => {
      const { error } = await supabase.from("trip_documents").delete().eq("id", doc.id);
      if (error) throw error;

      if (doc.storage_path) {
        await supabase.storage.from("trip-documents").remove([doc.storage_path]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-documents", tripId] });
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
    createDocument: createMutation,
    updateDocument: updateMutation,
    deleteDocument: deleteMutation,
  };
}
