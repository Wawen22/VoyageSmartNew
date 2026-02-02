import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Balance } from "@/hooks/useExpenses";

export interface Settlement {
  id: string;
  trip_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  notes: string | null;
  settled_at: string;
  created_by: string;
  created_at: string;
}

export interface SettlementWithProfiles extends Settlement {
  from_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  to_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface OptimalPayment {
  from: {
    userId: string;
    name: string;
    avatarUrl: string | null;
  };
  to: {
    userId: string;
    name: string;
    avatarUrl: string | null;
  };
  amount: number;
}

interface CreateSettlementData {
  trip_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  notes?: string;
}

/**
 * Calculate optimal payments to settle all debts
 * Uses a greedy algorithm to minimize number of transactions
 */
export function calculateOptimalPayments(balances: Balance[]): OptimalPayment[] {
  // Create working copies
  const debtors: { userId: string; name: string; avatarUrl: string | null; amount: number }[] = [];
  const creditors: { userId: string; name: string; avatarUrl: string | null; amount: number }[] = [];

  balances.forEach(b => {
    if (b.amount < -0.01) {
      // Owes money (negative balance)
      debtors.push({ ...b, amount: Math.abs(b.amount) });
    } else if (b.amount > 0.01) {
      // Is owed money (positive balance)
      creditors.push({ ...b, amount: b.amount });
    }
  });

  // Sort for optimal matching (largest first)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const payments: OptimalPayment[] = [];

  // Match debtors with creditors
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const paymentAmount = Math.min(debtor.amount, creditor.amount);

    if (paymentAmount > 0.01) {
      payments.push({
        from: {
          userId: debtor.userId,
          name: debtor.name,
          avatarUrl: debtor.avatarUrl
        },
        to: {
          userId: creditor.userId,
          name: creditor.name,
          avatarUrl: creditor.avatarUrl
        },
        amount: Math.round(paymentAmount * 100) / 100
      });
    }

    debtor.amount -= paymentAmount;
    creditor.amount -= paymentAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return payments;
}

export function useSettlements(tripId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settlements, setSettlements] = useState<SettlementWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettlements = useCallback(async () => {
    if (!tripId || !user) {
      setSettlements([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("settlements")
        .select("*")
        .eq("trip_id", tripId)
        .order("settled_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for from/to users
      const userIds = new Set<string>();
      data?.forEach(s => {
        userIds.add(s.from_user_id);
        userIds.add(s.to_user_id);
      });

      const profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", [...userIds]);

        profiles?.forEach(p => {
          profilesMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }

      const settlementsWithProfiles: SettlementWithProfiles[] = (data || []).map(s => ({
        ...s,
        from_profile: profilesMap[s.from_user_id],
        to_profile: profilesMap[s.to_user_id]
      }));

      setSettlements(settlementsWithProfiles);
    } catch (error: any) {
      console.error("Error fetching settlements:", error);
    } finally {
      setLoading(false);
    }
  }, [tripId, user]);

  const createSettlement = async (data: CreateSettlementData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("settlements")
        .insert({
          trip_id: data.trip_id,
          from_user_id: data.from_user_id,
          to_user_id: data.to_user_id,
          amount: data.amount,
          notes: data.notes,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Saldo registrato",
        description: `Pagamento di €${data.amount.toFixed(2)} registrato con successo`
      });

      await fetchSettlements();
      // Immediately invalidate expenses query to update balances
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      return true;
    } catch (error: any) {
      console.error("Error creating settlement:", error);
      toast({
        title: "Errore",
        description: "Impossibile registrare il saldo",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteSettlement = async (settlementId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("settlements")
        .delete()
        .eq("id", settlementId);

      if (error) throw error;

      toast({ title: "Saldo eliminato" });
      await fetchSettlements();
      // Immediately invalidate expenses query to update balances
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      return true;
    } catch (error: any) {
      console.error("Error deleting settlement:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il saldo",
        variant: "destructive"
      });
      return false;
    }
  };

  // Subscribe to realtime changes
  useEffect(() => {
    if (!tripId) return;

    fetchSettlements();

    const channel = supabase
      .channel(`settlements-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settlements",
          filter: `trip_id=eq.${tripId}`
        },
        () => {
          fetchSettlements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, fetchSettlements]);

  return {
    settlements,
    loading,
    createSettlement,
    deleteSettlement,
    refetch: fetchSettlements
  };
}
