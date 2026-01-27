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
    <div className="flex gap-3 p-3 bg-card/80 rounded-2xl border border-border/60 hover:bg-card transition-all">
      <div className="p-2 rounded-xl bg-sky-100 h-fit">
        <Icon className="h-4 w-4 text-sky-600" />
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
            <span className="text-sky-600">• {transport.carrier}</span>
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
        <div className="app-pill bg-sky-100 text-sky-700 font-semibold">
          €{transport.price.toFixed(0)}
        </div>
      )}
    </div>
  );
}
