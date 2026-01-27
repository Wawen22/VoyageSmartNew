import { motion } from "framer-motion";
import {
  Wallet,
  Calendar,
  Clock,
  CheckCircle2,
  Plane,
  Hotel,
  MapPin,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTripStats } from "@/hooks/useTripStats";
import { cn } from "@/lib/utils";

interface TripDashboardProps {
  tripId: string;
}

export function TripDashboard({ tripId }: TripDashboardProps) {
  const stats = useTripStats(tripId);

  if (stats.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-muted/50 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: stats.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCountdownText = () => {
    if (stats.tripStatus === "completed") {
      return { label: "Viaggio completato", value: "✓", sublabel: "" };
    }
    if (stats.tripStatus === "ongoing") {
      return {
        label: "Giorni rimanenti",
        value: stats.daysUntilEnd.toString(),
        sublabel: stats.daysUntilEnd === 1 ? "giorno" : "giorni",
      };
    }
    if (stats.daysUntilStart === 0) {
      return { label: "Il viaggio inizia", value: "Oggi!", sublabel: "" };
    }
    if (stats.daysUntilStart === 1) {
      return { label: "Il viaggio inizia", value: "Domani!", sublabel: "" };
    }
    return {
      label: "Countdown",
      value: stats.daysUntilStart.toString(),
      sublabel: "giorni alla partenza",
    };
  };

  const countdown = getCountdownText();

  const categoryLabels: Record<string, string> = {
    food: "Cibo",
    transport: "Trasporti",
    accommodation: "Alloggi",
    activities: "Attività",
    shopping: "Shopping",
    other: "Altro",
  };

  const categoryColors: Record<string, string> = {
    food: "bg-red-500",
    transport: "bg-sky-500",
    accommodation: "bg-amber-500",
    activities: "bg-purple-500",
    shopping: "bg-pink-500",
    other: "bg-gray-500",
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Countdown Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "relative overflow-hidden rounded-2xl p-5 border border-border",
            stats.tripStatus === "ongoing"
              ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5"
              : stats.tripStatus === "completed"
              ? "bg-gradient-to-br from-muted to-muted/50"
              : "bg-gradient-to-br from-primary/10 to-accent/5"
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {countdown.label}
              </p>
              <p className={cn(
                "text-4xl font-bold mt-1",
                stats.tripStatus === "ongoing" ? "text-green-600 dark:text-green-400" : 
                stats.tripStatus === "completed" ? "text-muted-foreground" : "text-primary"
              )}>
                {countdown.value}
              </p>
              {countdown.sublabel && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {countdown.sublabel}
                </p>
              )}
            </div>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              stats.tripStatus === "ongoing" ? "bg-green-500/20" : 
              stats.tripStatus === "completed" ? "bg-muted" : "bg-primary/20"
            )}>
              {stats.tripStatus === "completed" ? (
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Clock className={cn(
                  "w-5 h-5",
                  stats.tripStatus === "ongoing" ? "text-green-600" : "text-primary"
                )} />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{stats.tripDuration} giorni totali</span>
          </div>
        </motion.div>

        {/* Budget Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl p-5 border border-border bg-gradient-to-br from-secondary/10 to-orange-500/5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Budget Totale
              </p>
              <p className="text-3xl font-bold text-secondary mt-1">
                {formatCurrency(stats.totalBudget)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-secondary" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Spese</span>
              <span className="font-medium">{formatCurrency(stats.totalExpenses)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Alloggi</span>
              <span className="font-medium">{formatCurrency(stats.accommodationsCost)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Trasporti</span>
              <span className="font-medium">{formatCurrency(stats.transportsCost)}</span>
            </div>
          </div>
        </motion.div>

        {/* Checklist Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl p-5 border border-border bg-gradient-to-br from-accent/10 to-teal-500/5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Checklist
              </p>
              <p className="text-3xl font-bold text-accent mt-1">
                {stats.checklistProgress}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Progress value={stats.checklistProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.checklistCompleted} di {stats.checklistTotal} completati
            </p>
          </div>
        </motion.div>

        {/* Quick Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl p-5 border border-border bg-gradient-to-br from-purple-500/10 to-indigo-500/5"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Riepilogo
            </p>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm">{stats.activitiesCount} attività</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Hotel className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-sm">{stats.accommodationsCount} alloggi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Plane className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <span className="text-sm">{stats.transportsCount} trasporti</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-green-500" />
              </div>
              <span className="text-sm">{stats.membersCount} partecipanti</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expense Breakdown */}
      {Object.keys(stats.expensesByCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-5 border border-border bg-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Spese per Categoria</h3>
            <span className="text-sm text-muted-foreground">
              Totale: {formatCurrency(stats.totalExpenses)}
            </span>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = stats.totalExpenses > 0 
                  ? Math.round((amount / stats.totalExpenses) * 100) 
                  : 0;
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full", categoryColors[category] || "bg-gray-500")} />
                        <span>{categoryLabels[category] || category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{percentage}%</span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className={cn("h-full rounded-full", categoryColors[category] || "bg-gray-500")}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
