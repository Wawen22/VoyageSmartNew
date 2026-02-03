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
import { NextActivityWidget } from "@/components/trip-details/widgets/NextActivityWidget";
import { TripStatusWidget } from "@/components/trip-details/widgets/TripStatusWidget";
import { CurrencyWidget } from "@/components/trip-details/widgets/CurrencyWidget";
import { WorldClocksWidget } from "@/components/trip-details/widgets/WorldClocksWidget";
import { TripMembersList } from "@/components/trips/TripMembersList";
import { cn } from "@/lib/utils";

interface TripOverviewProps {
  trip: any; // Using any for flexibility during refactor, strictly typed in production
}

export function TripOverview({ trip }: TripOverviewProps) {
  const stats = useTripStats(trip.id);
  
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
      {/* 0. NEXT ACTIVITY WIDGET (Prossima Tappa) - 2 Cols */}
      <NextActivityWidget tripId={trip.id} />

      {/* 1. STATUS / COUNTDOWN - 2 Cols */}
      <TripStatusWidget trip={trip} />

      {/* 2. WORLD CLOCKS (Home & Destination) - 2 Cols */}
      <WorldClocksWidget 
        latitude={trip.latitude} 
        longitude={trip.longitude} 
        destinationName={trip.destination} 
      />

      {/* 3. CURRENCY CONVERTER - 2 Cols */}
      <div className="col-span-1 md:col-span-2">
         <CurrencyWidget tripCurrency={stats.currency} userCurrency="EUR" />
      </div>

      {/* 4. COMPANIONS (Wide, auto-height) */}
      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col">
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