import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO, isPast, isFuture, isToday } from "date-fns";

export interface TripStats {
  // Budget
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  accommodationsCost: number;
  transportsCost: number;
  totalBudget: number;
  currency: string;

  // Time
  daysUntilStart: number;
  daysUntilEnd: number;
  tripDuration: number;
  tripStatus: "upcoming" | "ongoing" | "completed";

  // Counts
  expensesCount: number;
  activitiesCount: number;
  accommodationsCount: number;
  transportsCount: number;
  membersCount: number;
  ideasCount: number;

  // Checklist
  checklistTotal: number;
  checklistCompleted: number;
  checklistProgress: number;

  // Loading state
  isLoading: boolean;
}

export function useTripStats(tripId: string | undefined) {
  const [stats, setStats] = useState<TripStats>({
    totalExpenses: 0,
    expensesByCategory: {},
    accommodationsCost: 0,
    transportsCost: 0,
    totalBudget: 0,
    currency: "EUR",
    daysUntilStart: 0,
    daysUntilEnd: 0,
    tripDuration: 0,
    tripStatus: "upcoming",
    expensesCount: 0,
    activitiesCount: 0,
    accommodationsCount: 0,
    transportsCount: 0,
    membersCount: 0,
    ideasCount: 0,
    checklistTotal: 0,
    checklistCompleted: 0,
    checklistProgress: 0,
    isLoading: true,
  });

  useEffect(() => {
    if (!tripId) return;

    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [
          tripResult,
          expensesResult,
          accommodationsResult,
          transportsResult,
          activitiesResult,
          membersResult,
          checklistResult,
          ideasResult,
        ] = await Promise.all([
          supabase.from("trips").select("*").eq("id", tripId).maybeSingle(),
          supabase.from("expenses").select("amount, currency, category").eq("trip_id", tripId),
          supabase.from("accommodations").select("price, currency").eq("trip_id", tripId),
          supabase.from("transports").select("price, currency").eq("trip_id", tripId),
          supabase.from("itinerary_activities").select("id").eq("trip_id", tripId),
          supabase.from("trip_members").select("id").eq("trip_id", tripId),
          supabase.from("checklist_items").select("id, is_completed").eq("trip_id", tripId),
          supabase.from("trip_ideas").select("id").eq("trip_id", tripId),
        ]);

        const trip = tripResult.data;
        const expenses = expensesResult.data || [];
        const accommodations = accommodationsResult.data || [];
        const transports = transportsResult.data || [];
        const activities = activitiesResult.data || [];
        const members = membersResult.data || [];
        const checklistItems = checklistResult.data || [];
        const ideas = ideasResult.data || [];

        // Calculate expenses by category
        const expensesByCategory: Record<string, number> = {};
        let totalExpenses = 0;
        expenses.forEach((exp) => {
          totalExpenses += Number(exp.amount) || 0;
          const cat = exp.category || "other";
          expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (Number(exp.amount) || 0);
        });

        // Calculate accommodation and transport costs
        const accommodationsCost = accommodations.reduce(
          (sum, acc) => sum + (Number(acc.price) || 0),
          0
        );
        const transportsCost = transports.reduce(
          (sum, t) => sum + (Number(t.price) || 0),
          0
        );

        // Calculate time-related stats
        const today = new Date();
        const startDate = trip ? parseISO(trip.start_date) : today;
        const endDate = trip ? parseISO(trip.end_date) : today;

        const daysUntilStart = differenceInDays(startDate, today);
        const daysUntilEnd = differenceInDays(endDate, today);
        const tripDuration = differenceInDays(endDate, startDate) + 1;

        let tripStatus: "upcoming" | "ongoing" | "completed" = "upcoming";
        if (isPast(endDate) && !isToday(endDate)) {
          tripStatus = "completed";
        } else if ((isPast(startDate) || isToday(startDate)) && (isFuture(endDate) || isToday(endDate))) {
          tripStatus = "ongoing";
        }

        // Calculate checklist progress
        const checklistTotal = checklistItems.length;
        const checklistCompleted = checklistItems.filter((item) => item.is_completed).length;
        const checklistProgress = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

        // Total budget = expenses + accommodations + transports
        const totalBudget = totalExpenses + accommodationsCost + transportsCost;

        setStats({
          totalExpenses,
          expensesByCategory,
          accommodationsCost,
          transportsCost,
          totalBudget,
          currency: "EUR",
          daysUntilStart,
          daysUntilEnd,
          tripDuration,
          tripStatus,
          expensesCount: expenses.length,
          activitiesCount: activities.length,
          accommodationsCount: accommodations.length,
          transportsCount: transports.length,
          membersCount: members.length,
          ideasCount: ideas.length,
          checklistTotal,
          checklistCompleted,
          checklistProgress,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching trip stats:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, [tripId]);

  return stats;
}
