import { format, isSameDay, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Building2, MapPin, Clock, Paperclip, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Accommodation } from "@/hooks/useAccommodations";

interface AccommodationItemProps {
  accommodation: Accommodation;
  currentDate: Date;
}

export function AccommodationItem({ accommodation, currentDate }: AccommodationItemProps) {
  const checkInDate = parseISO(accommodation.check_in);
  const checkOutDate = parseISO(accommodation.check_out);
  
  const isCheckIn = isSameDay(currentDate, checkInDate);
  const isCheckOut = isSameDay(currentDate, checkOutDate);

  return (
    <div className="flex gap-3 p-3 bg-card/80 rounded-2xl border border-border/60 hover:bg-card transition-all">
      <div className="p-2 rounded-xl bg-amber-100 h-fit">
        <Building2 className="h-4 w-4 text-amber-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{accommodation.name}</h4>
          {isCheckIn && (
            <span className="app-pill bg-emerald-100 text-emerald-700">
              <LogIn className="h-3 w-3" />
              Check-in
            </span>
          )}
          {isCheckOut && (
            <span className="app-pill bg-rose-100 text-rose-700">
              <LogOut className="h-3 w-3" />
              Check-out
            </span>
          )}
        </div>

        {accommodation.address && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{accommodation.address}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {isCheckIn && accommodation.check_in_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Check-in: {accommodation.check_in_time}
            </span>
          )}
          {isCheckOut && accommodation.check_out_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Check-out: {accommodation.check_out_time}
            </span>
          )}
          {!isCheckIn && !isCheckOut && (
            <span className="text-amber-600">
              {format(checkInDate, "dd MMM", { locale: it })} - {format(checkOutDate, "dd MMM", { locale: it })}
            </span>
          )}
        </div>

        {accommodation.document_url && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 mt-1 text-xs"
            onClick={() => window.open(accommodation.document_url!, '_blank')}
          >
            <Paperclip className="h-3 w-3 mr-1" />
            Conferma
          </Button>
        )}
      </div>

      {accommodation.price && (
        <div className="app-pill bg-amber-100 text-amber-700 font-semibold">
          €{accommodation.price.toFixed(0)}
        </div>
      )}
    </div>
  );
}
