import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { Building2, MapPin, Calendar, Clock, ExternalLink, Trash2, Hash, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { Accommodation, UpdateAccommodationData } from "@/hooks/useAccommodations";
import { EditAccommodationDialog } from "@/components/accommodations/EditAccommodationDialog";

interface AccommodationCardProps {
  accommodation: Accommodation;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (data: UpdateAccommodationData) => Promise<boolean>;
}

export function AccommodationCard({ accommodation, onDelete, onUpdate }: AccommodationCardProps) {
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
    <Card className="app-surface overflow-hidden transition-all hover:border-primary/20 hover:shadow-sm group">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                  {accommodation.name}
                </h3>
                {accommodation.address && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{accommodation.address}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {accommodation.price && (
                  <div className="rounded-lg bg-muted px-2.5 py-1 text-sm font-semibold text-foreground">
                    €{accommodation.price.toFixed(2)}
                  </div>
                )}
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  {accommodation.booking_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={accommodation.booking_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {isCreator && (
                    <>
                      <EditAccommodationDialog accommodation={accommodation} onUpdate={onUpdate} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {format(checkInDate, "dd MMM", { locale: it })} -{" "}
                  {format(checkOutDate, "dd MMM", { locale: it })}
                </span>
              </div>
              <Badge variant="secondary">{nights} {nights === 1 ? "notte" : "notti"}</Badge>
              {accommodation.check_in_time && (
                <div className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Check-in {accommodation.check_in_time}</span>
                </div>
              )}
              {accommodation.check_out_time && (
                <div className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Check-out {accommodation.check_out_time}</span>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {accommodation.booking_reference && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="truncate">Ref: {accommodation.booking_reference}</span>
                </div>
              )}

              {accommodation.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => window.open(accommodation.document_url!, "_blank")}
                >
                  <Paperclip className="h-3.5 w-3.5 mr-2" />
                  Documento prenotazione
                </Button>
              )}
            </div>

            {accommodation.notes && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {accommodation.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
