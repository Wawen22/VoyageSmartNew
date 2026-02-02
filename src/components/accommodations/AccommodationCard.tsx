import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { Building2, MapPin, Calendar, Clock, ExternalLink, Trash2, Ticket, Paperclip, Moon, BedDouble } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Accommodation, UpdateAccommodationData } from "@/hooks/useAccommodations";
import { EditAccommodationDialog } from "@/components/accommodations/EditAccommodationDialog";
import { cn } from "@/lib/utils";

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
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 border border-border/40",
      "bg-gradient-to-br shadow-sm hover:shadow-md",
      "from-rose-50 to-indigo-50/50 dark:from-rose-950/20 dark:to-indigo-950/10",
      "hover:border-rose-200 dark:hover:border-rose-800"
    )}>
      {/* Background Watermark Icon */}
      <div className="absolute -right-8 -bottom-10 opacity-[0.05] pointer-events-none select-none transform -rotate-12 transition-transform group-hover:scale-110 duration-700">
        <Building2 strokeWidth={1} className="w-56 h-56 text-rose-600 dark:text-rose-400" />
      </div>

      {/* Header: Name, Address, Price, Actions */}
      <CardHeader className="flex flex-row items-start justify-between p-4 pb-2 space-y-0 relative z-10">
        <div className="flex items-start gap-3 overflow-hidden">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm backdrop-blur-sm ring-1 ring-inset ring-black/5 mt-0.5",
            "bg-rose-100/50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
          )}>
            <BedDouble className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-lg text-foreground/90 truncate leading-tight">
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
            <div className="hidden sm:block font-semibold text-sm bg-white/40 dark:bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/20 dark:border-white/5 shadow-sm whitespace-nowrap">
              €{accommodation.price.toFixed(2)}
            </div>
          )}
          <div className="flex items-center gap-0.5">
             {accommodation.booking_url && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-white/40 dark:hover:bg-black/20" asChild>
                  <a href={accommodation.booking_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            <EditAccommodationDialog accommodation={accommodation} onUpdate={onUpdate} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors hover:bg-white/40 dark:hover:bg-black/20"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 relative z-10">
         {/* Mobile Price */}
         {accommodation.price && (
           <div className="sm:hidden mb-4 font-semibold text-sm bg-white/40 dark:bg-black/20 px-2 py-1 rounded-md inline-block">
             €{accommodation.price.toFixed(2)}
           </div>
         )}

        {/* Stay Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
            {/* Check-in Section */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/20 dark:border-white/5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500/50 rounded-l-xl"></div>
                <div className="flex justify-between items-start mb-2 pl-1">
                    <span className="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/70 uppercase tracking-widest">Check-in</span>
                    {accommodation.check_in_time && (
                        <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal flex gap-1 items-center border-rose-200/50 bg-white/50 dark:bg-black/20">
                            <Clock className="h-3 w-3 text-rose-500" />
                            {accommodation.check_in_time}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 pl-1">
                    <Calendar className="h-4 w-4 text-rose-500" />
                    <span className="font-bold text-base text-foreground/90">
                        {format(checkInDate, "dd MMM yyyy", { locale: it })}
                    </span>
                </div>
            </div>

            {/* Check-out Section */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/20 dark:border-white/5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/50 rounded-l-xl"></div>
                <div className="flex justify-between items-start mb-2 pl-1">
                    <span className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest">Check-out</span>
                    {accommodation.check_out_time && (
                        <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal flex gap-1 items-center border-indigo-200/50 bg-white/50 dark:bg-black/20">
                            <Clock className="h-3 w-3 text-indigo-500" />
                            {accommodation.check_out_time}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 pl-1">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span className="font-bold text-base text-foreground/90">
                        {format(checkOutDate, "dd MMM yyyy", { locale: it })}
                    </span>
                </div>
            </div>
        </div>

        {/* Meta Info Row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 pl-1">
             <div className="flex items-center gap-1.5 bg-rose-100/50 dark:bg-rose-900/20 px-3 py-1 rounded-full border border-rose-200/30">
                <Moon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <span className="font-semibold text-rose-700 dark:text-rose-300">{nights} {nights === 1 ? "notte" : "notti"}</span>
             </div>
             
             {accommodation.booking_reference && (
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>
                    <Ticket className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70" />
                    <span className="truncate font-mono text-[11px] tracking-tight">{accommodation.booking_reference}</span>
                </div>
             )}
        </div>

        {/* Footer: Documents & Notes */}
        {(accommodation.document_url || accommodation.notes) && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-dashed border-black/5 dark:border-white/10">
             {accommodation.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-white/40 dark:bg-black/20 border-black/5 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 w-full sm:w-auto justify-start shrink-0 backdrop-blur-sm"
                  onClick={() => window.open(accommodation.document_url!, "_blank")}
                >
                  <Paperclip className="h-3.5 w-3.5 mr-2 text-rose-500" />
                  Voucher / Prenotazione
                </Button>
              )}
              {accommodation.notes && (
                <p className="text-xs text-muted-foreground italic flex items-center leading-relaxed line-clamp-2 pl-1">
                   {accommodation.notes}
                </p>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
