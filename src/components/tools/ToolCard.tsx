import { motion } from "framer-motion";
import { 
  ArrowRight, 
  LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  theme: "indigo" | "emerald" | "amber" | "blue" | "rose" | "violet" | "sky" | "slate";
  onClick: () => void;
  index: number;
}

const THEMES = {
  indigo: {
    gradient: "from-indigo-50 to-violet-50/50 dark:from-indigo-950/30 dark:to-violet-950/10",
    border: "hover:border-indigo-200 dark:hover:border-indigo-800",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100/50 dark:bg-indigo-900/20",
    accent: "bg-indigo-500",
  },
  emerald: {
    gradient: "from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/10",
    border: "hover:border-emerald-200 dark:hover:border-emerald-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100/50 dark:bg-emerald-900/20",
    accent: "bg-emerald-500",
  },
  amber: {
    gradient: "from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/10",
    border: "hover:border-amber-200 dark:hover:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100/50 dark:bg-amber-900/20",
    accent: "bg-amber-500",
  },
  blue: {
    gradient: "from-blue-50 to-sky-50/50 dark:from-blue-950/30 dark:to-sky-950/10",
    border: "hover:border-blue-200 dark:hover:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100/50 dark:bg-blue-900/20",
    accent: "bg-blue-500",
  },
  rose: {
    gradient: "from-rose-50 to-pink-50/50 dark:from-rose-950/30 dark:to-pink-950/10",
    border: "hover:border-rose-200 dark:hover:border-rose-800",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-100/50 dark:bg-rose-900/20",
    accent: "bg-rose-500",
  },
  violet: {
    gradient: "from-violet-50 to-fuchsia-50/50 dark:from-violet-950/30 dark:to-fuchsia-950/10",
    border: "hover:border-violet-200 dark:hover:border-violet-800",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100/50 dark:bg-violet-900/20",
    accent: "bg-violet-500",
  },
  sky: {
    gradient: "from-sky-50 to-cyan-50/50 dark:from-sky-950/30 dark:to-cyan-950/10",
    border: "hover:border-sky-200 dark:hover:border-sky-800",
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-100/50 dark:bg-sky-900/20",
    accent: "bg-sky-500",
  },
  slate: {
    gradient: "from-slate-50 to-gray-50/50 dark:from-slate-950/30 dark:to-gray-950/10",
    border: "hover:border-slate-200 dark:hover:border-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-100/50 dark:bg-slate-900/20",
    accent: "bg-slate-500",
  },
};

export function ToolCard({ title, description, icon: Icon, theme = "indigo", onClick, index }: ToolCardProps) {
  const t = THEMES[theme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300",
        "bg-gradient-to-br border border-black/5 dark:border-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1",
        t.gradient,
        t.border
      )}
    >
      {/* Watermark Icon */}
      <div className="absolute -right-8 -bottom-8 opacity-[0.06] pointer-events-none select-none transform -rotate-12 transition-transform group-hover:scale-110 duration-700">
        <Icon strokeWidth={1} className={cn("w-48 h-48", t.iconColor)} />
      </div>

      <div className="p-6 relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-sm ring-1 ring-inset ring-black/5",
              t.iconBg,
              t.iconColor
            )}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold tracking-tight text-foreground/90 leading-tight mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
           <span className={t.iconColor}>Apri strumento</span>
           <ArrowRight className={cn("w-4 h-4", t.iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}
