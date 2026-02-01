import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Plane, Train, Bus, Car, Ship, MoreHorizontal, ArrowRight, Trash2, Hash, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Transport, TransportType, UpdateTransportData } from "@/hooks/useTransports";
import { EditTransportDialog } from "@/components/transports/EditTransportDialog";

interface TransportCardProps {
  transport: Transport;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (data: UpdateTransportData) => Promise<boolean>;
}

const TRANSPORT_ICONS: Record<TransportType, typeof Plane> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  ferry: Ship,
  other: MoreHorizontal,
};

const TRANSPORT_LABELS: Record<TransportType, string> = {
  flight: 'Volo',
  train: 'Treno',
  bus: 'Bus',
  car: 'Auto',
  ferry: 'Traghetto',
  other: 'Altro',
};

export function TransportCard({ transport, onDelete, onUpdate }: TransportCardProps) {
  const Icon = TRANSPORT_ICONS[transport.transport_type];
  const departureDate = new Date(transport.departure_datetime);
  const arrivalDate = transport.arrival_datetime ? new Date(transport.arrival_datetime) : null;

  const handleDelete = async () => {
    if (window.confirm("Sei sicuro di voler eliminare questo trasporto?")) {
      await onDelete(transport.id);
    }
  };

  return (
    <Card className="app-surface overflow-hidden transition-all hover:border-primary/20 hover:shadow-sm group">
      <CardContent className="p-3 sm:p-5">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-3 md:hidden">
          {/* Header: Icon, Type, Carrier, Actions */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{TRANSPORT_LABELS[transport.transport_type]}</Badge>
                {transport.carrier && (
                  <span className="text-xs text-muted-foreground truncate">{transport.carrier}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <EditTransportDialog transport={transport} onUpdate={onUpdate} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span>{transport.departure_location}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{transport.arrival_location}</span>
          </div>

          {/* Price */}
          {transport.price && (
            <div className="rounded-lg bg-muted px-3 py-1.5 text-sm font-semibold text-foreground self-start">
              €{transport.price.toFixed(2)}
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Partenza:</span>
              <span>{format(departureDate, "dd MMM, HH:mm", { locale: it })}</span>
            </div>
            {arrivalDate && (
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Arrivo:</span>
                <span>{format(arrivalDate, "dd MMM, HH:mm", { locale: it })}</span>
              </div>
            )}
          </div>

          {/* Reference */}
          {transport.booking_reference && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Ref: {transport.booking_reference}</span>
            </div>
          )}

          {/* Document Button */}
          {transport.document_url && (
            <Button
              variant="outline"
              size="sm"
              className="justify-start text-xs h-8"
              onClick={() => window.open(transport.document_url!, "_blank")}
            >
              <Paperclip className="h-3.5 w-3.5 mr-2" />
              Documento viaggio
            </Button>
          )}

          {/* Notes */}
          {transport.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {transport.notes}
            </p>
          )}
        </div>

        {/* Desktop Layout - Original */}
        <div className="hidden md:flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{TRANSPORT_LABELS[transport.transport_type]}</Badge>
                  {transport.carrier && (
                    <span className="text-sm text-muted-foreground truncate">{transport.carrier}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 text-lg font-semibold text-foreground">
                  <span className="truncate">{transport.departure_location}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{transport.arrival_location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {transport.price && (
                  <div className="rounded-lg bg-muted px-2.5 py-1 text-sm font-semibold text-foreground">
                    €{transport.price.toFixed(2)}
                  </div>
                )}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EditTransportDialog transport={transport} onUpdate={onUpdate} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Partenza</span>
                <span>{format(departureDate, "dd MMM, HH:mm", { locale: it })}</span>
              </div>
              {arrivalDate && (
                <div className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Arrivo</span>
                  <span>{format(arrivalDate, "dd MMM, HH:mm", { locale: it })}</span>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {transport.booking_reference && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="truncate">Ref: {transport.booking_reference}</span>
                </div>
              )}

              {transport.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => window.open(transport.document_url!, "_blank")}
                >
                  <Paperclip className="h-3.5 w-3.5 mr-2" />
                  Documento viaggio
                </Button>
              )}
            </div>

            {transport.notes && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {transport.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
