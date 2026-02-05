import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface Reaction {
  id: string;
  user_id: string;
  emoji: string;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  onToggle: (emoji: string) => void;
  isMe: boolean;
}

export function MessageReactions({ reactions, onToggle, isMe }: MessageReactionsProps) {
  const { user } = useAuth();
  
  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const groups = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        count: 0,
        hasVoted: false,
        emoji: reaction.emoji
      };
    }
    acc[reaction.emoji].count++;
    if (user && reaction.user_id === user.id) {
      acc[reaction.emoji].hasVoted = true;
    }
    return acc;
  }, {} as Record<string, { count: number; hasVoted: boolean; emoji: string }>);

  return (
    <div className={cn("flex flex-wrap gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
      {Object.values(groups).map((group) => (
        <button
          key={group.emoji}
          onClick={() => onToggle(group.emoji)}
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-all shadow-sm",
            group.hasVoted 
              ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20" 
              : "bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <span>{group.emoji}</span>
          {group.count > 1 && <span>{group.count}</span>}
        </button>
      ))}
    </div>
  );
}
