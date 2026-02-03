import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  CheckCircle2,
  Wallet,
  Calendar,
  TrendingUp,
  Target,
  Sparkles,
  Plane,
  PartyPopper,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TripStatsCardsProps {
  stats: {
    isLoading: boolean;
    tripStatus: "upcoming" | "ongoing" | "completed";
    daysUntilStart: number;
    daysUntilEnd: number;
    tripDuration: number;
    checklistProgress: number;
    checklistCompleted: number;
    checklistTotal: number;
    totalExpenses: number;
    expensesByCategory: Record<string, number>;
    currency: string;
  };
}

const categoryLabels: Record<string, string> = {
  food: "Cibo & Ristoranti",
  transport: "Trasporti",
  accommodation: "Alloggi",
  activities: "Attività",
  shopping: "Shopping",
  other: "Altro",
};

const categoryColors: Record<string, { bg: string; fill: string; text: string }> = {
  food: { bg: "bg-rose-500/10", fill: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  transport: { bg: "bg-sky-500/10", fill: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  accommodation: { bg: "bg-amber-500/10", fill: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  activities: { bg: "bg-primary/10", fill: "bg-primary", text: "text-primary" },
  shopping: { bg: "bg-emerald-500/10", fill: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  other: { bg: "bg-slate-500/10", fill: "bg-slate-500", text: "text-slate-600 dark:text-slate-400" },
};

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }
    
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      setCount(Math.round(end * eased));
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    
    requestAnimationFrame(tick);
  }, [end, duration]);
  
  return count;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 150,
      damping: 20,
    },
  },
} as const;

