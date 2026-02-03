import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TripStatsCards } from "./TripStatsCards";
import { TripMembersList } from "@/components/trips/TripMembersList";
import { TripDashboard } from "@/components/dashboard/TripDashboard";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Globe,
  FileText,
  Shield,
  Sparkles,
  Navigation,
  Bookmark,
  Compass,
  Star,
  Quote,
} from "lucide-react";

interface TripOverviewProps {
  trip: {
    id: string;
    title: string;
    destination: string;
    description: string | null;
    start_date: string;
    end_date: string;
    status: string;
    is_public_shared: boolean;
    latitude?: number | null;
    longitude?: number | null;
  };
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

const statusConfig = {
  planning: {
    label: "In Pianificazione",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: Clock,
    gradient: "from-amber-500 to-orange-600",
  },
  upcoming: {
    label: "In Arrivo",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    icon: Compass,
    gradient: "from-sky-500 to-blue-600",
  },
  completed: {
    label: "Completato",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: Star,
    gradient: "from-emerald-500 to-teal-600",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 20,
    },
  },
} as const;

export function TripOverview({ trip, stats }: TripOverviewProps) {
  const status = statusConfig[trip.status as keyof typeof statusConfig] || statusConfig.planning;
  const StatusIcon = status.icon;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8"
    >
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column - Stats & Main Content */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Stats Cards */}
          <TripStatsCards stats={stats} />

          {/* Description Card */}
          <AnimatePresence>
            {trip.description && (
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className={cn(
                  "relative overflow-hidden rounded-2xl md:rounded-3xl border-2 p-6 md:p-8",
                  "bg-white/80 dark:bg-card/80 backdrop-blur-xl border-primary/15",
                  "hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                )}
              >
                {/* Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />
                
                {/* Decorative Quote Mark */}
                <div className="absolute -right-4 -top-4 opacity-[0.05]">
                  <Quote className="w-32 h-32 md:w-40 md:h-40" />
                </div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/25">
                      <FileText className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-foreground">
                        Diario di Viaggio
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Note e pensieri sul viaggio
                      </p>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="relative pl-5 md:pl-6 border-l-2 border-primary/20">
                    <span className="absolute -left-1 top-0 text-4xl md:text-5xl text-primary/20 font-serif leading-none">
                      "
                    </span>
                    <p className="text-base md:text-lg text-foreground/80 leading-relaxed italic">
                      {trip.description}
                    </p>
                  </blockquote>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map Section */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className={cn(
              "overflow-hidden rounded-2xl md:rounded-3xl border-2",
              "bg-white/80 dark:bg-card/80 backdrop-blur-xl border-border/50",
              "hover:shadow-xl hover:border-primary/20 transition-all duration-300"
            )}
          >
            {/* Map Header */}
            <div className="p-4 md:p-6 border-b border-border/50 bg-gradient-to-r from-muted/30 via-transparent to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-11 h-11 md:w-13 md:h-13 rounded-xl md:rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                    <Globe className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-foreground">
                      Mappa Interattiva
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Esplora punti di interesse
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600 hidden sm:inline">
                    {trip.destination}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Map Container */}
            <div className="h-[350px] md:h-[450px]">
              <TripDashboard tripId={trip.id} />
            </div>
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-5 md:space-y-6">
          {/* Trip Members Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className={cn(
              "overflow-hidden rounded-2xl md:rounded-3xl border-2",
              "bg-white/80 dark:bg-card/80 backdrop-blur-xl border-border/50",
              "hover:shadow-xl hover:border-violet-500/30 transition-all duration-300"
            )}
          >
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-border/50 bg-gradient-to-r from-violet-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25">
                  <Users className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-foreground">
                    Compagni di Viaggio
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Chi partecipa
                  </p>
                </div>
              </div>
            </div>
            
            {/* Members List */}
            <div className="p-4 md:p-5">
              <TripMembersList tripId={trip.id} />
            </div>
          </motion.div>

          {/* Quick Info Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className={cn(
              "overflow-hidden rounded-2xl md:rounded-3xl border-2 p-5 md:p-6",
              "bg-white/80 dark:bg-card/80 backdrop-blur-xl border-border/50",
              "hover:shadow-xl transition-all duration-300"
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-5 md:mb-6">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <h3 className="text-sm md:text-base font-bold text-foreground">
                Info Rapide
              </h3>
            </div>

            {/* Info Items */}
            <div className="space-y-3.5">
              {/* Status */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">Stato</span>
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-bold border",
                  status.bg, status.color, status.border
                )}>
                  {status.label}
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">Destinazione</span>
                </div>
                <span className="text-xs md:text-sm font-bold text-foreground truncate max-w-[130px]">
                  {trip.destination}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">Durata</span>
                </div>
                <span className="text-xs md:text-sm font-bold text-foreground">
                  {stats.tripDuration} giorni
                </span>
              </div>

              {/* Privacy */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">Visibilità</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    trip.is_public_shared ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  )} />
                  <span className="text-xs md:text-sm font-bold text-foreground">
                    {trip.is_public_shared ? "Pubblico" : "Privato"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tips Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className={cn(
              "overflow-hidden rounded-2xl md:rounded-3xl border-2 p-5 md:p-6",
              "bg-gradient-to-br from-primary/5 via-white/80 dark:via-card/80 to-accent/5",
              "border-primary/15 backdrop-blur-xl",
              "hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
            )}
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/25 shrink-0">
                <Bookmark className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-bold text-foreground mb-1.5 flex items-center gap-2">
                  Consigli Utili
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Usa l'<span className="font-semibold text-emerald-600 dark:text-emerald-400">Itinerario</span> per pianificare attività, 
                  le <span className="font-semibold text-amber-600 dark:text-amber-400">Spese</span> per il budget e la{" "}
                  <span className="font-semibold text-violet-600 dark:text-violet-400">Checklist</span> per non dimenticare nulla!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
