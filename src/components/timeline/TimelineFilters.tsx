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
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <Button
            key={filter.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap transition-all rounded-full px-4",
              isActive
                ? "shadow-[0_16px_32px_-22px_rgba(15,23,42,0.45)]"
                : "bg-card/80 hover:bg-card border-border/60"
            )}
          >
            <filter.icon className="w-4 h-4" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