export function TripStatsCards({ stats }: TripStatsCardsProps) {
  const animatedProgress = useAnimatedCounter(stats.checklistProgress, 1200);
  const animatedExpenses = useAnimatedCounter(stats.totalExpenses, 1500);

  if (stats.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl md:rounded-3xl bg-muted/30 animate-pulse",
              i === 2 ? "md:col-span-2 h-48" : "h-44"
            )}
            style={{ animationDelay: `${i * 150}ms` }}
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

  const getCountdownInfo = () => {
    if (stats.tripStatus === "completed") {
      return {
        label: "Completato",
        value: "✓",
        sublabel: "Che bel viaggio!",
        icon: PartyPopper,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
        glow: "shadow-emerald-500/15",
        iconGradient: "from-emerald-500 to-teal-600",
      };
    }
    if (stats.tripStatus === "ongoing") {
      return {
        label: "In Corso",
        value: stats.daysUntilEnd.toString(),
        sublabel: stats.daysUntilEnd === 1 ? "giorno rimasto" : "giorni rimasti",
        icon: Plane,
        color: "text-sky-500",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        gradient: "from-sky-500/20 via-sky-500/5 to-transparent",
        glow: "shadow-sky-500/15",
        iconGradient: "from-sky-500 to-blue-600",
      };
    }
    if (stats.daysUntilStart === 0) {
      return {
        label: "Si Parte!",
        value: "Oggi",
        sublabel: "Buon viaggio!",
        icon: Sparkles,
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
        gradient: "from-primary/20 via-primary/5 to-transparent",
        glow: "shadow-primary/15",
        iconGradient: "from-primary to-primary/70",
      };
    }
    if (stats.daysUntilStart === 1) {
      return {
        label: "Countdown",
        value: "1",
        sublabel: "giorno alla partenza",
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
        glow: "shadow-amber-500/15",
        iconGradient: "from-amber-500 to-orange-600",
      };
    }
    return {
      label: "Countdown",
      value: stats.daysUntilStart.toString(),
      sublabel: "giorni alla partenza",
      icon: Timer,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      gradient: "from-primary/20 via-primary/5 to-transparent",
      glow: "shadow-primary/15",
      iconGradient: "from-primary to-violet-600",
    };
  };

  const countdown = getCountdownInfo();
  const CountdownIcon = countdown.icon;
  const hasExpenses = Object.keys(stats.expensesByCategory).length > 0;
  
  // Calculate progress ring for checklist
  const progressRingRadius = 40;
  const progressRingCircumference = 2 * Math.PI * progressRingRadius;
  const progressRingOffset = progressRingCircumference - (stats.checklistProgress / 100) * progressRingCircumference;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 md:space-y-6"
    >
      {/* Top Row: Countdown & Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Countdown Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={cn(
            "relative overflow-hidden rounded-2xl md:rounded-3xl border-2 p-5 md:p-6",
            "bg-white/80 dark:bg-card/80 backdrop-blur-xl",
            countdown.border,
            "min-h-[180px] md:min-h-[200px] flex flex-col",
            "hover:shadow-xl transition-all duration-300",
            countdown.glow
          )}
        >
          {/* Background Gradient */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", countdown.gradient)} />
          
          {/* Decorative Background Icon */}
          <div className="absolute -right-4 -bottom-4 opacity-[0.07]">
            <CountdownIcon className="w-32 h-32 md:w-40 md:h-40" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  {countdown.label}
                </p>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="flex items-baseline gap-2"
                >
                  <span className={cn("text-5xl md:text-6xl lg:text-7xl font-black tracking-tight", countdown.color)}>
                    {countdown.value}
                  </span>
                </motion.div>
              </div>
              
              <div className={cn(
                "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br shadow-lg",
                countdown.iconGradient
              )}>
                <CountdownIcon className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-auto flex items-center justify-between">
              <p className="text-sm md:text-base text-muted-foreground font-medium">
                {countdown.sublabel}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-semibold">{stats.tripDuration} giorni</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Checklist Progress Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={cn(
            "relative overflow-hidden rounded-2xl md:rounded-3xl border-2 p-5 md:p-6",
            "bg-white/80 dark:bg-card/80 backdrop-blur-xl border-violet-500/20",
            "min-h-[180px] md:min-h-[200px] flex flex-col",
            "hover:shadow-xl hover:shadow-violet-500/15 transition-all duration-300"
          )}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-transparent opacity-60" />
          
          {/* Decorative Icon */}
          <div className="absolute -right-4 -bottom-4 opacity-[0.07]">
            <Target className="w-32 h-32 md:w-40 md:h-40" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Checklist
                </p>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-violet-500"
                  >
                    {animatedProgress}
                  </motion.span>
                  <span className="text-2xl font-bold text-violet-400">%</span>
                </div>
              </div>
              
              {/* Circular Progress */}
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={progressRingRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-violet-500/10"
                  />
                  {/* Progress Circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r={progressRingRadius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: progressRingCircumference }}
                    animate={{ strokeDashoffset: progressRingOffset }}
                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                    style={{
                      strokeDasharray: progressRingCircumference,
                    }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-violet-500" />
                </div>
              </div>
            </div>

            {/* Progress Bar & Count */}
            <div className="mt-auto space-y-3">
              <div className="h-2 md:h-2.5 bg-violet-100 dark:bg-violet-950/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.checklistProgress}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                <span className="text-violet-600 dark:text-violet-400 font-bold">{stats.checklistCompleted}</span>
                {" "}/{" "}{stats.checklistTotal} elementi completati
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expenses Card */}
      {hasExpenses && (
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={cn(
            "relative overflow-hidden rounded-2xl md:rounded-3xl border-2 p-5 md:p-7",
            "bg-white/80 dark:bg-card/80 backdrop-blur-xl border-amber-500/20",
            "hover:shadow-xl hover:shadow-amber-500/15 transition-all duration-300"
          )}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/5" />
          
          {/* Decorative Icon */}
          <div className="absolute -right-6 -top-6 opacity-[0.06]">
            <Wallet className="w-36 h-36 md:w-44 md:h-44" />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
                  <Wallet className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Spese Totali
                  </p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground"
                  >
                    {formatCurrency(animatedExpenses)}
                  </motion.p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-600">
                  {Object.keys(stats.expensesByCategory).length} categorie
                </span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stats.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([category, amount], index) => {
                  const percentage = stats.totalExpenses > 0 
                    ? Math.round((amount / stats.totalExpenses) * 100) 
                    : 0;
                  const colors = categoryColors[category] || categoryColors.other;

                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.08 }}
                      className={cn(
                        "p-4 rounded-xl border transition-all duration-300",
                        "hover:shadow-md",
                        colors.bg,
                        "border-transparent hover:border-current/10"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={cn("text-sm font-bold", colors.text)}>
                          {categoryLabels[category] || category}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
                          {percentage}%
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.6 + index * 0.08, ease: "easeOut" }}
                            className={cn("h-full rounded-full", colors.fill)}
                          />
                        </div>
                        <p className="text-base md:text-lg font-bold text-foreground">
                          {formatCurrency(amount)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
