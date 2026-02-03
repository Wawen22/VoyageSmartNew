import { format, differenceInDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { MapPin, Calendar, Clock, ArrowLeft, Pencil, MoreVertical, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareTripDialog } from "@/components/trips/ShareTripDialog";
import { TripHeroWeather } from "@/components/trips/TripHeroWeather";
import { cn } from "@/lib/utils";

interface TripHeroProps {
  trip: any;
  onEdit: () => void;
  onUpdate: () => void;
}

export function TripHero({ trip, onEdit, onUpdate }: TripHeroProps) {
  const tripDuration = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;
  const isOngoing = trip.status === "ongoing";
  const isPast = trip.status === "completed";
  const isPlanning = trip.status === "planning";

  return (
    <div className="relative w-full h-[45vh] min-h-[400px] lg:h-[55vh] overflow-hidden group border-b bg-muted">
      {/* Background Image with Parallax-like scaling */}
      {trip.cover_image ? (
        <div className="absolute inset-0 overflow-hidden">
           <img
             src={trip.cover_image}
             alt={trip.title}
             className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
           />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 animate-gradient-xy" />
      )}
      
      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent bottom-0 h-32" />

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-30 flex justify-between items-start">
        <Button 
          variant="secondary" 
          size="sm" 
          className="backdrop-blur-xl bg-black/20 text-white hover:bg-black/40 border border-white/10 shadow-lg rounded-full px-4" 
          asChild
        >
          <Link to="/trips" className="gap-2 transition-all hover:pl-2 hover:pr-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">I miei viaggi</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
            {/* Weather Widget positioned absolutely on desktop, but here for mobile flow check if needed */}
             <div className="hidden md:block mr-2">
                <TripHeroWeather lat={trip.latitude} lon={trip.longitude} />
             </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
             <ShareTripDialog
                tripId={trip.id}
                tripTitle={trip.title}
                isPublicShared={trip.is_public_shared}
                publicShareToken={trip.public_share_token}
                onUpdate={onUpdate}
                className="backdrop-blur-xl bg-black/20 text-white hover:bg-black/40 border border-white/10 h-9 rounded-full px-4"
             />
             <Button 
                variant="secondary"
                size="sm"
                className="backdrop-blur-xl bg-white text-black hover:bg-white/90 border border-white/20 h-9 rounded-full px-4 font-medium shadow-xl"
                onClick={onEdit}
             >
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Modifica
             </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
             <div className="scale-90 origin-right">
                <TripHeroWeather lat={trip.latitude} lon={trip.longitude} minimal />
             </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="secondary" size="icon" className="backdrop-blur-xl bg-black/20 text-white hover:bg-black/40 border border-white/10 rounded-full h-9 w-9">
                      <MoreVertical className="w-4 h-4" />
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                   <DropdownMenuItem onClick={onEdit} className="rounded-lg">
                      <Pencil className="w-4 h-4 mr-2" /> Modifica Viaggio
                   </DropdownMenuItem>
                   <div className="my-1 h-px bg-border" />
                   <div className="px-2 py-1.5">
                      <ShareTripDialog
                          tripId={trip.id}
                          tripTitle={trip.title}
                          isPublicShared={trip.is_public_shared}
                          publicShareToken={trip.public_share_token}
                          onUpdate={onUpdate}
                          trigger={<div className="flex items-center w-full text-sm cursor-pointer hover:bg-accent rounded-lg py-1"><Share2 className="w-4 h-4 mr-2" /> Condividi</div>}
                      />
                   </div>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 pb-8 md:p-10 md:pb-12 z-20">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-end gap-6 justify-between animate-in slide-in-from-bottom-10 duration-700">
            <div className="space-y-4 max-w-4xl w-full">
              {/* Badges */}
              <div className="flex flex-wrap gap-2.5">
                <Badge 
                  variant={isOngoing ? "default" : "secondary"} 
                  className={cn(
                    "backdrop-blur-md border-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg",
                    isOngoing ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0" : "bg-black/30 text-white hover:bg-black/40"
                  )}
                >
                  {isOngoing ? "In corso" : isPast ? "Completato" : "In programma"}
                </Badge>
                
                <Badge variant="outline" className="text-white border-white/20 backdrop-blur-md bg-white/10 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                   <Clock className="w-3 h-3 mr-1.5" />
                   {tripDuration} {tripDuration === 1 ? 'giorno' : 'giorni'}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[0.9] drop-shadow-2xl">
                {trip.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-white/90 text-sm md:text-lg font-medium pt-2">
                <div className="flex items-center gap-2.5 backdrop-blur-sm bg-black/10 px-3 py-1.5 rounded-lg border border-white/5">
                  <MapPin className="w-5 h-5 text-white/80" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-2.5 backdrop-blur-sm bg-black/10 px-3 py-1.5 rounded-lg border border-white/5">
                  <Calendar className="w-5 h-5 text-white/80" />
                  <span>
                    {format(parseISO(trip.start_date), "d MMM", { locale: it })} - {format(parseISO(trip.end_date), "d MMM yyyy", { locale: it })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}