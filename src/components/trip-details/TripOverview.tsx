import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTripStats } from "@/hooks/useTripStats";
import { cn } from "@/lib/utils";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { TripMembersList } from "@/components/trips/TripMembersList";

interface TripOverviewProps {
  trip: any;
}

export function TripOverview({ trip }: TripOverviewProps) {
  const stats = useTripStats(trip.id);

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

  const getCountdownText = () => {
    if (stats.tripStatus === "completed") return { value: "Finito", label: "Viaggio completato", color: "text-muted-foreground" };
    if (stats.tripStatus === "ongoing") return { value: stats.daysUntilEnd, label: "Giorni rimanenti", color: "text-emerald-500" };
    if (stats.daysUntilStart <= 0) return { value: "Oggi", label: "Si parte!", color: "text-primary" };
    return { value: stats.daysUntilStart, label: "Giorni alla partenza", color: "text-primary" };
  };

  const countdown = getCountdownText();
  const budgetProgress = stats.budget > 0 ? (stats.totalExpenses / stats.budget) * 100 : 0;
  const isOverBudget = budgetProgress > 100;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {/* 1. WEATHER WIDGET (Spans 1 col on LG) */}
      <motion.div variants={item} className="col-span-1 md:col-span-1">
        <WeatherWidget 
          lat={trip.latitude} 
          lon={trip.longitude} 
          locationName={trip.destination} 
        />
      </motion.div>

      {/* 2. COUNTDOWN & STATUS (Spans 1 col) */}
      <motion.div variants={item} className="space-y-6">
        <Card className="p-6 relative overflow-hidden h-full flex flex-col justify-between group hover:shadow-lg transition-all border-l-4 border-l-primary/50">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-24 h-24" />
           </div>
           <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Tempo</p>
              <div className="flex items-baseline gap-1">
                 <span className={cn("text-5xl font-bold tracking-tighter", countdown.color)}>
                    {countdown.value}
                 </span>
              </div>
              <p className="text-muted-foreground font-medium mt-1">{countdown.label}</p>
           </div>
           
           <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                 <Calendar className="w-4 h-4" />
                 {stats.tripDuration} giorni
              </span>
              <Badge variant="secondary" className={cn(
                stats.tripStatus === 'ongoing' ? "bg-emerald-500/10 text-emerald-600" : ""
              )}>
                {stats.tripStatus === 'planning' ? 'Planning' : 
                 stats.tripStatus === 'ongoing' ? 'In Corso' : 'Completato'}
              </Badge>
           </div>
        </Card>
      </motion.div>

      {/* 3. BUDGET CARD (Spans 1 col) */}
      <motion.div variants={item}>
        <Card className="p-6 h-full flex flex-col justify-between hover:shadow-lg transition-all border-l-4 border-l-amber-500/50">
           <div>
              <div className="flex justify-between items-start mb-2">
                 <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Budget</p>
                 <Link to={`/expenses?trip=${trip.id}`} className="text-muted-foreground hover:text-primary transition-colors">
                    <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
              <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-bold text-foreground">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: stats.currency, maximumFractionDigits: 0 }).format(stats.totalExpenses)}
                 </span>
                 <span className="text-sm text-muted-foreground">
                    / {new Intl.NumberFormat('it-IT', { style: 'currency', currency: stats.currency, maximumFractionDigits: 0 }).format(stats.budget || 0)}
                 </span>
              </div>
           </div>

           <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs font-medium">
                 <span className={isOverBudget ? "text-red-500" : "text-emerald-500"}>
                    {Math.round(budgetProgress)}% speso
                 </span>
                 {isOverBudget && <span className="flex items-center text-red-500"><AlertCircle className="w-3 h-3 mr-1"/> Sforato</span>}
              </div>
              <Progress 
                value={Math.min(budgetProgress, 100)} 
                className={cn("h-2", isOverBudget ? "bg-red-100 [&>div]:bg-red-500" : "bg-emerald-100 [&>div]:bg-emerald-500")} 
              />
           </div>
           
           <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <TrendingUp className="w-4 h-4" />
                 <span>{stats.expensesCount} transazioni</span>
              </div>
           </div>
        </Card>
      </motion.div>

      {/* 4. CHECKLIST MINI (Spans 1 col) */}
      <motion.div variants={item}>
         <Link to={`/checklist?trip=${trip.id}`}>
            <Card className="p-6 h-full flex flex-col justify-between hover:shadow-lg transition-all border-l-4 border-l-indigo-500/50 cursor-pointer group">
               <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Checklist</p>
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-3xl font-bold text-foreground group-hover:text-indigo-500 transition-colors">{stats.checklistCompleted}/{stats.checklistTotal}</span>
                     <div className="p-2 bg-indigo-50 rounded-full text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                     </div>
                  </div>
               </div>
               <div className="space-y-2">
                  <Progress value={stats.checklistProgress} className="h-1.5 bg-indigo-100 [&>div]:bg-indigo-500" />
                  <p className="text-xs text-muted-foreground text-right">{stats.checklistProgress}% completato</p>
               </div>
            </Card>
         </Link>
      </motion.div>

      {/* ROW 2 - MAP & MEMBERS */}
      
      {/* MEMBERS (Col 1) */}
      <motion.div variants={item} className="col-span-1 md:col-span-1">
         <Card className="h-full flex flex-col overflow-hidden border-t-4 border-t-blue-500/50">
            <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
               <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Travelers
               </h3>
               <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link to={`/settings?trip=${trip.id}`}>Gestisci</Link>
               </Button>
            </div>
            <div className="p-4 flex-1">
               <TripMembersList tripId={trip.id} />
            </div>
         </Card>
      </motion.div>

      {/* NOTES / DESCRIPTION (Col 2 & 3) */}
      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-3">
         <Card className="h-full p-6 flex flex-col justify-start hover:shadow-sm transition-shadow border-t-4 border-t-purple-500/50">
            <h3 className="font-semibold flex items-center gap-2 mb-4 text-primary">
               <MapPin className="w-4 h-4" />
               Diario di bordo
            </h3>
            {trip.description ? (
               <p className="text-muted-foreground italic leading-relaxed text-lg">
                  "{trip.description}"
               </p>
            ) : (
               <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                  <p>Nessuna descrizione per questo viaggio.</p>
                  <Button variant="link" size="sm" onClick={() => document.getElementById('settings-trigger')?.click()}>
                     Aggiungi descrizione
                  </Button>
               </div>
            )}
            
            {/* Embed the Map Dashboard here if needed, or keep it separate. 
                For now, we'll leverage the existing TripDashboard for the map visualization if it has one, 
                but since TripDashboard duplicates some stats, let's just stick to the description for this box 
                or maybe add the map here later. 
            */}
         </Card>
      </motion.div>

    </motion.div>
  );
}