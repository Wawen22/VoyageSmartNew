import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Plane, Train, Bus, Car, Ship, MoreHorizontal, ArrowRight, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transport, TransportType } from "@/hooks/useTransports";

interface TransportItemProps {
  transport: Transport;
}

const TRANSPORT_ICONS: Record<TransportType, typeof Plane> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  ferry: Ship,
  other: MoreHorizontal,
};

export function TransportItem({ transport }: TransportItemProps) {
  const Icon = TRANSPORT_ICONS[transport.transport_type];
  const departureDate = new Date(transport.departure_datetime);
  const arrivalDate = transport.arrival_datetime ? new Date(transport.arrival_datetime) : null;

  return (
    <div className="flex gap-3 p-3 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-lg border border-sky-200/50 dark:border-sky-800/50">
      <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/50 h-fit">
        <Icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{transport.departure_location}</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{transport.arrival_location}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span>{format(departureDate, "HH:mm", { locale: it })}</span>
          {arrivalDate && (
            <>
              <span>→</span>
              <span>{format(arrivalDate, "HH:mm", { locale: it })}</span>
            </>
          )}
          {transport.carrier && (
            <span className="text-sky-600 dark:text-sky-400">• {transport.carrier}</span>
          )}
        </div>

        {transport.booking_reference && (
          <div className="text-xs text-muted-foreground mt-1">
            Ref: {transport.booking_reference}
          </div>
        )}

        {transport.document_url && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 mt-1 text-xs"
            onClick={() => window.open(transport.document_url!, '_blank')}
          >
            <Paperclip className="h-3 w-3 mr-1" />
            Biglietto
          </Button>
        )}
      </div>

      {transport.price && (
        <div className="text-sm font-medium text-sky-700 dark:text-sky-300">
          €{transport.price.toFixed(0)}
        </div>
      )}
    </div>
  );
}
