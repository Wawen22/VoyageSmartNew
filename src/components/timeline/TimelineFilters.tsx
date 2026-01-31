import { motion } from "framer-motion";
import { Ticket, Plane, Home, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TimelineFilterType = "all" | "activities" | "transports" | "accommodations";

interface TimelineFiltersProps {
  activeFilter: TimelineFilterType;
  onFilterChange: (filter: TimelineFilterType) => void;
}

const filters = [
  { id: "all" as const, label: "Tutti", icon: Filter },
  { id: "activities" as const, label: "Attività", icon: Ticket },
  { id: "transports" as const, label: "Trasporti", icon: Plane },
  { id: "accommodations" as const, label: "Alloggi", icon: Home },
];

export function TimelineFilters({ activeFilter, onFilterChange }: TimelineFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap transition-all duration-300 rounded-full px-4 py-2",
              "border font-medium text-sm",
              isActive
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-primary shadow-lg shadow-primary/25"
                : "bg-card/60 hover:bg-card/80 border-border/50 hover:border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <filter.icon className={cn(
              "w-4 h-4 transition-colors",
              isActive ? "text-primary-foreground" : ""
            )} />
            {filter.label}
            {isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
