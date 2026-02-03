import { motion } from "framer-motion";
import { format, differenceInDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Link } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Wallet,
  Users,
  ChevronRight,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTripStats } from "@/hooks/useTripStats";
import { TripMembersList } from "@/components/trips/TripMembersList"; 
import { cn } from "@/lib/utils";

interface TripOverviewProps {
  trip: any; // Using any for flexibility during refactor, strictly typed in production
}

export function TripOverview({ trip }: TripOverviewProps) {
  const stats = useTripStats(trip.id);

  // Calculate quick stats
  const budgetUsedPercent = stats.totalBudget > 0 
    ? Math.min(Math.round((stats.totalExpenses / stats.totalBudget) * 100), 100) 
    : 0;
  
  const daysUntilStart = differenceInDays(parseISO(trip.start_date), new Date());
  
  // Widget Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {/* 1. STATUS / COUNTDOWN (Large: col-span-2) */}
      <motion.div variants={item} className="col-span-1 md:col-span-2 relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-primary/10 via-card to-card border border-border/60 shadow-sm group hover:shadow-md transition-all">
         <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">Stato Viaggio</h3>
                  <div className="text-3xl lg:text-4xl font-bold tracking-tight mt-2">
                     {daysUntilStart > 0 
                       ? <span>Mancano <span className="text-primary">{daysUntilStart}</span> giorni</span> 
                       : daysUntilStart === 0 
                         ? "Si parte oggi!" 
                         : "In corso..."}
                  </div>
               </div>
               <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Clock className="w-6 h-6" />
               </div>
            </div>
            
            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border">
                  <CalendarIcon className="w-4 h-4" />
                  {format(parseISO(trip.start_date), "d MMM", { locale: it })}
               </div>
               <ArrowRight className="w-4 h-4 opacity-50" />
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border">
                  <CalendarIcon className="w-4 h-4" />
                  {format(parseISO(trip.end_date), "d MMM", { locale: it })}
               </div>
            </div>
         </div>
         {/* Decorative Blur */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      {/* 2. BUDGET (Medium) */}
      <motion.div variants={item} className="col-span-1 rounded-3xl p-6 bg-card border border-border/60 shadow-sm hover:border-amber-500/30 transition-colors group">
         <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
               <Wallet className="w-5 h-5" />
            </div>
            <Link to={`/expenses?trip=${trip.id}`} className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
               Dettagli <ChevronRight className="w-3 h-3" />
            </Link>
         </div>
         <div className="space-y-1">
            <div className="text-2xl font-bold">
               {new Intl.NumberFormat('it-IT', { style: 'currency', currency: stats.currency || 'EUR', maximumFractionDigits: 0 }).format(stats.totalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Spesi finora</div>
         </div>
         <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
               <span>Budget utilizzato</span>
               <span className="font-bold">{budgetUsedPercent}%</span>
            </div>
            <Progress value={budgetUsedPercent} className="h-2 bg-muted" indicatorClassName={cn(budgetUsedPercent > 90 ? "bg-red-500" : "bg-amber-500")} />
         </div>
      </motion.div>

      {/* 3. CHECKLIST (Medium) */}
      <motion.div variants={item} className="col-span-1 rounded-3xl p-6 bg-card border border-border/60 shadow-sm hover:border-indigo-500/30 transition-colors group">
         <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
               <CheckCircle2 className="w-5 h-5" />
            </div>
            <Link to={`/checklist?trip=${trip.id}`} className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
               Vedi tutti <ChevronRight className="w-3 h-3" />
            </Link>
         </div>
         <div className="space-y-1">
            <div className="text-2xl font-bold">
               {stats.checklistCompleted} <span className="text-muted-foreground text-lg">/ {stats.checklistTotal}</span>
            </div>
            <div className="text-xs text-muted-foreground font-medium">Attività completate</div>
         </div>
         <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
               <span>Progresso</span>
               <span className="font-bold">{stats.checklistProgress}%</span>
            </div>
            <Progress value={stats.checklistProgress} className="h-2 bg-muted" indicatorClassName="bg-indigo-500" />
         </div>
      </motion.div>

      {/* 4. COMPANIONS (Wide, auto-height) */}
      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col">
          {/* <div className="p-6 border-b border-border/50 bg-muted/20">
             <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Compagni
             </h3>
          </div> */}
          {/* Reverting to standard layout inside */}
          <div className="p-1">
             <TripMembersList tripId={trip.id} />
          </div>
      </motion.div>
      
      {/* 5. DESCRIPTION / NOTES (Full width if text exists) */}
      {trip.description && (
        <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl p-8 bg-muted/30 border border-dashed border-border flex flex-col md:flex-row gap-6 items-start">
           <div className="p-3 bg-background rounded-full border shadow-sm shrink-0">
              <ClipboardList className="w-6 h-6 text-muted-foreground" />
           </div>
           <div>
              <h4 className="font-semibold text-lg mb-2">Note di Viaggio</h4>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {trip.description}
              </p>
           </div>
        </motion.div>
      )}

    </motion.div>
  );
}