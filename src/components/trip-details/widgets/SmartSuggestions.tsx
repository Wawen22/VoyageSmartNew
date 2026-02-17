import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  CloudRain, 
  Wallet, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Hotel,
  Plane,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TripStats } from "@/hooks/useTripStats";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Suggestion {
  id: string;
  type: 'info' | 'warning' | 'success' | 'action';
  icon: any;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  color: string;
}

interface SmartSuggestionsProps {
  trip: any;
  stats: TripStats;
}

export function SmartSuggestions({ trip, stats }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const generateSuggestions = () => {
      const newSuggestions: Suggestion[] = [];

      // 1. Budget Suggestions
      if (stats.totalExpenses > 0 && stats.totalBudget > 0) {
        const percent = (stats.totalExpenses / stats.totalBudget) * 100;
        if (percent > 80) {
          newSuggestions.push({
            id: 'budget-warning',
            type: 'warning',
            icon: Wallet,
            title: 'Budget quasi esaurito',
            description: `Hai speso l'${Math.round(percent)}% del budget totale. Occhio alle prossime spese!`,
            actionLabel: 'Vedi Spese',
            actionLink: `/expenses?trip=${trip.id}`,
            color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30'
          });
        }
      }

      // 2. Planning Suggestions
      if (stats.accommodationsCount === 0 && stats.tripStatus !== 'completed') {
        newSuggestions.push({
          id: 'no-accommodation',
          type: 'action',
          icon: Hotel,
          title: 'Dove dormirai?',
          description: 'Non hai ancora aggiunto nessun alloggio per questo viaggio.',
          actionLabel: 'Aggiungi',
          actionLink: `/accommodations?trip=${trip.id}`,
          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
        });
      }

      if (stats.transportsCount === 0 && stats.tripStatus !== 'completed') {
        newSuggestions.push({
          id: 'no-transport',
          type: 'action',
          icon: Plane,
          title: 'Come ti sposterai?',
          description: 'Aggiungi i dettagli dei tuoi voli, treni o noleggi auto.',
          actionLabel: 'Aggiungi',
          actionLink: `/transports?trip=${trip.id}`,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30'
        });
      }

      // 3. Itinerary Gaps
      if (stats.activitiesCount < stats.tripDuration && stats.tripStatus !== 'completed') {
        newSuggestions.push({
          id: 'itinerary-gap',
          type: 'info',
          icon: Calendar,
          title: 'Giorni liberi',
          description: 'Hai alcuni giorni senza attività pianificate. Vuoi dei suggerimenti?',
          actionLabel: 'Esplora Idee',
          actionLink: `/ideas?trip=${trip.id}`,
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
        });
      }

      // 4. Checklist Suggestions
      if (stats.checklistTotal > 0 && stats.checklistProgress < 100) {
        newSuggestions.push({
          id: 'checklist-pending',
          type: 'info',
          icon: CheckCircle2,
          title: 'Checklist incompleta',
          description: `Ti mancano ${stats.checklistTotal - stats.checklistCompleted} elementi da preparare.`,
          actionLabel: 'Apri Lista',
          actionLink: `/checklist?trip=${trip.id}`,
          color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
        });
      }

      // Default suggestion if nothing else
      if (newSuggestions.length === 0) {
        newSuggestions.push({
          id: 'all-good',
          type: 'success',
          icon: Sparkles,
          title: 'Tutto sotto controllo!',
          description: 'Il tuo viaggio è perfettamente organizzato. Buon divertimento!',
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
        });
      }

      setSuggestions(newSuggestions);
    };

    generateSuggestions();
  }, [stats, trip.id]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % suggestions.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
  };

  if (suggestions.length === 0) return null;

  const current = suggestions[currentIndex];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-1 md:col-span-2 lg:col-span-4 mb-2"
    >
      <div className="bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-4 relative overflow-hidden group shadow-sm">
        {/* Progress Dots */}
        {suggestions.length > 1 && (
          <div className="absolute top-4 right-6 flex gap-1 z-10">
            {suggestions.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === currentIndex ? "w-4 bg-primary" : "w-1 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={cn("p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110 duration-500", current.color)}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Smart Suggestion</span>
              {current.type === 'warning' && (
                <span className="bg-orange-500/10 text-orange-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Urgent</span>
              )}
            </div>
            <h4 className="font-bold text-sm text-foreground truncate">{current.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">{current.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {current.actionLink && (
              <Button size="sm" variant="ghost" asChild className="h-8 rounded-xl text-xs font-bold gap-1.5 hover:bg-primary/5 hover:text-primary transition-all">
                <Link to={current.actionLink}>
                  {current.actionLabel}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </Button>
            )}

            {suggestions.length > 1 && (
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={prev} className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" onClick={next} className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Decorative subtle background shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </div>
    </motion.div>
  );
}
