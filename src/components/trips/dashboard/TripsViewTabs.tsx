import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trip } from "@/pages/Trips"; // We will export the interface from there or move it to types
import { TripsGrid } from "./TripsGrid";
import { TripsEmptyState } from "./TripsEmptyState";
import { motion } from "framer-motion";
import { ProfileMap } from "@/components/maps/ProfileMap";
import { LayoutGrid, Map, Compass, BookOpen } from "lucide-react";

interface TripsViewTabsProps {
  trips: Trip[];
  viewMode: 'grid' | 'map';
  onViewModeChange: (mode: 'grid' | 'map') => void;
}

export function TripsViewTabs({ trips, viewMode, onViewModeChange }: TripsViewTabsProps) {
  
  if (trips.length === 0) {
    return <TripsEmptyState />;
  }

  // If viewMode is map, we override the Tabs display or use Tabs to switch
  // But standard UI pattern here might be Tabs for "All Trips", "Future", "Past" rather than Grid/Map
  // Grid/Map is better handled by the toolbar toggler for visual style. 
  // Let's use Tabs for categorization as requested "Modern structure".

  const upcomingTrips = trips.filter(t => ['upcoming', 'planning', 'active'].includes(t.status));
  const pastTrips = trips.filter(t => t.status === 'completed');

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <div className="flex justify-between items-center mb-6">
         <TabsList className="bg-secondary/40 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Tutti</TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">In Programma</TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Passati</TabsTrigger>
         </TabsList>
         {/* We can hide view toggler here if we moved it to FilterBar, or keep it distinct */}
      </div>

      <TabsContent value="all" className="mt-0 space-y-6">
        {viewMode === 'map' ? (
           <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[600px] rounded-xl overflow-hidden border border-border/50 shadow-sm"
          >
             <ProfileMap trips={trips} />
          </motion.div>
        ) : (
           <TripsGrid trips={trips} />
        )}
      </TabsContent>
      
      <TabsContent value="upcoming">
        {viewMode === 'map' ? (
           <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[600px] rounded-xl overflow-hidden border border-border/50 shadow-sm"
          >
             <ProfileMap trips={upcomingTrips} />
          </motion.div>
        ) : (
          <>
            <TripsGrid trips={upcomingTrips} />
            {upcomingTrips.length === 0 && <div className="py-12 text-center text-muted-foreground">Nessun viaggio in programma.</div>}
          </>
        )}
      </TabsContent>

      <TabsContent value="past">
        {viewMode === 'map' ? (
           <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[600px] rounded-xl overflow-hidden border border-border/50 shadow-sm"
          >
             <ProfileMap trips={pastTrips} />
          </motion.div>
        ) : (
          <>
            <TripsGrid trips={pastTrips} />
            {pastTrips.length === 0 && <div className="py-12 text-center text-muted-foreground">Nessun viaggio passato.</div>}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
