import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function TripsFloatingActionButton() {
  return (
    <div className="fixed bottom-6 right-6 md:hidden z-50">
      <Link to="/trips/new">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <Button 
              size="icon" 
              className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-white/10 backdrop-blur-sm"
            >
              <Plus className="w-7 h-7" />
            </Button>
        </motion.div>
      </Link>
    </div>
  );
}
