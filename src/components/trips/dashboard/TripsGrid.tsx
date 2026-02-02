import { motion } from "framer-motion";
import { TripCard } from "./TripCard";

interface Trip {
    id: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    cover_image: string | null;
    status: string;
    member_count?: number;
}

interface TripsGridProps {
  trips: Trip[];
}

export function TripsGrid({ trips }: TripsGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {trips.map((trip, index) => (
        <motion.div
          key={trip.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <TripCard trip={trip} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
}
