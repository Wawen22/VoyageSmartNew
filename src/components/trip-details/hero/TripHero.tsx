import { Link } from "react-router-dom";
import { format, differenceInDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  MoreHorizontal, 
  Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TripHeroWeather } from "@/components/trips/TripHeroWeather";
import { ExportPDFButton } from "@/components/trips/ExportPDFButton";
import { ExportCalendarButton } from "@/components/trips/ExportCalendarButton";
import { ShareTripDialog } from "@/components/trips/ShareTripDialog";

type TripHeroProps = {
  trip: any; // We can be more specific if we export the type, but 'any' or partial type is fine for now to avoid circular deps if types are not centralized
  onEdit: () => void;
  onUpdate: () => void;
};

export function TripHero({ trip, onEdit, onUpdate }: TripHeroProps) {
  const tripDuration = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;
  
  // Status Logic
  const isCompleted = trip.status === "completed";
  const isOngoing = trip.status === "ongoing" || (new Date() >= parseISO(trip.start_date) && new Date() <= parseISO(trip.end_date));
  const isUpcoming = trip.status === "planning" || trip.status === "upcoming";

  return (
    <div className="relative w-full h-[220px] sm:h-[320px] lg:h-[400px] overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
        {trip.cover_image ? (
          <img 
            src={trip.cover_image} 
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-700" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
      </div>

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 lg:p-8 container mx-auto max-w-7xl z-10">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20 hover:text-white backdrop-blur-md rounded-full px-4 border border-white/10 transition-all duration-300 h-8 sm:h-9" 
            asChild
          >
            <Link to="/trips" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Torna ai viaggi</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3">
             {/* Weather Widget (Desktop) */}
            <div className="hidden md:block">
               <TripHeroWeather lat={trip.latitude} lon={trip.longitude} />
            </div>

            {/* Edit/Settings Button */}
            <Button
              onClick={onEdit}
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 shadow-lg w-8 h-8 sm:w-10 sm:h-10"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* Bottom Info Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2 sm:gap-4 pb-0 sm:pb-1">
          
          {/* Title & Meta */}
          <div className="space-y-1.5 sm:space-y-3 max-w-3xl">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {isOngoing && (
                 <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/20 backdrop-blur-md border border-emerald-400/50 flex items-center gap-1.5">
                   <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white"></span>
                    </span>
                   IN CORSO
                 </span>
              )}
              {isCompleted && (
                 <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/10">
                   COMPLETATO
                 </span>
              )}
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium bg-black/40 text-white/90 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {tripDuration} {tripDuration === 1 ? 'giorno' : 'giorni'}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-sm">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-6 gap-y-1 text-white/80 text-[10px] sm:text-sm font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg backdrop-blur-sm border border-white/5">
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white/70" />
                <span>
                  {format(parseISO(trip.start_date), "d MMM", { locale: it })} - {format(parseISO(trip.end_date), "d MMM yyyy", { locale: it })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg backdrop-blur-sm border border-white/5">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-white/70" />
                <span>{trip.destination}</span>
              </div>
            </div>
          </div>

          {/* Actions Column */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end lg:gap-3">
             
             {/* Desktop Actions */}
             <div className="hidden lg:flex items-center gap-2">
                <ShareTripDialog
                  tripId={trip.id}
                  tripTitle={trip.title}
                  isPublicShared={trip.is_public_shared}
                  publicShareToken={trip.public_share_token}
                  onUpdate={onUpdate}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md"
                />
                <ExportPDFButton 
                  tripId={trip.id} 
                  tripTitle={trip.title} 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md"
                />
                <ExportCalendarButton 
                  tripId={trip.id} 
                  tripTitle={trip.title} 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md"
                />
             </div>

             {/* Mobile Actions (Dropdown) */}
             <div className="lg:hidden flex items-center gap-2 w-full">
                <ShareTripDialog
                    tripId={trip.id}
                    tripTitle={trip.title}
                    isPublicShared={trip.is_public_shared}
                    publicShareToken={trip.public_share_token}
                    onUpdate={onUpdate}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md">
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild className="p-0">
                         <div className="w-full">
                            <ExportPDFButton 
                              tripId={trip.id} 
                              tripTitle={trip.title} 
                              className="w-full justify-start border-0 h-auto py-2.5 px-3 hover:bg-transparent text-foreground"
                              forceShowLabel={true}
                              variant="ghost"
                            />
                         </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="p-0">
                         <div className="w-full">
                            <ExportCalendarButton 
                              tripId={trip.id} 
                              tripTitle={trip.title} 
                              className="w-full justify-start border-0 h-auto py-2.5 px-3 hover:bg-transparent text-foreground"
                              forceShowLabel={true}
                              variant="ghost"
                            />
                         </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
