import { motion } from "framer-motion";
import { Trash2, Paperclip, ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpenseWithSplits } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/currency";

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
  onEdit?: () => void;
  index: number;
}

export function ExpenseCard({ expense, canDelete, onDelete, onEdit, index }: ExpenseCardProps) {
  const isForeignCurrency = expense.original_currency && expense.original_currency !== 'EUR';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="app-surface p-4 hover:border-primary/20 transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Category Icon */}
        <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center text-2xl flex-shrink-0">
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
            {formatCurrency(expense.amount, 'EUR')}
          </p>
          {isForeignCurrency && (
             <p className="text-xs text-muted-foreground/80">
               ({formatCurrency(expense.original_amount, expense.original_currency)})
             </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(expense.expense_date).toLocaleDateString("it-IT", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}