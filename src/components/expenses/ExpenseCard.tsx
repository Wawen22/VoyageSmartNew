import { motion } from "framer-motion";
import { Trash2, Paperclip, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpenseWithSplits } from "@/hooks/useExpenses";

const categoryIcons: Record<string, string> = {
  food: "🍽️",
  transport: "🚗",
  accommodation: "🏨",
  activities: "🎭",
  shopping: "🛍️",
  other: "📦",
};

interface ExpenseCardProps {
  expense: ExpenseWithSplits;
  canDelete: boolean;
  onDelete: () => void;
  index: number;
}

export function ExpenseCard({ expense, canDelete, onDelete, index }: ExpenseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-xl p-4 shadow-card border border-border hover:border-primary/20 transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Category Icon */}
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
          {categoryIcons[expense.category] || "📦"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {expense.description}
          </h4>
          <p className="text-sm text-muted-foreground">
            Pagato da {expense.paid_by_profile?.full_name || "Utente"} • 
            Diviso in {expense.splits.length}
            {expense.receipt_url && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-5 px-1.5 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(expense.receipt_url!, '_blank');
                }}
              >
                <Paperclip className="w-3 h-3 mr-1" />
                Ricevuta
              </Button>
            )}
          </p>
        </div>

        {/* Amount & Date */}
        <div className="text-right flex-shrink-0">
          <p className="font-semibold text-foreground">
            €{expense.amount.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(expense.expense_date).toLocaleDateString("it-IT", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Delete Button */}
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
