import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUnreadChat } from "@/hooks/useUnreadChat";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingChatButton() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tripIdFromQuery = searchParams.get("trip");
  const tripIdFromPath = location.pathname.startsWith("/trips/")
    ? location.pathname.split("/")[2]
    : null;
  const activeTripId =
    tripIdFromQuery || (tripIdFromPath && tripIdFromPath !== "new" ? tripIdFromPath : null);

  const unreadCount = useUnreadChat(activeTripId);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide on the chat page itself to avoid duplication
    if (location.pathname.includes('/chat')) {
      setIsVisible(false);
    } else {
      setIsVisible(!!activeTripId);
    }
  }, [location.pathname, activeTripId]);

  if (!isVisible || !activeTripId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-6 left-6 z-50 hidden lg:block group"
      >
        <Link to={`/chat?trip=${activeTripId}`}>
          <div className="relative">
            {/* Pulsing background glow - Now slate/blue */}
            <div className="absolute inset-0 rounded-2xl bg-slate-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
            
            <Button
              size="icon"
              className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-indigo-900 bg-[length:200%_200%] animate-gradient-xy border border-white/20 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:animate-shine" />
              
              <MessageCircle className="h-7 w-7 text-white drop-shadow-md" />
              
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white border-2 border-background shadow-sm animate-in zoom-in">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}