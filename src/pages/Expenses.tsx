import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  Loader2,
  ChevronLeft,
  Wallet
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, ExpenseWithSplits } from "@/hooks/useExpenses";
import { useSettlements } from "@/hooks/useSettlements";
import { supabase } from "@/integrations/supabase/client";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { BalancesSidebar } from "@/components/expenses/BalancesSidebar";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";

interface Trip {
  id: string;
  title: string;
}

interface TripMember {
  user_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function Expenses() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [members, setMembers] = useState<TripMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithSplits | null>(null);
  const [loadingTrips, setLoadingTrips] = useState(true);

  const { 
    expenses, 
    loading: expensesLoading, 
    balances, 
    totalSpent,
    userBalance,
    createExpense,
    updateExpense,
    deleteExpense 
  } = useExpenses(selectedTripId);

  const {
    settlements,
    createSettlement,
    deleteSettlement
  } = useSettlements(selectedTripId);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch user's trips
  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;

      try {
        // Get trips where user is a member
        const { data: memberTrips } = await supabase
          .from("trip_members")
          .select("trip_id")
          .eq("user_id", user.id);

        const tripIds = memberTrips?.map(m => m.trip_id) || [];

        if (tripIds.length > 0) {
          const { data: tripsData } = await supabase
            .from("trips")
            .select("id, title")
            .in("id", tripIds)
            .order("created_at", { ascending: false });

          setTrips(tripsData || []);

          // Set initial trip from URL or first trip
          const urlTripId = searchParams.get("trip");
          if (urlTripId && tripsData?.some(t => t.id === urlTripId)) {
            setSelectedTripId(urlTripId);
          } else if (tripsData && tripsData.length > 0) {
            setSelectedTripId(tripsData[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchTrips();
  }, [user, searchParams]);

  // Fetch members when trip changes
  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedTripId) {
        setMembers([]);
        return;
      }

      try {
        const { data: membersData } = await supabase
          .from("trip_members")
          .select("user_id")
          .eq("trip_id", selectedTripId);

        const userIds = membersData?.map(m => m.user_id) || [];

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url")
            .in("user_id", userIds);

          const membersWithProfiles = userIds.map(userId => ({
            user_id: userId,
            profile: profiles?.find(p => p.user_id === userId)
          }));

          setMembers(membersWithProfiles);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();

    // Update URL
    if (selectedTripId) {
      setSearchParams({ trip: selectedTripId });
    }
  }, [selectedTripId, setSearchParams]);

  // Handle dialog close
  const handleDialogChange = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      // Small delay to prevent UI jump before dialog closes
      setTimeout(() => setEditingExpense(null), 300);
    }
  };

  // Handle save (create or update)
  const handleSaveExpense = async (data: any) => {
    if (data.id) {
      return await updateExpense(data.id, data);
    } else {
      return await createExpense(data);
    }
  };

  // Filter expenses by search
  const filteredExpenses = expenses.filter(exp =>
    exp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate amounts owed
  const youAreOwed = balances
    .filter(b => b.userId !== user?.id && b.amount < 0)
    .reduce((sum, b) => sum + Math.abs(b.amount), 0);
  
  const youOwe = userBalance < 0 ? Math.abs(userBalance) : 0;
  const netBalance = userBalance;

  if (authLoading || loadingTrips) {
    return (
      <AppLayout>
        <main className="pt-24 pb-16 relative z-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  to={selectedTripId ? `/trips/${selectedTripId}` : "/trips"}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Dettagli viaggio
                </Link>
              </Button>
              <h1 className="text-3xl font-semibold flex items-center gap-2">
                <Wallet className="h-8 w-8" />
                Spese
              </h1>
              <p className="text-muted-foreground mt-1">
                Traccia le spese e dividi i costi con i tuoi compagni di viaggio
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Trip Selector */}
              {trips.length > 0 && (
                <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleziona viaggio" />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button 
                variant="sunset" 
                size="lg"
                disabled={!selectedTripId}
                onClick={() => {
                  setEditingExpense(null);
                  setShowAddDialog(true);
                }}
              >
                <Plus className="w-5 h-5" />
                Aggiungi Spesa
              </Button>
            </div>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                Non fai parte di nessun viaggio ancora.
              </p>
              <Button variant="outline" onClick={() => navigate("/trips")}>
                Vai ai Viaggi
              </Button>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="app-surface p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Totale</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">€{totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Speso in totale</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="app-surface p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                      <ArrowDownLeft className="w-6 h-6 text-forest" />
                    </div>
                    <span className="text-xs text-muted-foreground">Credito</span>
                  </div>
                  <p className="text-2xl font-bold text-forest">
                    €{userBalance > 0 ? userBalance.toFixed(2) : "0.00"}
                  </p>
                  <p className="text-sm text-muted-foreground">Ti devono</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="app-surface p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <ArrowUpRight className="w-6 h-6 text-secondary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Debito</span>
                  </div>
                  <p className="text-2xl font-bold text-secondary">€{youOwe.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Devi</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="app-surface p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-xs text-muted-foreground">Bilancio</span>
                  </div>
                  <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-forest" : "text-secondary"}`}>
                    {netBalance >= 0 ? "+" : ""}€{netBalance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Saldo netto</p>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Expenses List */}
                <div className="lg:col-span-2">
                  {/* Search & Filter */}
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Cerca spese..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-12 pr-4 rounded-2xl border border-border/60 bg-card/85 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <Button variant="outline" disabled>
                      <Filter className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Expenses */}
                  {expensesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : filteredExpenses.length === 0 ? (
                    <div className="text-center py-12 app-section">
                      <p className="text-muted-foreground">
                        {searchQuery 
                          ? "Nessuna spesa trovata per questa ricerca"
                          : "Nessuna spesa ancora. Aggiungi la prima!"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredExpenses.map((expense, index) => (
                        <ExpenseCard
                          key={expense.id}
                          expense={expense}
                          canDelete={expense.created_by === user?.id}
                          onDelete={() => deleteExpense(expense.id)}
                          onEdit={expense.created_by === user?.id ? () => {
                            setEditingExpense(expense);
                            setShowAddDialog(true);
                          } : undefined}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Balances Sidebar */}
                <div>
                  <BalancesSidebar 
                    balances={balances} 
                    currentUserId={user?.id}
                    tripId={selectedTripId}
                    settlements={settlements}
                    onSettle={createSettlement}
                    onDeleteSettlement={deleteSettlement}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Add/Edit Expense Dialog */}
      <AddExpenseDialog
        open={showAddDialog}
        onOpenChange={handleDialogChange}
        tripId={selectedTripId}
        members={members}
        currentUserId={user?.id || ""}
        expenseToEdit={editingExpense}
        onSubmit={handleSaveExpense}
      />
    </AppLayout>
  );
}
