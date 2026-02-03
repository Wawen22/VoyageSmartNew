import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Building2,
  Plane,
  ClipboardList,
  Lightbulb
} from "lucide-react";
import { useTripStats } from "@/hooks/useTripStats";

interface TripNavBarProps {
  tripId: string;
  className?: string;
}

export function TripNavBar({ tripId }: TripNavBarProps) {
  const location = useLocation();
  const stats = useTripStats(tripId);

  const navItems = [
    {
      to: `/trips/${tripId}`,
      label: "Home",
      icon: LayoutDashboard,
      active: location.pathname === `/trips/${tripId}`,
      color: "text-primary",
      bgColor: "bg-primary/10",
      activeBg: "bg-primary",
      shadow: "shadow-primary/30"
    },
    {
      to: `/itinerary?trip=${tripId}`,
      label: "Itinerario",
      icon: CalendarDays,
      active: location.pathname.includes('/itinerary'),
      count: stats.activitiesCount,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      activeBg: "bg-emerald-500",
      shadow: "shadow-emerald-500/30"
    },
    {
      to: `/expenses?trip=${tripId}`,
      label: "Spese",
      icon: Wallet,
      active: location.pathname.includes('/expenses'),
      count: stats.expensesCount,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      activeBg: "bg-amber-500",
      shadow: "shadow-amber-500/30"
    },
    {
      to: `/accommodations?trip=${tripId}`,
      label: "Alloggi",
      icon: Building2,
      active: location.pathname.includes('/accommodations'),
      count: stats.accommodationsCount,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      activeBg: "bg-blue-500",
      shadow: "shadow-blue-500/30"
    },
    {
      to: `/transports?trip=${tripId}`,
      label: "Trasporti",
      icon: Plane,
      active: location.pathname.includes('/transports'),
      count: stats.transportsCount,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      activeBg: "bg-teal-500",
      shadow: "shadow-teal-500/30"
    },
    {
      to: `/checklist?trip=${tripId}`,
      label: "Checklist",
      icon: ClipboardList,
      active: location.pathname.includes('/checklist'),
      count: stats.checklistTotal,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      activeBg: "bg-indigo-500",
      shadow: "shadow-indigo-500/30"
    },
    {
      to: `/ideas?trip=${tripId}`,
      label: "Idee",
      icon: Lightbulb,
      active: location.pathname.includes('/ideas'),
      count: stats.ideasCount,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      activeBg: "bg-purple-500",
      shadow: "shadow-purple-500/30"
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Premium Glass Background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]" />
      
      {/* Scrollable Content Container */}
      <div className="relative flex items-center overflow-x-auto no-scrollbar px-4 gap-3 h-[5.5rem] pt-2 scroll-smooth">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "group flex flex-col items-center justify-center min-w-[4.5rem] h-full gap-1.5 transition-all duration-300 active:scale-90 shrink-0 select-none",
              item.active ? "opacity-100" : "opacity-60 hover:opacity-100"
            )}
          >
            <div className={cn(
              "relative p-2.5 rounded-2xl transition-all duration-500 ease-out",
              item.active 
                ? `${item.activeBg} text-white shadow-lg ${item.shadow} translate-y-[-2px]` 
                : `${item.bgColor} ${item.color} hover:bg-opacity-80`
            )}>
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", item.active && "scale-110")} />
              
              {/* Badge */}
              {item.count !== undefined && item.count > 0 && (
                <span className={cn(
                  "absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[9px] font-bold rounded-full border-2 border-background/80 backdrop-blur-sm shadow-sm z-10 transition-all",
                  item.active ? "bg-white text-black scale-110" : "bg-red-500 text-white"
                )}>
                  {item.count}
                </span>
              )}
            </div>
            
            <span className={cn(
              "text-[10px] font-semibold tracking-wide transition-all duration-300",
              item.active ? `${item.color} font-bold` : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
        {/* Spacer for right padding scroll */}
        <div className="w-2 shrink-0" />
      </div>

      {/* Scroll Indicators (Fade Gradients) */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white/90 via-white/50 to-transparent dark:from-zinc-950/90 dark:via-zinc-950/50 pointer-events-none pb-safe" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/90 via-white/50 to-transparent dark:from-zinc-950/90 dark:via-zinc-950/50 pointer-events-none pb-safe" />
    </div>
  );
}
