import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ChecklistButtonProps {
  isLanding?: boolean;
}

export function ChecklistButton({ isLanding = false }: ChecklistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tripIdFromQuery = searchParams.get("trip");
  const tripIdFromPath = location.pathname.startsWith("/trips/")
    ? location.pathname.split("/")[2]
    : null;
  const currentTripId =
    tripIdFromQuery || (tripIdFromPath && tripIdFromPath !== "new" ? tripIdFromPath : null);
  const { user } = useAuth();

  // Fetch user's trips
  const { data: trips = [] } = useQuery({
    queryKey: ["user-trips-checklist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("trip_members")
        .select(`
          trip_id,
          trips:trip_id (
            id,
            title,
            destination,
            start_date,
            end_date
          )
        `)
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });

      if (error) throw error;
      return data?.map(d => d.trips).filter(Boolean) || [];
    },
    enabled: !!user,
  });

  // Fetch incomplete checklist items count
  const { data: incompleteCount = 0 } = useQuery({
    queryKey: ["checklist-incomplete-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      // Get all trip IDs the user is a member of
      const { data: memberData } = await supabase
        .from("trip_members")
        .select("trip_id")
        .eq("user_id", user.id);
      
      if (!memberData || memberData.length === 0) return 0;
      
      const tripIds = memberData.map(m => m.trip_id);
      
      // Count incomplete items (group items OR personal items for this user)
      const { count, error } = await supabase
        .from("checklist_items")
        .select("*", { count: "exact", head: true })
        .in("trip_id", tripIds)
        .eq("is_completed", false)
        .or(`user_id.is.null,user_id.eq.${user.id}`);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTripClick = (tripId: string) => {
    navigate(`/checklist?trip=${tripId}`);
    setIsOpen(false);
  };

  // If we're already on a trip context, go directly to that checklist
  const handleButtonClick = () => {
    if (currentTripId) {
      navigate(`/checklist?trip=${currentTripId}`);
    } else if (trips.length === 1) {
      navigate(`/checklist?trip=${trips[0].id}`);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleButtonClick}
        className={`relative p-2 rounded-lg transition-colors ${
          isLanding
            ? "text-white hover:bg-white/10"
            : "text-foreground hover:bg-muted"
        }`}
        title="Checklist"
      >
        <ClipboardList className="w-5 h-5" />
        {incompleteCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {incompleteCount > 9 ? "9+" : incompleteCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 app-surface z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/60 bg-muted/40">
              <h3 className="font-semibold text-foreground">Checklist Viaggio</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Seleziona un viaggio
              </p>
            </div>

            {/* Trips List */}
            <ScrollArea className="max-h-64">
              {trips.length === 0 ? (
                <div className="p-6 text-center">
                  <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nessun viaggio disponibile
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  {trips.map((trip: any) => (
                    <button
                      key={trip.id}
                      onClick={() => handleTripClick(trip.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {trip.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {trip.destination}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
