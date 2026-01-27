import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChecklistItem as ChecklistItemType } from "@/hooks/useChecklist";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (item: ChecklistItemType) => void;
  onDelete: (id: string) => void;
  showDelete?: boolean;
}

export function ChecklistItem({
  item,
  onToggle,
  onDelete,
  showDelete = true,
}: ChecklistItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg transition-colors",
        item.is_completed
          ? "bg-primary/5 hover:bg-primary/10"
          : "bg-muted/50 hover:bg-muted"
      )}
    >
      <Checkbox
        checked={item.is_completed}
        onCheckedChange={() => onToggle(item)}
        className="h-5 w-5"
      />
      
      <span
        className={cn(
          "flex-1 text-sm transition-all",
          item.is_completed && "line-through text-muted-foreground"
        )}
      >
        {item.text}
      </span>

      {item.is_completed && (
        <Check className="w-4 h-4 text-primary flex-shrink-0" />
      )}

      {showDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </motion.div>
  );
}
