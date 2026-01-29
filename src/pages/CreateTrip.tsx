import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Sparkles,
  Loader2,
  Image
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DestinationSelector, DestinationItem } from "@/components/trips/DestinationSelector";
import { searchPlace } from "@/lib/mapbox";

export default function CreateTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<DestinationItem[]>([
    { id: '1', name: '', isPrimary: true }
  ]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    coverImage: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }

    if (destinations.length === 0 || !destinations[0].name.trim()) {
      toast({
        title: "Destinazione mancante",
        description: "Inserisci almeno una destinazione per il tuo viaggio.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const primaryDest = destinations.find(d => d.isPrimary) || destinations[0];
      
      // Use existing coords from autocomplete or fetch them
      let primaryCoords = { lat: primaryDest.latitude, lng: primaryDest.longitude };
      
      if ((!primaryCoords.lat || !primaryCoords.lng) && primaryDest.name) {
        const coords = await searchPlace(primaryDest.name);
        if (coords) {
          primaryCoords = coords;
        }
      }

      const { data: tripData, error: tripError } = await supabase.from("trips").insert({
        user_id: user.id,
        title: formData.title,
        destination: primaryDest.name,
        latitude: primaryCoords.lat,
        longitude: primaryCoords.lng,
        description: formData.description || null,
        start_date: formData.startDate,
        end_date: formData.endDate,
        cover_image: formData.coverImage || null,
        status: "planning",
      }).select().single();

      if (tripError) throw tripError;

      const destinationsPayload = await Promise.all(destinations.map(async (d, index) => {
        let lat = d.latitude;
        let lng = d.longitude;

        if ((!lat || !lng) && d.name.trim()) {
          // Fallback geocoding if user typed manually without selecting
          const coords = await searchPlace(d.name);
          if (coords) {
            lat = coords.lat;
            lng = coords.lng;
          }
        }

        return {
          trip_id: tripData.id,
          name: d.name,
          is_primary: d.isPrimary,
          order_index: index,
          latitude: lat,
          longitude: lng
        };
      }));

      const validDestinations = destinationsPayload.filter(d => d.name.trim() !== "");

      const { error: destError } = await supabase
        .from("trip_destinations")
        .insert(validDestinations);

      if (destError) throw destError;

      toast({
        title: "Viaggio creato! 🎉",
        description: "La tua avventura inizia ora. Aggiungi le attività!",
      });
      navigate("/trips");
    } catch (error) {
      console.error("Error creating trip:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare il viaggio. Riprova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate("/trips")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna ai Viaggi
            </button>
            <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-2">
              Nuovo Viaggio
            </h1>
            <p className="text-muted-foreground">
              Pianifica la tua prossima avventura
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="app-surface-strong p-6 lg:p-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome Viaggio *
              </label>
              <input
                type="text"
                placeholder="Es. Estate in Grecia"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-12 px-4 rounded-2xl border border-border/60 bg-card/85 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
                disabled={loading}
              />
            </div>

            <DestinationSelector 
              destinations={destinations} 
              onChange={setDestinations}
              disabled={loading}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data Inizio *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border/60 bg-card/85 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data Fine *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border/60 bg-card/85 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                    min={formData.startDate}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descrizione
              </label>
              <textarea
                placeholder="Di cosa tratta questo viaggio?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-border/60 bg-card/85 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL Immagine Copertina
              </label>
              <div className="relative">
                <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border/60 bg-card/85 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="app-section p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  Generazione Itinerario AI
                </h4>
                <p className="text-sm text-muted-foreground">
                  Dopo aver creato il viaggio, potrai generare un itinerario personalizzato 
                  con l'AI basato sulle tue destinazioni e date.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => navigate("/trips")}
                disabled={loading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Crea Viaggio
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </div>
      </main>
    </AppLayout>
  );
}
