import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

const AVAILABLE_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

export function ReactionPicker({ onSelect, className }: ReactionPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-6 w-6 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50", className)}
        >
          <SmilePlus className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" side="top" className="w-auto p-1.5 shadow-xl rounded-full border-none bg-white dark:bg-slate-950 flex gap-1">
        {AVAILABLE_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-transform hover:scale-125 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
