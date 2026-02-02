import { format, differenceInMinutes } from "date-fns";
import { it } from "date-fns/locale";
import { Plane, Train, Bus, Car, Ship, MoreHorizontal, ArrowRight, Trash2, Hash, Paperclip, Clock, MapPin, Ticket, Calendar, Timer } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Transport, TransportType, UpdateTransportData } from "@/hooks/useTransports";
import { EditTransportDialog } from "@/components/transports/EditTransportDialog";
import { cn } from "@/lib/utils";

interface TransportCardProps {
  transport: Transport;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (data: UpdateTransportData) => Promise<boolean>;
}

// Definition of color themes for each transport type
const TRANSPORT_THEMES: Record<TransportType, {
  icon: typeof Plane;
  label: string;
  bgGradient: string;
  borderColor: string;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  accentBarColor: string;
}> = {
  flight: {
    icon: Plane,
    label: 'Volo',
    bgGradient: "from-cyan-50 to-sky-50/50 dark:from-cyan-950/30 dark:to-sky-950/10",
    borderColor: "hover:border-cyan-200 dark:hover:border-cyan-800",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-100/50 dark:bg-cyan-900/20",
    accentColor: "text-cyan-700 dark:text-cyan-300",
    accentBarColor: "bg-cyan-500/50",
  },
  train: {
    icon: Train,
    label: 'Treno',
    bgGradient: "from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/10",
    borderColor: "hover:border-emerald-200 dark:hover:border-emerald-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100/50 dark:bg-emerald-900/20",
    accentColor: "text-emerald-700 dark:text-emerald-300",
    accentBarColor: "bg-emerald-500/50",
  },
  bus: {
    icon: Bus,
    label: 'Bus',
    bgGradient: "from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/10",
    borderColor: "hover:border-amber-200 dark:hover:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100/50 dark:bg-amber-900/20",
    accentColor: "text-amber-700 dark:text-amber-300",
    accentBarColor: "bg-amber-500/50",
  },
  car: {
    icon: Car,
    label: 'Auto',
    bgGradient: "from-violet-50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/10",
    borderColor: "hover:border-violet-200 dark:hover:border-violet-800",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100/50 dark:bg-violet-900/20",
    accentColor: "text-violet-700 dark:text-violet-300",
    accentBarColor: "bg-violet-500/50",
  },
  ferry: {
    icon: Ship,
    label: 'Traghetto',
    bgGradient: "from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/10",
    borderColor: "hover:border-blue-200 dark:hover:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100/50 dark:bg-blue-900/20",
    accentColor: "text-blue-700 dark:text-blue-300",
    accentBarColor: "bg-blue-500/50",
  },
  other: {
    icon: MoreHorizontal,
    label: 'Altro',
    bgGradient: "from-slate-50 to-gray-50/50 dark:from-slate-950/30 dark:to-gray-950/10",
    borderColor: "hover:border-slate-200 dark:hover:border-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-100/50 dark:bg-slate-900/20",
    accentColor: "text-slate-700 dark:text-slate-300",
    accentBarColor: "bg-slate-500/50",
  },
};

