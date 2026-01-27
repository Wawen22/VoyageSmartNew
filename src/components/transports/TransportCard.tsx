import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Plane, Train, Bus, Car, Ship, MoreHorizontal, ArrowRight, Trash2, Hash, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { Transport, TransportType } from "@/hooks/useTransports";

interface TransportCardProps {
  transport: Transport;
  onDelete: (id: string) => Promise<boolean>;
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

export function TransportCard({ transport, onDelete }: TransportCardProps) {
  const { user } = useAuth();
  const isCreator = user?.id === transport.created_by;

  const Icon = TRANSPORT_ICONS[transport.transport_type];
  const departureDate = new Date(transport.departure_datetime);
  const arrivalDate = transport.arrival_datetime ? new Date(transport.arrival_datetime) : null;

  const handleDelete = async () => {
    if (window.confirm("Sei sicuro di voler eliminare questo trasporto?")) {
      await onDelete(transport.id);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{TRANSPORT_LABELS[transport.transport_type]}</Badge>
                {transport.carrier && (
                  <span className="text-sm text-muted-foreground">{transport.carrier}</span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 text-lg font-medium">
                <span className="truncate">{transport.departure_location}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{transport.arrival_location}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Partenza:</span>{" "}
                  {format(departureDate, "dd MMM, HH:mm", { locale: it })}
                </div>
                {arrivalDate && (
                  <div>
                    <span className="font-medium text-foreground">Arrivo:</span>{" "}
                    {format(arrivalDate, "dd MMM, HH:mm", { locale: it })}
                  </div>
                )}
              </div>

              {transport.booking_reference && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <Hash className="h-3.5 w-3.5" />
                  <span>Ref: {transport.booking_reference}</span>
                </div>
              )}

              {transport.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open(transport.document_url!, '_blank')}
                >
                  <Paperclip className="h-3.5 w-3.5 mr-1" />
                  Documento
                </Button>
              )}

              {transport.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {transport.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {transport.price && (
              <span className="font-semibold text-lg">
                €{transport.price.toFixed(2)}
              </span>
            )}
            
            {isCreator && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
