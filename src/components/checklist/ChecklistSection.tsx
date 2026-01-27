import { motion, AnimatePresence } from "framer-motion";
import { Users, User, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ChecklistItem } from "./ChecklistItem";
import { AddChecklistItemDialog } from "./AddChecklistItemDialog";
import { ChecklistItem as ChecklistItemType } from "@/hooks/useChecklist";
import { cn } from "@/lib/utils";

interface ChecklistSectionProps {
  title: string;
  isPersonal: boolean;
  items: ChecklistItemType[];
  stats: { total: number; completed: number };
  onAdd: (data: { text: string; isPersonal: boolean; category: string }) => void;
  onToggle: (item: ChecklistItemType) => void;
  onDelete: (id: string) => void;
  isAdding?: boolean;
}

export function ChecklistSection({
  title,
  isPersonal,
  items,
  stats,
  onAdd,
  onToggle,
  onDelete,
  isAdding,
}: ChecklistSectionProps) {
  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const Icon = isPersonal ? User : Users;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-5 space-y-4",
        isPersonal
          ? "bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-200/50 dark:border-violet-800/30"
          : "bg-gradient-to-br from-sky-500/5 to-blue-500/5 border-sky-200/50 dark:border-sky-800/30"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              isPersonal ? "bg-violet-500/10" : "bg-sky-500/10"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                isPersonal ? "text-violet-500" : "text-sky-500"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {stats.completed} di {stats.total} completati
            </p>
          </div>
        </div>
        <AddChecklistItemDialog
          isPersonal={isPersonal}
          onAdd={onAdd}
          isLoading={isAdding}
        />
      </div>

      {/* Progress */}
      {stats.total > 0 && (
        <div className="space-y-1.5">
          <Progress value={progress} className="h-2" />
          {progress === 100 && (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tutto completato!</span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center text-muted-foreground text-sm"
            >
              {isPersonal
                ? "Aggiungi gli elementi personali da portare"
                : "Aggiungi gli elementi condivisi del gruppo"}
            </motion.div>
          ) : (
            items.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
