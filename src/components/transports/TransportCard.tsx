import { format, differenceInMinutes } from "date-fns";
import { it } from "date-fns/locale";
import { Plane, Train, Bus, Car, Ship, MoreHorizontal, ArrowRight, Trash2, Hash, Paperclip, Clock, MapPin, Ticket } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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

  // Calculate duration
  const getDuration = () => {
    if (!arrivalDate) return null;
    const diffInMinutes = differenceInMinutes(arrivalDate, departureDate);
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  const duration = getDuration();

  const handleDelete = async () => {
    if (window.confirm("Sei sicuro di voler eliminare questo trasporto?")) {
      await onDelete(transport.id);
    }
  };

  return (
    <Card className="group app-surface overflow-hidden transition-all hover:border-primary/20 hover:shadow-md border-border/50">
      {/* Header: Carrier, Type, Price, Actions */}
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">
                {transport.carrier || TRANSPORT_LABELS[transport.transport_type]}
              </span>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-muted text-muted-foreground">
                {TRANSPORT_LABELS[transport.transport_type]}
              </Badge>
            </div>
            {transport.booking_reference && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                <Ticket className="h-3 w-3" />
                <span className="truncate font-mono">{transport.booking_reference}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {transport.price && (
            <div className="hidden sm:block font-semibold text-sm bg-muted/50 px-2 py-1 rounded-md">
              €{transport.price.toFixed(2)}
            </div>
          )}
          <div className="flex items-center gap-1">
             <EditTransportDialog transport={transport} onUpdate={onUpdate} />
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {/* Mobile Price (visible only on small screens) */}
        {transport.price && (
           <div className="sm:hidden mb-4 font-semibold text-sm bg-muted/50 px-2 py-1 rounded-md inline-block">
             €{transport.price.toFixed(2)}
           </div>
         )}

        {/* Timeline View */}
        <div className="flex items-start justify-between gap-4 py-4 relative">
          {/* Departure */}
          <div className="flex flex-col min-w-[30%]">
             <span className="text-2xl font-bold text-foreground">
               {format(departureDate, "HH:mm")}
             </span>
             <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
               {format(departureDate, "d MMM", { locale: it })}
             </span>
             <div className="flex items-center gap-1 mt-1 text-sm text-foreground/80 font-medium">
               <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
               <span className="truncate">{transport.departure_location}</span>
             </div>
          </div>

          {/* Center Connector */}
          <div className="flex flex-col items-center justify-center flex-1 mt-2 px-2">
            <div className="flex items-center w-full gap-2 opacity-50">
               <div className="h-[1px] bg-border flex-1" />
               <div className="text-xs text-muted-foreground font-medium whitespace-nowrap flex items-center gap-1">
                  {duration ? (
                    <>
                      <Clock className="h-3 w-3" />
                      {duration}
                    </>
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
               </div>
               <div className="h-[1px] bg-border flex-1" />
            </div>
          </div>

          {/* Arrival */}
          <div className="flex flex-col items-end text-right min-w-[30%]">
             {arrivalDate ? (
               <>
                 <span className="text-2xl font-bold text-foreground">
                   {format(arrivalDate, "HH:mm")}
                 </span>
                 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                   {format(arrivalDate, "d MMM", { locale: it })}
                 </span>
               </>
             ) : (
               <span className="text-muted-foreground text-sm italic py-2">--:--</span>
             )}
             <div className="flex items-center justify-end gap-1 mt-1 text-sm text-foreground/80 font-medium">
               <span className="truncate">{transport.arrival_location}</span>
               <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
             </div>
          </div>
        </div>

        {/* Footer Info */}
        {(transport.document_url || transport.notes) && (
          <div className="flex flex-col sm:flex-row gap-3 mt-2 pt-3 border-t border-dashed border-border/60">
             {transport.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-transparent border-dashed hover:bg-muted/50 w-full sm:w-auto justify-start"
                  onClick={() => window.open(transport.document_url!, "_blank")}
                >
                  <Paperclip className="h-3.5 w-3.5 mr-2 text-primary" />
                  Visualizza Biglietto
                </Button>
              )}
              {transport.notes && (
                <p className="text-xs text-muted-foreground italic flex items-center leading-relaxed">
                   {transport.notes}
                </p>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
