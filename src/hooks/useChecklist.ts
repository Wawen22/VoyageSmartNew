import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useEffect } from "react";

export interface ChecklistItem {
  id: string;
  trip_id: string;
  user_id: string | null;
  text: string;
  is_completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
  category: string;
  created_by: string;
  created_at: string;
}

export function useChecklist(tripId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch checklist items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["checklist", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      
      const { data, error } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChecklistItem[];
    },
    enabled: !!tripId && !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!tripId || !user) return;

    const channel = supabase
      .channel(`checklist-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checklist_items",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["checklist", tripId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, user, queryClient]);

  // Add item
  const addItem = useMutation({
    mutationFn: async ({
      text,
      isPersonal,
      category = "general",
    }: {
      text: string;
      isPersonal: boolean;
      category?: string;
    }) => {
      if (!tripId || !user) throw new Error("Missing trip or user");

      const { error } = await supabase.from("checklist_items").insert({
        trip_id: tripId,
        user_id: isPersonal ? user.id : null,
        text,
        category,
        created_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", tripId] });
      toast.success("Elemento aggiunto");
    },
    onError: () => {
      toast.error("Errore nell'aggiunta dell'elemento");
    },
  });

  // Toggle item
  const toggleItem = useMutation({
    mutationFn: async (item: ChecklistItem) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("checklist_items")
        .update({
          is_completed: !item.is_completed,
          completed_by: !item.is_completed ? user.id : null,
          completed_at: !item.is_completed ? new Date().toISOString() : null,
        })
        .eq("id", item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", tripId] });
    },
    onError: () => {
      toast.error("Errore nell'aggiornamento");
    },
  });

  // Delete item
  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("checklist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", tripId] });
      toast.success("Elemento eliminato");
    },
    onError: () => {
      toast.error("Errore nell'eliminazione");
    },
  });

  // Separate items
  const groupItems = items.filter((item) => item.user_id === null);
  const personalItems = items.filter((item) => item.user_id === user?.id);

  // Stats
  const groupCompleted = groupItems.filter((i) => i.is_completed).length;
  const personalCompleted = personalItems.filter((i) => i.is_completed).length;

  return {
    items,
    groupItems,
    personalItems,
    isLoading,
    addItem: addItem.mutate,
    toggleItem: toggleItem.mutate,
    deleteItem: deleteItem.mutate,
    isAdding: addItem.isPending,
    groupStats: { total: groupItems.length, completed: groupCompleted },
    personalStats: { total: personalItems.length, completed: personalCompleted },
  };
}
