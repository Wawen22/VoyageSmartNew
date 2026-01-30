import { useState, useEffect, useCallback } from "react";
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
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<Balance[]>([]);

  const fetchExpenses = useCallback(async () => {
    if (!tripId || !user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
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

      // Fetch payer profiles
      const payerIds = [...new Set(expensesData?.map(e => e.paid_by) || [])];
      let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};

      if (payerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", payerIds);

        profiles?.forEach(p => {
          profilesMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }

      // Combine data
      const expensesWithSplits: ExpenseWithSplits[] = (expensesData || []).map(expense => ({
        ...expense,
        category: expense.category as ExpenseCategory,
        splits: splitsData.filter(s => s.expense_id === expense.id),
        paid_by_profile: profilesMap[expense.paid_by]
      }));

      setExpenses(expensesWithSplits);
      calculateBalances(expensesWithSplits, profilesMap);
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le spese",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [tripId, user, toast]);

  const calculateBalances = async (
    expensesList: ExpenseWithSplits[],
    existingProfiles: Record<string, { full_name: string | null; avatar_url: string | null }>
  ) => {
    // Collect all unique user IDs
    const allUserIds = new Set<string>();
    expensesList.forEach(expense => {
      allUserIds.add(expense.paid_by);
      expense.splits.forEach(split => allUserIds.add(split.user_id));
    });

    // Fetch any missing profiles
    const missingIds = [...allUserIds].filter(id => !existingProfiles[id]);
    if (missingIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", missingIds);

      profiles?.forEach(p => {
        existingProfiles[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
      });
    }

    // Calculate net balance for each user
    const balanceMap: Record<string, number> = {};

    expensesList.forEach(expense => {
      // The payer gets credited the total amount
      balanceMap[expense.paid_by] = (balanceMap[expense.paid_by] || 0) + expense.amount;

      // Each person in the split owes their share
      expense.splits.forEach(split => {
        balanceMap[split.user_id] = (balanceMap[split.user_id] || 0) - split.amount;
      });
    });

    const balancesList: Balance[] = Object.entries(balanceMap).map(([userId, amount]) => ({
      userId,
      name: existingProfiles[userId]?.full_name || "Utente",
      avatarUrl: existingProfiles[userId]?.avatar_url,
      amount: Math.round(amount * 100) / 100 // Round to 2 decimals
    }));

    setBalances(balancesList);
  };

  const createExpense = async (data: CreateExpenseData): Promise<boolean> => {
    if (!user) return false;

    try {
      // Create the expense
      const { data: expense, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          trip_id: data.trip_id,
          description: data.description,
          amount: data.amount,
          currency: "EUR", // Always store normalized amount in EUR (or base currency)
          original_amount: data.original_amount,
          original_currency: data.original_currency,
          exchange_rate: data.exchange_rate,
          category: data.category,
          paid_by: data.paid_by,
          created_by: user.id,
          expense_date: data.expense_date || new Date().toISOString().split('T')[0],
          receipt_url: data.receipt_url || null
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Calculate split amounts
      const splitAmount = data.split_amounts || {};
      const equalSplit = data.amount / data.split_with.length;

      // Create splits
      const splits = data.split_with.map(userId => ({
        expense_id: expense.id,
        user_id: userId,
        amount: splitAmount[userId] || equalSplit
      }));

      const { error: splitsError } = await supabase
        .from("expense_splits")
        .insert(splits);

      if (splitsError) throw splitsError;

      toast({
        title: "Spesa aggiunta",
        description: `${data.description} - €${data.amount.toFixed(2)}`
      });

      await fetchExpenses();
      return true;
    } catch (error: any) {
      console.error("Error creating expense:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare la spesa",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateExpense = async (expenseId: string, data: CreateExpenseData): Promise<boolean> => {
    if (!user) return false;

    try {
      // 1. Update the expense record
      const { error: expenseError } = await supabase
        .from("expenses")
        .update({
          description: data.description,
          amount: data.amount,
          // currency: "EUR" (base currency usually doesn't change unless we re-convert)
          original_amount: data.original_amount,
          original_currency: data.original_currency,
          exchange_rate: data.exchange_rate,
          category: data.category,
          paid_by: data.paid_by,
          expense_date: data.expense_date || new Date().toISOString().split('T')[0],
          receipt_url: data.receipt_url || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", expenseId);

      if (expenseError) throw expenseError;

      // 2. Delete existing splits
      const { error: deleteSplitsError } = await supabase
        .from("expense_splits")
        .delete()
        .eq("expense_id", expenseId);

      if (deleteSplitsError) throw deleteSplitsError;

      // 3. Create new splits
      const splitAmount = data.split_amounts || {};
      const equalSplit = data.amount / data.split_with.length;

      const splits = data.split_with.map(userId => ({
        expense_id: expenseId,
        user_id: userId,
        amount: splitAmount[userId] || equalSplit
      }));

      const { error: insertSplitsError } = await supabase
        .from("expense_splits")
        .insert(splits);

      if (insertSplitsError) throw insertSplitsError;

      toast({
        title: "Spesa aggiornata",
        description: `${data.description}`
      });

      await fetchExpenses();
      return true;
    } catch (error: any) {
      console.error("Error updating expense:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la spesa",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteExpense = async (expenseId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;

      toast({
        title: "Spesa eliminata"
      });

      await fetchExpenses();
      return true;
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la spesa",
        variant: "destructive"
      });
      return false;
    }
  };

  // Subscribe to realtime changes
  useEffect(() => {
    if (!tripId) return;

    fetchExpenses();

    const channel = supabase
      .channel(`expenses-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `trip_id=eq.${tripId}`
        },
        () => {
          fetchExpenses();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expense_splits"
        },
        () => {
          fetchExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, fetchExpenses]);

  // Calculate summary stats
  const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const userBalance = balances.find(b => b.userId === user?.id)?.amount || 0;

  return {
    expenses,
    loading,
    balances,
    totalSpent,
    userBalance,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses
  };
}
