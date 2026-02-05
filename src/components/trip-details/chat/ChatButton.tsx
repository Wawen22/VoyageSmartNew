import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadChat } from "@/hooks/useUnreadChat";

interface ChatButtonProps {
  tripId: string;
}

export function ChatButton({ tripId }: ChatButtonProps) {
  const unreadCount = useUnreadChat(tripId);

  return (
    <Link to={`/chat?trip=${tripId}`} className="block h-full relative group overflow-visible">
      <div className="relative h-28 flex flex-col items-center justify-center text-center gap-3 p-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:bg-card hover:border-pink-500/30 overflow-visible">
        {/* Absolute positioned badge at the top-right of the WHOLE card for maximum visibility */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 z-[100]">
            <span className="relative flex h-6 w-6 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-pink-600 text-[11px] font-black text-white border-2 border-white shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-in zoom-in">
                {unreadCount}
              </span>
            </span>
          </div>
        )}

        {/* Pink Glow background effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-br from-pink-500/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Icon Container */}
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(236,72,153,0.2)] dark:shadow-none bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors relative">
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110 text-pink-500" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-0.5 pointer-events-none">
          <span className="text-xs font-bold tracking-wide uppercase text-muted-foreground group-hover:text-pink-600 transition-colors">
            Chat
          </span>
          {unreadCount > 0 && (
            <span className="text-[9px] font-bold text-pink-500 animate-pulse hidden md:block uppercase tracking-tighter">
              {unreadCount === 1 ? '1 nuovo messaggio' : `${unreadCount} nuovi messaggi`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
