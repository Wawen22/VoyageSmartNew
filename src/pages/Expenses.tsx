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
  ArrowLeft,
  Wallet
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, ExpenseWithSplits } from "@/hooks/useExpenses";
import { useSettlements } from "@/hooks/useSettlements";
import { supabase } from "@/integrations/supabase/client";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { BalancesSidebar } from "@/components/expenses/BalancesSidebar";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { TripAIAssistant } from "@/components/ai-assistant/TripAIAssistant";
import { useTripDetails } from "@/hooks/useTripDetails";

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

  const { data: tripDetails } = useTripDetails(selectedTripId);

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

  // Fetch members
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

    if (selectedTripId) {
      setSearchParams({ trip: selectedTripId });
    }
  }, [selectedTripId, setSearchParams]);

  const handleDialogChange = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      setTimeout(() => setEditingExpense(null), 300);
    }
  };

  const handleSaveExpense = async (data: any) => {
    if (data.id) {
      return await updateExpense(data.id, data);
    } else {
      return await createExpense(data);
    }
  };

  const filteredExpenses = expenses.filter(exp =>
    exp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const youOwe = userBalance < 0 ? Math.abs(userBalance) : 0;
  const netBalance = userBalance;

  // Helper to get current trip title
  const currentTripTitle = trips.find(t => t.id === selectedTripId)?.title || "Spese";

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
      <main className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link
                to={selectedTripId ? `/trips/${selectedTripId}` : "/trips"}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna al viaggio
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{currentTripTitle}</span>
          </div>

          <div className="bg-card rounded-xl border shadow-sm p-3 md:p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-primary" />
                  Spese
                </h2>
                <p className="text-muted-foreground">
                  Traccia le spese e dividi i costi con i tuoi compagni di viaggio
                </p>
              </div>
              
              <div className="flex items-center gap-3">
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
                  onClick={() => {
                    setEditingExpense(null);
                    setShowAddDialog(true);
                  }}
                  disabled={!selectedTripId}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi Spesa
                </Button>
              </div>
            </div>

            {trips.length === 0 ? (
              <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-muted/40 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">Totale</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">€{totalSpent.toFixed(2)}</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 rounded-lg bg-muted/40 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center">
                        <ArrowDownLeft className="w-4 h-4 text-forest" />
                      </div>
                      <span className="text-xs text-muted-foreground">Credito</span>
                    </div>
                    <p className="text-xl font-bold text-forest">
                      €{userBalance > 0 ? userBalance.toFixed(2) : "0.00"}
                    </p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 rounded-lg bg-muted/40 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="text-xs text-muted-foreground">Debito</span>
                    </div>
                    <p className="text-xl font-bold text-secondary">€{youOwe.toFixed(2)}</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-4 rounded-lg bg-muted/40 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-xs text-muted-foreground">Bilancio</span>
                    </div>
                    <p className={`text-xl font-bold ${netBalance >= 0 ? "text-forest" : "text-secondary"}`}>
                      {netBalance >= 0 ? "+" : ""}€{netBalance.toFixed(2)}
                    </p>
                  </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
                  {/* Expenses List */}
                  <div className="lg:col-span-2">
                    <div className="flex gap-2 md:gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Cerca spese..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                      <Button variant="outline" size="icon" disabled>
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>

                    {expensesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : filteredExpenses.length === 0 ? (
                      <div className="text-center py-12 border rounded-lg border-dashed bg-muted/10">
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
                            canDelete={true}
                            onDelete={() => deleteExpense(expense.id)}
                            onEdit={() => {
                              setEditingExpense(expense);
                              setShowAddDialog(true);
                            }}
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
        </div>
      </main>

      <AddExpenseDialog
        open={showAddDialog}
        onOpenChange={handleDialogChange}
        tripId={selectedTripId}
        members={members}
        currentUserId={user?.id || ""}
        expenseToEdit={editingExpense}
        onSubmit={handleSaveExpense}
      />
      {selectedTripId && <TripAIAssistant tripId={selectedTripId} tripDetails={tripDetails || null} />}
    </AppLayout>
  );
}
