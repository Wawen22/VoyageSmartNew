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
        className="fixed bottom-6 left-6 z-50 hidden lg:block"
      >
        <Link to={`/chat?trip=${activeTripId}`}>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white relative"
          >
            <MessageCircle className="h-7 w-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-background animate-in zoom-in">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
