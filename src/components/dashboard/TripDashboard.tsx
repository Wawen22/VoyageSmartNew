import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle2,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
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
    activities: "bg-primary",
    shopping: "bg-emerald-500",
    other: "bg-gray-500",
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Countdown Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card/95 via-card/80 to-card/60 p-5 shadow-card min-h-[200px]",
            stats.tripStatus === "ongoing"
              ? "ring-1 ring-emerald-500/30"
              : stats.tripStatus === "completed"
              ? "ring-1 ring-muted"
              : "ring-1 ring-primary/30"
          )}
        >
          <div className={cn(
            "absolute -right-10 -top-10 h-24 w-24 rounded-full blur-3xl",
            stats.tripStatus === "ongoing"
              ? "bg-emerald-500/30"
              : stats.tripStatus === "completed"
              ? "bg-muted"
              : "bg-primary/30"
          )} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                {countdown.label}
              </p>
              <p className={cn(
                "text-4xl font-semibold mt-2",
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
              "w-11 h-11 rounded-2xl border border-border/60 bg-background/70 backdrop-blur flex items-center justify-center",
              stats.tripStatus === "ongoing" ? "text-green-600" : 
              stats.tripStatus === "completed" ? "text-muted-foreground" : "text-primary"
            )}>
              {stats.tripStatus === "completed" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="absolute bottom-5 left-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{stats.tripDuration} giorni totali</span>
          </div>
        </motion.div>

        {/* Checklist Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-accent/15 via-card/80 to-card/60 p-5 shadow-card min-h-[200px]"
        >
          <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-accent/30 blur-3xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                Checklist
              </p>
              <p className="text-3xl font-semibold text-accent mt-2">
                {stats.checklistProgress}%
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl border border-border/60 bg-background/70 backdrop-blur flex items-center justify-center text-accent">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-5 left-5 w-[calc(100%-40px)] space-y-2">
            <Progress value={stats.checklistProgress} className="h-1.5 bg-accent/20" />
            <p className="text-xs text-muted-foreground">
              {stats.checklistCompleted} di {stats.checklistTotal} completati
            </p>
          </div>
        </motion.div>
      </div>

      {/* Expense Breakdown */}
      {Object.keys(stats.expensesByCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="app-surface p-5"
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
