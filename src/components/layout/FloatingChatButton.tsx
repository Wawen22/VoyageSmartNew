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
          {/* Outer container with overflow-visible for badge positioning */}
          <div className="relative overflow-visible">
            {/* Pulsing background glow - Now slate/blue */}
            <div className="absolute inset-0 rounded-2xl bg-slate-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
            
            {/* Button without overflow-hidden to allow badge visibility */}
            <Button
              size="icon"
              className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-indigo-900 bg-[length:200%_200%] animate-gradient-xy border border-white/20 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1"
            >
              {/* Shine effect - now clipped within its own container */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:animate-shine" />
              </div>
              
              <MessageCircle className="h-7 w-7 text-white drop-shadow-md relative z-10" />
            </Button>
            
            {/* Badge positioned outside button for guaranteed visibility */}
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 z-10 pointer-events-none">
                <span className="relative flex h-6 w-6 items-center justify-center">
                  {/* Ping animation */}
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                  {/* Badge */}
                  <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-pink-600 text-[11px] font-black text-white border-2 border-white shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-in zoom-in">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}