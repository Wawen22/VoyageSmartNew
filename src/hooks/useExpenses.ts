import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type ExpenseCategory = 'food' | 'transport' | 'accommodation' | 'activities' | 'shopping' | 'other';

export interface Expense {
  id: string;
  trip_id: string;
  description: string;
  amount: number;
  currency: string;
  original_amount: number;
  original_currency: string;
  exchange_rate: number;
  category: ExpenseCategory;
  paid_by: string;
  created_by: string;
  expense_date: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  is_paid: boolean;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ExpenseWithSplits extends Expense {
  splits: ExpenseSplit[];
  paid_by_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Balance {
  userId: string;
  name: string;
  avatarUrl: string | null;
  amount: number; // positive = owed to them, negative = they owe
}

interface CreateExpenseData {
  trip_id: string;
  description: string;
  amount: number;
  original_amount: number;
  original_currency: string;
  exchange_rate: number;
  category: ExpenseCategory;
  paid_by: string;
  expense_date?: string;
  split_with: string[]; // user IDs to split with
  split_amounts?: Record<string, number>; // optional custom split amounts
  receipt_url?: string;
}

export function useExpenses(tripId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching expenses
  const { data: expenses = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: async () => {
      if (!tripId || !user) return [];

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("trip_id", tripId)
        .order("expense_date", { ascending: false });

      if (expensesError) throw expensesError;

      // Fetch all splits for these expenses
      const expenseIds = expensesData?.map(e => e.id) || [];
      let splitsData: ExpenseSplit[] = [];
      
      if (expenseIds.length > 0) {
        const { data: splits, error: splitsError } = await supabase
          .from("expense_splits")
          .select("*")
          .in("expense_id", expenseIds);

        if (splitsError) throw splitsError;
        splitsData = (splits || []) as ExpenseSplit[];
      }

      // Fetch profiles for all users involved (payers + split users)
      const payerIds = [...new Set(expensesData?.map(e => e.paid_by) || [])];
      const splitUserIds = [...new Set(splitsData.map(split => split.user_id))];
      const profileIds = [...new Set([...payerIds, ...splitUserIds])];
      let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};

      if (profileIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", profileIds);

        profiles?.forEach(p => {
          profilesMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }

      const splitsWithProfiles = splitsData.map(split => ({
        ...split,
        profile: profilesMap[split.user_id]
      }));

      // Combine data
      return (expensesData || []).map(expense => ({
        ...expense,
        category: expense.category as ExpenseCategory,
        splits: splitsWithProfiles.filter(s => s.expense_id === expense.id),
        paid_by_profile: profilesMap[expense.paid_by]
      })) as ExpenseWithSplits[];
    },
    enabled: !!tripId && !!user,
  });

  // Calculate balances and stats
  const { balances, totalSpent, userBalance } = useMemo(() => {
    let balancesList: Balance[] = [];
    let total = 0;
    let uBalance = 0;

    if (expenses.length > 0) {
      const balanceMap: Record<string, number> = {};
      const profilesMap: Record<string, { name: string, avatar: string | null }> = {};

      expenses.forEach(expense => {
        total += expense.amount;
        
        // Populate profile map from existing data if possible
        if (expense.paid_by_profile) {
           profilesMap[expense.paid_by] = { 
             name: expense.paid_by_profile.full_name || "Utente", 
             avatar: expense.paid_by_profile.avatar_url 
           };
        }

        balanceMap[expense.paid_by] = (balanceMap[expense.paid_by] || 0) + expense.amount;
        expense.splits.forEach(split => {
          if (split.profile) {
            profilesMap[split.user_id] = {
              name: split.profile.full_name || "Utente",
              avatar: split.profile.avatar_url
            };
          }
          balanceMap[split.user_id] = (balanceMap[split.user_id] || 0) - split.amount;
        });
      });

      balancesList = Object.entries(balanceMap).map(([userId, amount]) => ({
        userId,
        name: profilesMap[userId]?.name || "Utente",
        avatarUrl: profilesMap[userId]?.avatar || null,
        amount: Math.round(amount * 100) / 100
      }));

      uBalance = balancesList.find(b => b.userId === user?.id)?.amount || 0;
    }

    return { balances: balancesList, totalSpent: total, userBalance: uBalance };
  }, [expenses, user]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: CreateExpenseData) => {
      const { data: expense, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          trip_id: data.trip_id,
          description: data.description,
          amount: data.amount,
          currency: "EUR",
          original_amount: data.original_amount,
          original_currency: data.original_currency,
          exchange_rate: data.exchange_rate,
          category: data.category,
          paid_by: data.paid_by,
          created_by: user!.id,
          expense_date: data.expense_date || new Date().toISOString().split('T')[0],
          receipt_url: data.receipt_url || null
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      const splitAmount = data.split_amounts || {};
      const equalSplit = data.amount / data.split_with.length;

      const splits = data.split_with.map(userId => ({
        expense_id: expense.id,
        user_id: userId,
        amount: splitAmount[userId] || equalSplit
      }));

      const { error: splitsError } = await supabase
        .from("expense_splits")
        .insert(splits);

      if (splitsError) throw splitsError;
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      toast({ title: "Spesa aggiunta" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile creare la spesa", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateExpenseData }) => {
      const { error: expenseError } = await supabase
        .from("expenses")
        .update({
          description: data.description,
          amount: data.amount,
          original_amount: data.original_amount,
          original_currency: data.original_currency,
          exchange_rate: data.exchange_rate,
          category: data.category,
          paid_by: data.paid_by,
          expense_date: data.expense_date || new Date().toISOString().split('T')[0],
          receipt_url: data.receipt_url || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (expenseError) throw expenseError;

      await supabase.from("expense_splits").delete().eq("expense_id", id);

      const splitAmount = data.split_amounts || {};
      const equalSplit = data.amount / data.split_with.length;

      const splits = data.split_with.map(userId => ({
        expense_id: id,
        user_id: userId,
        amount: splitAmount[userId] || equalSplit
      }));

      const { error: insertSplitsError } = await supabase.from("expense_splits").insert(splits);
      if (insertSplitsError) throw insertSplitsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      toast({ title: "Spesa aggiornata" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile aggiornare la spesa", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      toast({ title: "Spesa eliminata" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile eliminare la spesa", variant: "destructive" });
    }
  });

  // Realtime subscription
  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`expenses-${tripId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses", filter: `trip_id=eq.${tripId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "expense_splits" }, () => {
        queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  return {
    expenses,
    loading,
    balances,
    totalSpent,
    userBalance,
    createExpense: async (data: CreateExpenseData) => {
      await createMutation.mutateAsync(data);
      return true;
    },
    updateExpense: async (id: string, data: CreateExpenseData) => {
      await updateMutation.mutateAsync({ id, data });
      return true;
    },
    deleteExpense: async (id: string) => {
      await deleteMutation.mutateAsync(id);
      return true;
    },
    refetch
  };
}
