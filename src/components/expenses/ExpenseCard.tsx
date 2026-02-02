import { motion } from "framer-motion";
import { Trash2, Paperclip, Pencil, Utensils, Car, BedDouble, Ticket, ShoppingBag, Package, Calendar, User, Users, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ExpenseWithSplits } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Theme configuration for categories
const CATEGORY_THEMES: Record<string, {
  icon: typeof Utensils;
  label: string;
  bgGradient: string;
  borderColor: string;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  accentBarColor: string;
}> = {
  food: {
    icon: Utensils,
    label: 'Cibo',
    bgGradient: "from-amber-50/80 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/5",
    borderColor: "hover:border-amber-200 dark:hover:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100/50 dark:bg-amber-900/20",
    accentColor: "text-amber-700 dark:text-amber-300",
    accentBarColor: "bg-amber-500/40",
  },
  transport: {
    icon: Car,
    label: 'Trasporti',
    bgGradient: "from-cyan-50/80 to-sky-50/30 dark:from-cyan-950/20 dark:to-sky-950/5",
    borderColor: "hover:border-cyan-200 dark:hover:border-cyan-800",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-100/50 dark:bg-cyan-900/20",
    accentColor: "text-cyan-700 dark:text-cyan-300",
    accentBarColor: "bg-cyan-500/40",
  },
  accommodation: {
    icon: BedDouble,
    label: 'Alloggio',
    bgGradient: "from-rose-50/80 to-pink-50/30 dark:from-rose-950/20 dark:to-pink-950/5",
    borderColor: "hover:border-rose-200 dark:hover:border-rose-800",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-100/50 dark:bg-rose-900/20",
    accentColor: "text-rose-700 dark:text-rose-300",
    accentBarColor: "bg-rose-500/40",
  },
  activities: {
    icon: Ticket,
    label: 'Attività',
    bgGradient: "from-violet-50/80 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/5",
    borderColor: "hover:border-violet-200 dark:hover:border-violet-800",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100/50 dark:bg-violet-900/20",
    accentColor: "text-violet-700 dark:text-violet-300",
    accentBarColor: "bg-violet-500/40",
  },
  shopping: {
    icon: ShoppingBag,
    label: 'Shopping',
    bgGradient: "from-emerald-50/80 to-green-50/30 dark:from-emerald-950/20 dark:to-green-950/5",
    borderColor: "hover:border-emerald-200 dark:hover:border-emerald-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100/50 dark:bg-emerald-900/20",
    accentColor: "text-emerald-700 dark:text-emerald-300",
    accentBarColor: "bg-emerald-500/40",
  },
  other: {
    icon: Package,
    label: 'Altro',
    bgGradient: "from-slate-50/80 to-gray-50/30 dark:from-slate-950/20 dark:to-gray-950/5",
    borderColor: "hover:border-slate-200 dark:hover:border-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-100/50 dark:bg-slate-900/20",
    accentColor: "text-slate-700 dark:text-slate-300",
    accentBarColor: "bg-slate-500/40",
  },
};

interface ExpenseCardProps {
  expense: ExpenseWithSplits;
  canDelete: boolean;
  onDelete: () => void;
  onEdit?: () => void;
  index: number;
}

export function ExpenseCard({ expense, canDelete, onDelete, onEdit, index }: ExpenseCardProps) {
  const isForeignCurrency = expense.original_currency && expense.original_currency !== 'EUR';
  const theme = CATEGORY_THEMES[expense.category] || CATEGORY_THEMES.other;
  const Icon = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 border border-border/40",
        "bg-gradient-to-br shadow-sm hover:shadow-md",
        theme.bgGradient,
        theme.borderColor
      )}>
        {/* Compact Background Watermark */}
        <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none select-none transform -rotate-12 transition-transform group-hover:scale-110 duration-700">
          <Icon strokeWidth={1} className={cn("w-32 h-32", theme.iconColor)} />
        </div>

        {/* Compact Header */}
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 space-y-0 relative z-10">
          <div className="flex items-center gap-2 overflow-hidden">
             <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm backdrop-blur-sm ring-1 ring-inset ring-black/5",
              theme.iconBg,
              theme.iconColor
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
               <h4 className="font-semibold text-sm text-foreground/90 leading-tight truncate">
                  {expense.description}
               </h4>
               <span className="text-[10px] font-medium text-muted-foreground/80">
                  {theme.label} • {format(new Date(expense.expense_date), "dd MMM", { locale: it })}
               </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0 pl-2">
             <div className="font-bold text-base text-foreground tabular-nums">
                {formatCurrency(expense.amount, 'EUR')}
             </div>
             {isForeignCurrency && (
               <p className="text-[9px] text-muted-foreground/70 -mt-0.5 font-medium">
                 {formatCurrency(expense.original_amount, expense.original_currency)}
               </p>
             )}
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-1.5 relative z-10">
          {/* Super Compact Info Bar */}
          <div className="flex items-center justify-between gap-2 py-2 px-2 rounded-lg bg-white/40 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/5 shadow-sm relative overflow-hidden">
             <div className={cn("absolute top-0 left-0 w-1 h-full opacity-60", theme.accentBarColor)}></div>
             
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                   <User className={cn("h-3 w-3", theme.iconColor)} />
                   <span className="text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground/70">{expense.paid_by_profile?.full_name?.split(' ')[0] || "Utente"}</span>
                   </span>
                </div>

                <div className="w-px h-3 bg-black/5 dark:bg-white/10" />

                <div className="flex items-center gap-1.5">
                   <Users className={cn("h-3 w-3", theme.iconColor)} />
                   <span className="text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground/70">{expense.splits.length}</span> {expense.splits.length === 1 ? 'persona' : 'persone'}
                   </span>
                </div>
             </div>

             <div className="flex items-center gap-1">
                {expense.receipt_url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(expense.receipt_url!, '_blank');
                    }}
                  >
                    <Receipt className="h-3 w-3" />
                  </Button>
                )}
                
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}