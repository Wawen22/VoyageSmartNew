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
    <div className="flex gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 h-fit">
        <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{accommodation.name}</h4>
          {isCheckIn && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
              <LogIn className="h-3 w-3" />
              Check-in
            </span>
          )}
          {isCheckOut && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">
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
            <span className="text-amber-600 dark:text-amber-400">
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
        <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
          €{accommodation.price.toFixed(0)}
        </div>
      )}
    </div>
  );
}