export function TransportCard({ transport, onDelete, onUpdate }: TransportCardProps) {
  const theme = TRANSPORT_THEMES[transport.transport_type];
  const Icon = theme.icon;
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
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 border border-border/40",
      "bg-gradient-to-br shadow-sm hover:shadow-md",
      theme.bgGradient,
      theme.borderColor
    )}>
      {/* Background Watermark Icon */}
      <div className="absolute -right-8 -bottom-10 opacity-[0.05] pointer-events-none select-none transform -rotate-12 transition-transform group-hover:scale-110 duration-700">
        <Icon strokeWidth={1} className={cn("w-56 h-56", theme.iconColor)} />
      </div>

      {/* Header: Carrier, Type, Price, Actions */}
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm backdrop-blur-sm ring-1 ring-inset ring-black/5",
            theme.iconBg,
            theme.iconColor
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-lg text-foreground/90 truncate leading-tight">
                {transport.carrier || theme.label}
            </h3>
             <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-white/50 dark:bg-black/20 backdrop-blur-md border-0">
                    {theme.label}
                </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pl-2">
           {transport.price && (
            <div className="hidden sm:block font-semibold text-sm bg-white/40 dark:bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/20 dark:border-white/5 shadow-sm">
              €{transport.price.toFixed(2)}
            </div>
          )}
          <div className="flex items-center gap-0.5">
             <EditTransportDialog transport={transport} onUpdate={onUpdate} />
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
        {/* Mobile Price (visible only on small screens) */}
        {transport.price && (
           <div className="sm:hidden mb-4 font-semibold text-sm bg-white/40 dark:bg-black/20 px-2 py-1 rounded-md inline-block">
             €{transport.price.toFixed(2)}
           </div>
         )}

        {/* Journey Details Grid (Layout similar to AccommodationCard) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
             {/* Departure Block */}
             <div className="bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/20 dark:border-white/5 relative overflow-hidden shadow-sm">
                <div className={cn("absolute top-0 left-0 w-1.5 h-full rounded-l-xl", theme.accentBarColor)}></div>
                
                {/* Block Header: Label + Date */}
                <div className="flex justify-between items-start mb-2 pl-1">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-70", theme.accentColor)}>
                        Partenza
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal flex gap-1 items-center border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20">
                         <Calendar className={cn("h-3 w-3", theme.accentColor)} />
                         {format(departureDate, "dd MMM", { locale: it })}
                    </Badge>
                </div>

                {/* Block Content: Time + Location */}
                <div className="flex flex-col gap-1 pl-1">
                    <span className="text-2xl font-bold text-foreground/90 tabular-nums">
                        {format(departureDate, "HH:mm")}
                    </span>
                    <div className="flex items-start gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <MapPin className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", theme.accentColor)} />
                        <span className="leading-tight break-words">{transport.departure_location}</span>
                    </div>
                </div>
             </div>

             {/* Arrival Block */}
             <div className="bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/20 dark:border-white/5 relative overflow-hidden shadow-sm">
                <div className={cn("absolute top-0 left-0 w-1.5 h-full rounded-l-xl opacity-70", theme.accentBarColor)}></div>
                
                {/* Block Header: Label + Date */}
                <div className="flex justify-between items-start mb-2 pl-1">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-70", theme.accentColor)}>
                        Arrivo
                    </span>
                    {arrivalDate && (
                         <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal flex gap-1 items-center border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20">
                            <Calendar className={cn("h-3 w-3", theme.accentColor)} />
                            {format(arrivalDate, "dd MMM", { locale: it })}
                        </Badge>
                    )}
                </div>

                {/* Block Content: Time + Location */}
                <div className="flex flex-col gap-1 pl-1">
                    {arrivalDate ? (
                         <span className="text-2xl font-bold text-foreground/90 tabular-nums">
                            {format(arrivalDate, "HH:mm")}
                        </span>
                    ) : (
                        <span className="text-xl italic text-muted-foreground py-1">--:--</span>
                    )}
                   
                    <div className="flex items-start gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <MapPin className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", theme.accentColor)} />
                        <span className="leading-tight break-words">{transport.arrival_location}</span>
                    </div>
                </div>
             </div>
        </div>

        {/* Meta Info Row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 pl-1">
             {/* Duration Pill */}
             {duration && (
                <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/5 dark:border-white/5",
                    theme.iconBg
                )}>
                    <Timer className={cn("h-3.5 w-3.5", theme.accentColor)} />
                    <span className={cn("font-semibold text-xs", theme.accentColor)}>{duration}</span>
                </div>
             )}
             
             {/* Reference */}
             {transport.booking_reference && (
                <div className="flex items-center gap-1.5 overflow-hidden">
                    {duration && <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>}
                    <Ticket className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70" />
                    <span className="truncate font-mono text-[11px] tracking-tight">{transport.booking_reference}</span>
                </div>
             )}
        </div>

        {/* Footer: Documents & Notes */}
        {(transport.document_url || transport.notes) && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-dashed border-black/5 dark:border-white/10">
             {transport.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-white/40 dark:bg-black/20 border-black/5 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 w-full sm:w-auto justify-start shrink-0 backdrop-blur-sm"
                  onClick={() => window.open(transport.document_url!, "_blank")}
                >
                  <Paperclip className={cn("h-3.5 w-3.5 mr-2", theme.accentColor)} />
                  Visualizza Biglietto
                </Button>
              )}
              {transport.notes && (
                <p className="text-xs text-muted-foreground italic flex items-center leading-relaxed line-clamp-2 pl-1">
                   {transport.notes}
                </p>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
