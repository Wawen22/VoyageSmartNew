import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { Building2, MapPin, Calendar, Clock, ExternalLink, Trash2, Hash, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { Accommodation } from "@/hooks/useAccommodations";

interface AccommodationCardProps {
  accommodation: Accommodation;
  onDelete: (id: string) => Promise<boolean>;
}

export function AccommodationCard({ accommodation, onDelete }: AccommodationCardProps) {
  const { user } = useAuth();
  const isCreator = user?.id === accommodation.created_by;

  const checkInDate = new Date(accommodation.check_in);
  const checkOutDate = new Date(accommodation.check_out);
  const nights = differenceInDays(checkOutDate, checkInDate);

  const handleDelete = async () => {
    if (window.confirm("Sei sicuro di voler eliminare questo alloggio?")) {
      await onDelete(accommodation.id);
    }
  };

  return (
    <Card className="app-surface overflow-hidden hover:border-primary/20 transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{accommodation.name}</h3>
              
              {accommodation.address && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{accommodation.address}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(checkInDate, "dd MMM", { locale: it })} - {format(checkOutDate, "dd MMM", { locale: it })}
                  </span>
                </div>
                <Badge variant="secondary">{nights} {nights === 1 ? "notte" : "notti"}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                {accommodation.check_in_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Check-in: {accommodation.check_in_time}</span>
                  </div>
                )}
                {accommodation.check_out_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Check-out: {accommodation.check_out_time}</span>
                  </div>
                )}
              </div>

              {accommodation.booking_reference && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <Hash className="h-3.5 w-3.5" />
                  <span>Ref: {accommodation.booking_reference}</span>
                </div>
              )}

              {accommodation.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open(accommodation.document_url!, '_blank')}
                >
                  <Paperclip className="h-3.5 w-3.5 mr-1" />
                  Documento
                </Button>
              )}

              {accommodation.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {accommodation.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {accommodation.price && (
              <span className="font-semibold text-lg">
                €{accommodation.price.toFixed(2)}
              </span>
            )}
            
            <div className="flex items-center gap-1">
              {accommodation.booking_url && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a href={accommodation.booking_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
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
        </div>
      </CardContent>
    </Card>
  );
}
