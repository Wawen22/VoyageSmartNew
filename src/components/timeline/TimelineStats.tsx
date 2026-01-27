import { motion } from "framer-motion";
import { Plane, Home, Ticket, Calendar } from "lucide-react";

interface TimelineStatsProps {
  stats: {
    total: number;
    activities: number;
    transports: number;
    accommodations: number;
  };
  daysCount: number;
}

export function TimelineStats({ stats, daysCount }: TimelineStatsProps) {
  const items = [
    {
      icon: Calendar,
      label: "Giorni",
      value: daysCount,
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Ticket,
      label: "Attività",
      value: stats.activities,
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Plane,
      label: "Trasporti",
      value: stats.transports,
      color: "bg-sky-100 text-sky-600",
    },
    {
      icon: Home,
      label: "Alloggi",
      value: stats.accommodations,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="app-surface p-3 flex items-center gap-3"
        >
          <div className={`p-2 rounded-lg ${item.color}`}>
            <item.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
