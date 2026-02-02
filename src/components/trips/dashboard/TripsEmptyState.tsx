import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Plane } from "lucide-react";
import { motion } from "framer-motion";

export function TripsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Plane className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-2xl font-semibold text-foreground mb-3">
        Nessun viaggio trovato
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Non hai ancora pianificato nessun viaggio. Inizia ora la tua prossima avventura!
      </p>
      <Link to="/trips/new">
        <Button size="lg" className="rounded-full px-8">
          <Plus className="w-5 h-5 mr-2" />
          Crea il Tuo Primo Viaggio
        </Button>
      </Link>
    </motion.div>
  );
}
