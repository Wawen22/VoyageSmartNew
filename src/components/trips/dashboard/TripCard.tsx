import { Link } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { MapPin, Calendar, Users, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  status: string;
  member_count?: number;
}

interface TripCardProps {
  trip: Trip;
  index?: number;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
  planning: { label: "In Pianificazione", variant: "secondary", className: "bg-blue-100 text-blue-700 hover:bg-blue-100/80" },
  upcoming: { label: "In Arrivo", variant: "default", className: "bg-emerald-500 hover:bg-emerald-600" },
  active: { label: "In Corso", variant: "default", className: "bg-indigo-500 hover:bg-indigo-600 animate-pulse" },
  completed: { label: "Completato", variant: "outline", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const defaultImages = [
  "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600",
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600",
];

export function TripCard({ trip, index = 0 }: TripCardProps) {
  const statusInfo = statusConfig[trip.status] || { label: trip.status, variant: "outline" };
  const imageUrl = trip.cover_image || defaultImages[index % defaultImages.length];

  return (
    <Link to={`/trips/${trip.id}`} className="block group">
      <Card className="overflow-hidden border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
        <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-2 left-2 md:top-3 md:left-3">
             <Badge
               variant={statusInfo.variant}
               className={`${statusInfo.className ?? ""} text-[10px] px-2 py-0.5 md:text-xs md:px-2.5 md:py-1`}
             >
                {statusInfo.label}
             </Badge>
          </div>

          <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-white bg-black/20 hover:bg-black/40 rounded-full">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Modifica</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Elimina</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-3 md:p-5">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <div>
               <h3 className="text-[15px] sm:text-base md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {trip.title}
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] sm:text-xs md:text-sm mt-0.5 md:mt-1">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-primary/70" />
                <span className="line-clamp-1">{trip.destination}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm mt-2.5 md:mt-4 pt-2.5 md:pt-4 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 text-primary/70" />
              <span>
                {format(new Date(trip.start_date), "dd MMM", { locale: it })} - {format(new Date(trip.end_date), "dd MMM yyyy", { locale: it })}
              </span>
            </div>
            {trip.member_count !== undefined && (
              <div className="flex items-center gap-1 text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] md:text-xs font-medium">
                <Users className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                {trip.member_count}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
