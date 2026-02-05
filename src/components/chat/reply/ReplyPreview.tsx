import { X, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage, ChatMemberProfile } from "@/hooks/useTripChat";

interface ReplyPreviewProps {
  replyTo: ChatMessage;
  sender: ChatMemberProfile | undefined;
  onCancel: () => void;
}

export function ReplyPreview({ replyTo, sender, onCancel }: ReplyPreviewProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-t bg-muted/30 backdrop-blur-sm animate-in slide-in-from-bottom-2">
      <Reply className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0 border-l-2 border-primary/50 pl-3 py-1">
        <p className="text-[10px] font-bold text-primary truncate">
          Risposta a {sender?.full_name || sender?.username || "Utente"}
        </p>
        <p className="text-xs text-muted-foreground truncate opacity-90 line-clamp-1">
          {replyTo.poll_id ? "📊 Sondaggio" : replyTo.content}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full hover:bg-muted"
        onClick={onCancel}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}
