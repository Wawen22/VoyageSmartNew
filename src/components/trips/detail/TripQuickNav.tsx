import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Wallet,
  Building2,
  Plane,
  ClipboardList,
  Lightbulb,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface TripQuickNavProps {
  tripId: string;
  stats: {
    activitiesCount: number;
    expensesCount: number;
    accommodationsCount: number;
    transportsCount: number;
    checklistTotal: number;
    ideasCount: number;
  };
}

const navItems = [
  {
    id: "itinerary",
    label: "Itinerario",
    icon: Calendar,
    description: "Attività pianificate",
    primaryColor: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/40",
    textColor: "text-emerald-600 dark:text-emerald-400",
    shadowColor: "shadow-emerald-500/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  {
    id: "expenses",
    label: "Spese",
    icon: Wallet,
    description: "Gestisci budget",
    primaryColor: "amber",
    gradient: "from-amber-500 to-orange-600",
    bgGlow: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    hoverBorder: "hover:border-amber-500/40",
    textColor: "text-amber-600 dark:text-amber-400",
    shadowColor: "shadow-amber-500/20",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  {
    id: "accommodations",
    label: "Alloggi",
    icon: Building2,
    description: "Prenotazioni",
    primaryColor: "blue",
    gradient: "from-blue-500 to-indigo-600",
    bgGlow: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
    textColor: "text-blue-600 dark:text-blue-400",
    shadowColor: "shadow-blue-500/20",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
  },
  {
    id: "transports",
    label: "Trasporti",
    icon: Plane,
    description: "Spostamenti",
    primaryColor: "cyan",
    gradient: "from-cyan-500 to-sky-600",
    bgGlow: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/40",
    textColor: "text-cyan-600 dark:text-cyan-400",
    shadowColor: "shadow-cyan-500/20",
    iconBg: "bg-gradient-to-br from-cyan-500 to-sky-600",
  },
  {
    id: "checklist",
    label: "Checklist",
    icon: ClipboardList,
    description: "Cosa portare",
    primaryColor: "violet",
    gradient: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    hoverBorder: "hover:border-violet-500/40",
    textColor: "text-violet-600 dark:text-violet-400",
    shadowColor: "shadow-violet-500/20",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
  {
    id: "ideas",
    label: "Idee",
    icon: Lightbulb,
    description: "Ispirazioni",
    primaryColor: "pink",
    gradient: "from-pink-500 to-rose-600",
    bgGlow: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    hoverBorder: "hover:border-pink-500/40",
    textColor: "text-pink-600 dark:text-pink-400",
    shadowColor: "shadow-pink-500/20",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
  },
];

const getStatCount = (id: string, stats: TripQuickNavProps["stats"]) => {
  switch (id) {
    case "itinerary":
      return stats.activitiesCount;
    case "expenses":
      return stats.expensesCount;
    case "accommodations":
      return stats.accommodationsCount;
    case "transports":
      return stats.transportsCount;
    case "checklist":
      return stats.checklistTotal;
    case "ideas":
      return stats.ideasCount;
    default:
      return 0;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 22,
    },
  },
} as const;

export function TripQuickNav({ tripId, stats }: TripQuickNavProps) {
  return (
    <div className="relative -mt-16 md:-mt-20 z-30 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
        >
          {navItems.map((item, index) => {
            const count = getStatCount(item.id, stats);
            const Icon = item.icon;
            const hasItems = count > 0;

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{ 
                  y: -6, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={`/${item.id}?trip=${tripId}`} className="block">
                  <div
                    className={cn(
                      "group relative overflow-hidden rounded-2xl md:rounded-3xl",
                      "bg-white/95 dark:bg-card/95 backdrop-blur-xl border-2",
                      "p-4 md:p-5",
                      "flex flex-col items-center justify-center text-center",
                      "transition-all duration-300 ease-out",
                      "h-[130px] md:h-[150px]",
                      item.borderColor,
                      item.hoverBorder,
                      "hover:shadow-2xl",
                      `hover:${item.shadowColor}`
                    )}
                  >
                    {/* Background Glow Effect */}
                    <div
                      className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        item.bgGlow
                      )}
                    />
                    
                    {/* Decorative Elements */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-muted/50 to-transparent opacity-0 group-hover:opacity-40 transition-all duration-500 blur-xl" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      {/* Icon Container */}
                      <div className="relative">
                        <motion.div
                          whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className={cn(
                            "w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl",
                            "flex items-center justify-center",
                            "shadow-lg transition-all duration-300",
                            "group-hover:shadow-xl group-hover:scale-105",
                            item.iconBg
                          )}
                        >
                          <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </motion.div>

                        {/* Count Badge */}
                        <AnimatePresence>
                          {hasItems && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{
                                delay: 0.2 + index * 0.04,
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                              }}
                              className={cn(
                                "absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2",
                                "min-w-[24px] md:min-w-[28px] h-[24px] md:h-[28px] px-1.5",
                                "rounded-full text-[10px] md:text-xs font-bold",
                                "flex items-center justify-center",
                                "bg-white dark:bg-card border-2 shadow-md",
                                "group-hover:scale-110 transition-transform",
                                item.textColor,
                                item.borderColor
                              )}
                            >
                              {count > 99 ? "99+" : count}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Text Labels */}
                      <div className="space-y-0.5">
                        <span className="block text-xs md:text-sm font-bold text-foreground/90 group-hover:text-foreground transition-colors">
                          {item.label}
                        </span>
                        <span className={cn(
                          "block text-[10px] md:text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0",
                          item.textColor
                        )}>
                          {item.description}
                        </span>
                      </div>
                    </div>

                    {/* Hover Arrow Indicator */}
                    <motion.div
                      initial={{ opacity: 0, x: -10, y: 10 }}
                      whileHover={{ opacity: 1, x: 0, y: 0 }}
                      className={cn(
                        "absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300",
                        item.textColor
                      )}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>

                    {/* Empty State Indicator */}
                    {!hasItems && (
                      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-60 transition-opacity">
                        <span className="text-[9px] text-muted-foreground">Vuoto</span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
