
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Building2, Plane, Train, Bus, Car, Ship, MoreHorizontal, ArrowRight, Calendar, MapPin, Wallet, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Types (Simplified) ---
interface BaseCardProps {
  onClick?: () => void;
  className?: string;
}

// --- Accommodation Card ---
export function ChatAccommodationCard({ data, onClick, className }: { data: any } & BaseCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer shadow-sm w-full max-w-full overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm truncate">{data.name}</span>
        </div>
        {data.price && (
          <span className="font-semibold text-sm shrink-0">€{data.price}</span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {format(new Date(data.check_in), "d MMM")} - {format(new Date(data.check_out), "d MMM")}
          </span>
        </div>
        {data.address && (
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{data.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Transport Card ---
const TRANSPORT_ICONS: Record<string, any> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  ferry: Ship,
  other: MoreHorizontal,
};

export function ChatTransportCard({ data, onClick, className }: { data: any } & BaseCardProps) {
  const Icon = TRANSPORT_ICONS[data.transport_type] || MoreHorizontal;
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer shadow-sm w-full max-w-full overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 text-sm font-medium truncate min-w-0">
            <span className="truncate">{data.departure_location}</span>
            <ArrowRight className="w-3 h-3 shrink-0 opacity-50" />
            <span className="truncate">{data.arrival_location}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{format(new Date(data.departure_datetime), "d MMM, HH:mm", { locale: it })}</span>
        </div>
        {data.price && (
          <span className="font-semibold text-foreground">€{data.price}</span>
        )}
      </div>
    </div>
  );
}

// --- Expense Card ---
export function ChatExpenseCard({ data, onClick, className }: { data: any } & BaseCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer shadow-sm w-full max-w-full overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Wallet className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-sm truncate">{data.description}</span>
          <span className="text-xs text-muted-foreground truncate">
            {format(new Date(data.expense_date), "d MMM", { locale: it })} • {data.paid_by_profile?.full_name || 'Utente'}
          </span>
        </div>
      </div>
      <span className="font-bold text-sm shrink-0">€{data.amount.toFixed(2)}</span>
    </div>
  );
}

// --- Activity Card ---
export function ChatActivityCard({ data, onClick, className }: { data: any } & BaseCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer shadow-sm w-full max-w-full overflow-hidden",
        className
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium text-sm truncate">{data.title}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
              {data.category}
            </span>
            <span>{format(new Date(data.activity_date), "d MMM", { locale: it })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
