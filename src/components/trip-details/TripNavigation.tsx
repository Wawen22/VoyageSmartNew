import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Wallet, 
  Building2, 
  Plane, 
  ClipboardList, 
  Lightbulb, 
  Map as MapIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TripNavigationProps {
  tripId: string;
}

export function TripNavigation({ tripId }: TripNavigationProps) {
  const location = useLocation();

  const navItems = [
    {
      to: `/itinerary?trip=${tripId}`,
      label: "Itinerario",
      icon: Calendar,
      color: "text-emerald-500",
      activeBg: "bg-emerald-500/10",
      activeBorder: "border-emerald-500/20"
    },
    {
      to: `/expenses?trip=${tripId}`,
      label: "Spese",
      icon: Wallet,
      color: "text-amber-500",
      activeBg: "bg-amber-500/10",
      activeBorder: "border-amber-500/20"
    },
    {
      to: `/accommodations?trip=${tripId}`,
      label: "Alloggi",
      icon: Building2,
      color: "text-blue-500",
      activeBg: "bg-blue-500/10",
      activeBorder: "border-blue-500/20"
    },
    {
      to: `/transports?trip=${tripId}`,
      label: "Trasporti",
      icon: Plane,
      color: "text-teal-500",
      activeBg: "bg-teal-500/10",
      activeBorder: "border-teal-500/20"
    },
    {
      to: `/checklist?trip=${tripId}`,
      label: "Checklist",
      icon: ClipboardList,
      color: "text-indigo-500",
      activeBg: "bg-indigo-500/10",
      activeBorder: "border-indigo-500/20"
    },
    {
      to: `/ideas?trip=${tripId}`,
      label: "Idee",
      icon: Lightbulb,
      color: "text-purple-500",
      activeBg: "bg-purple-500/10",
      activeBorder: "border-purple-500/20"
    },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 -mt-4 relative z-30 scrollbar-hide touch-pan-y">
      <div className="flex items-center gap-3 px-4 md:px-8 min-w-max">
         {navItems.map((item) => {
           const isActive = location.pathname.includes(item.to.split('?')[0]);
           return (
             <Link
               key={item.to}
               to={item.to}
               className={cn(
                 "flex items-center gap-2 px-4 py-3 rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group",
                 isActive ? cn(item.activeBg, item.activeBorder, "border-l-4") : "border-border/50 hover:border-border"
               )}
             >
               <div className={cn(
                 "p-2 rounded-full bg-background transition-colors", 
                 isActive ? "bg-white/80 dark:bg-black/20" : "group-hover:bg-accent"
               )}>
                 <item.icon className={cn("w-4 h-4", item.color)} />
               </div>
               <span className="font-semibold text-sm tracking-wide">{item.label}</span>
             </Link>
           );
         })}
      </div>
    </div>
  );
}
