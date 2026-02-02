import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { Building2, MapPin, Calendar, Clock, ExternalLink, Trash2, Ticket, Paperclip, Moon, BedDouble } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Accommodation, UpdateAccommodationData } from "@/hooks/useAccommodations";
import { EditAccommodationDialog } from "@/components/accommodations/EditAccommodationDialog";

interface AccommodationCardProps {
  accommodation: Accommodation;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (data: UpdateAccommodationData) => Promise<boolean>;
}

export function AccommodationCard({ accommodation, onDelete, onUpdate }: AccommodationCardProps) {
  const checkInDate = new Date(accommodation.check_in);
  const checkOutDate = new Date(accommodation.check_out);
  const nights = differenceInDays(checkOutDate, checkInDate);

  const handleDelete = async () => {
    if (window.confirm("Sei sicuro di voler eliminare questo alloggio?")) {
      await onDelete(accommodation.id);
    }
  };

  return (
    <Card className="group app-surface overflow-hidden transition-all hover:border-primary/20 hover:shadow-md border-border/50">
      {/* Header: Name, Address, Price, Actions */}
      <CardHeader className="flex flex-row items-start justify-between p-4 pb-2 space-y-0">
        <div className="flex items-start gap-3 overflow-hidden">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate leading-tight">
              {accommodation.name}
            </h3>
            {accommodation.address && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 truncate">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{accommodation.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pl-2">
          {accommodation.price && (
            <div className="hidden sm:block font-semibold text-sm bg-muted/50 px-2 py-1 rounded-md whitespace-nowrap">
              €{accommodation.price.toFixed(2)}
            </div>
          )}
          <div className="flex items-center gap-1">
             {accommodation.booking_url && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                  <a href={accommodation.booking_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            <EditAccommodationDialog accommodation={accommodation} onUpdate={onUpdate} />
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
         {/* Mobile Price */}
         {accommodation.price && (
           <div className="sm:hidden mb-4 font-semibold text-sm bg-muted/50 px-2 py-1 rounded-md inline-block">
             €{accommodation.price.toFixed(2)}
           </div>
         )}

        {/* Stay Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
            {/* Check-in Section */}
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 rounded-l-lg"></div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-in</span>
                    {accommodation.check_in_time && (
                        <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal flex gap-1 items-center border-border/60 bg-background/50">
                            <Clock className="h-3 w-3" />
                            {accommodation.check_in_time}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-base">
                        {format(checkInDate, "dd MMM yyyy", { locale: it })}
                    </span>
                </div>
            </div>

            {/* Check-out Section */}
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-muted-foreground/40 rounded-l-lg"></div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-out</span>
                    {accommodation.check_out_time && (
                        <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal flex gap-1 items-center border-border/60 bg-background/50">
                            <Clock className="h-3 w-3" />
                            {accommodation.check_out_time}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-base">
                        {format(checkOutDate, "dd MMM yyyy", { locale: it })}
                    </span>
                </div>
            </div>
        </div>

        {/* Meta Info Row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 pl-1">
             <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-full">
                <Moon className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">{nights} {nights === 1 ? "notte" : "notti"}</span>
             </div>
             
             {accommodation.booking_reference && (
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="w-px h-4 bg-border mx-1"></div>
                    <Ticket className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate font-mono text-xs">{accommodation.booking_reference}</span>
                </div>
             )}
        </div>

        {/* Footer: Documents & Notes */}
        {(accommodation.document_url || accommodation.notes) && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-3 border-t border-dashed border-border/60">
             {accommodation.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-transparent border-dashed hover:bg-muted/50 w-full sm:w-auto justify-start shrink-0"
                  onClick={() => window.open(accommodation.document_url!, "_blank")}
                >
                  <Paperclip className="h-3.5 w-3.5 mr-2 text-primary" />
                  Voucher / Prenotazione
                </Button>
              )}
              {accommodation.notes && (
                <p className="text-xs text-muted-foreground italic flex items-center leading-relaxed line-clamp-2">
                   {accommodation.notes}
                </p>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
