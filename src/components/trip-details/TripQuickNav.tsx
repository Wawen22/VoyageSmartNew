
import { ChatButton } from "./chat/ChatButton";
import { 
  Calendar as CalendarIcon, 
  Wallet, 
  Building2, 
  Plane, 
  ClipboardList, 
  Lightbulb 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TripQuickNavProps {
  tripId: string;
  stats: any;
}

export function TripQuickNav({ tripId, stats }: TripQuickNavProps) {
  const navItems = [
    {
      to: `/itinerary?trip=${tripId}`,
      label: "Itinerario",
      icon: CalendarIcon,
      color: "text-emerald-500",
      count: stats.activitiesCount,
      iconBg: "bg-emerald-500/10",
      badgeBg: "from-emerald-400 to-emerald-600",
      glow: "from-emerald-500/15 via-emerald-500/0 to-transparent",
    },
    {
      to: `/expenses?trip=${tripId}`,
      label: "Spese",
      icon: Wallet,
      color: "text-amber-500",
      count: stats.expensesCount,
      iconBg: "bg-amber-500/10",
      badgeBg: "from-amber-400 to-amber-600",
      glow: "from-amber-500/15 via-amber-500/0 to-transparent",
    },
    {
      to: `/accommodations?trip=${tripId}`,
      label: "Alloggi",
      icon: Building2,
      color: "text-blue-500",
      count: stats.accommodationsCount,
      iconBg: "bg-blue-500/10",
      badgeBg: "from-blue-400 to-blue-600",
      glow: "from-blue-500/15 via-blue-500/0 to-transparent",
    },
    {
      to: `/transports?trip=${tripId}`,
      label: "Trasporti",
      icon: Plane,
      color: "text-teal-500",
      count: stats.transportsCount,
      iconBg: "bg-teal-500/15",
      badgeBg: "from-teal-400 to-teal-600",
      glow: "from-teal-500/20 via-teal-500/0 to-transparent",
    },
    {
      to: `/checklist?trip=${tripId}`,
      label: "Checklist",
      icon: ClipboardList,
      color: "text-indigo-500",
      count: stats.checklistTotal,
      iconBg: "bg-indigo-500/10",
      badgeBg: "from-indigo-400 to-indigo-600",
      glow: "from-indigo-500/15 via-indigo-500/0 to-transparent",
    },
    {
      to: `/ideas?trip=${tripId}`,
      label: "Idee",
      icon: Lightbulb,
      color: "text-purple-500",
      count: stats.ideasCount,
      iconBg: "bg-purple-500/10",
      badgeBg: "from-purple-400 to-purple-600",
      glow: "from-purple-500/15 via-purple-500/0 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8 animate-in slide-in-from-bottom-6 duration-700 delay-100 overflow-visible">
      {navItems.map((item) => (
        <Link key={item.to} to={item.to} className="block h-full">
          <div className="relative overflow-visible bg-card/50 backdrop-blur-sm transition-all border border-border/50 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 h-28 group hover:-translate-y-1 hover:shadow-lg hover:bg-card">
            <div
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                "bg-gradient-to-br",
                item.glow
              )}
            />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className={cn("relative w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-none", item.iconBg)}>
                <item.icon className={cn("w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110", item.color)} />
                {(item.count > 0) && (
                  <span
                    className={cn(
                      "absolute -right-2 -top-2 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center",
                      "bg-gradient-to-br text-white border border-white/20",
                      "shadow-[0_4px_10px_-4px_rgba(0,0,0,0.5)]",
                      "transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110",
                      item.badgeBg
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
            </div>
          </div>
        </Link>
      ))}
      <ChatButton tripId={tripId} />
    </div>
  );
}
