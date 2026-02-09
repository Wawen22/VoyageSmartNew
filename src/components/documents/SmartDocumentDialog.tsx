import { useState } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plane, Hotel, Calendar, DollarSign, Check, X } from "lucide-react";
import { AnalyzedData } from "@/hooks/useDocumentAnalysis";
import { useTransports } from "@/hooks/useTransports";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useItinerary } from "@/hooks/useItinerary";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SmartDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AnalyzedData | null;
  tripId: string;
  onConfirm: () => void;
}

export function SmartDocumentDialog({ 
  open, 
  onOpenChange, 
  data, 
  tripId,
  onConfirm
}: SmartDocumentDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const { createTransport } = useTransports(tripId);
  const { createAccommodation } = useAccommodations(tripId);
  const { createActivity } = useItinerary(tripId);
  const { createExpense } = useExpenses(tripId);

  if (!data) return null;

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { entity_type, data: d } = data;

      if (entity_type === 'transport') {
        await createTransport({
          trip_id: tripId,
          transport_type: 'flight', // Default fallback, user can edit later
          departure_location: d.location?.split('->')[0]?.trim() || d.location || "Partenza",
          arrival_location: d.location?.split('->')[1]?.trim() || "Arrivo",
          departure_datetime: d.date ? (d.time ? `${d.date} ${d.time}` : `${d.date} 10:00`) : new Date().toISOString(),
          price: d.price,
          currency: d.currency || 'EUR',
          booking_reference: d.details
        });
        toast({ title: "Trasporto creato", description: "Dati estratti dal documento salvati." });
      } 
      else if (entity_type === 'accommodation') {
        await createAccommodation({
          trip_id: tripId,
          name: d.title || "Nuovo Alloggio",
          check_in: d.date || new Date().toISOString().split('T')[0],
          check_out: d.end_date || d.date || new Date().toISOString().split('T')[0],
          price: d.price,
          currency: d.currency || 'EUR',
          notes: d.details
        });
        toast({ title: "Alloggio creato", description: "Dati estratti dal documento salvati." });
      }
      else if (entity_type === 'activity') {
        await createActivity({
          trip_id: tripId,
          title: d.title || "Nuova Attività",
          activity_date: d.date || new Date().toISOString().split('T')[0],
          start_time: d.time,
          category: 'activity'
        });
        toast({ title: "Attività creata", description: "Dati estratti dal documento salvati." });
      }
      else if (entity_type === 'expense') {
        await createExpense({
          trip_id: tripId,
          description: d.title || "Spesa Documentata",
          amount: d.price || 0,
          original_amount: d.price || 0,
          original_currency: d.currency || 'EUR',
          paid_by: user.id,
          split_with: [user.id],
          category: 'other',
          date: d.date
        });
        toast({ title: "Spesa creata", description: "Dati estratti dal documento salvati." });
      }

      onConfirm();
      onOpenChange(false);

    } catch (e) {
      console.error("Error saving entity:", e);
      toast({ 
        title: "Errore salvataggio", 
        description: "Non è stato possibile creare l'elemento.",
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderIcon = () => {
    switch (data.entity_type) {
      case 'transport': return <Plane className="h-6 w-6 text-sky-500" />;
      case 'accommodation': return <Hotel className="h-6 w-6 text-indigo-500" />;
      case 'activity': return <Calendar className="h-6 w-6 text-emerald-500" />;
      case 'expense': return <DollarSign className="h-6 w-6 text-amber-500" />;
      default: return <Check className="h-6 w-6" />;
    }
  };

  const getTitle = () => {
    switch (data.entity_type) {
      case 'transport': return "Nuovo Trasporto";
      case 'accommodation': return "Nuovo Alloggio";
      case 'activity': return "Nuova Attività";
      case 'expense': return "Nuova Spesa";
      default: return "Elemento Rilevato";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-violet-500" />
            Documento Analizzato
          </DialogTitle>
          <DialogDescription>
            L'AI ha trovato queste informazioni. Vuoi salvarle nel tuo viaggio?
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 bg-muted/50 border-dashed">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-background rounded-lg border shadow-sm">
              {renderIcon()}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{data.data.title || getTitle()}</h4>
                <Badge variant="outline" className="capitalize">{data.entity_type}</Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-0.5">
                {data.data.date && (
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {data.data.date} {data.data.time && `• ${data.data.time}`}
                    {data.data.end_date && ` → ${data.data.end_date}`}
                  </p>
                )}
                
                {data.data.location && (
                  <p className="line-clamp-1">{data.data.location}</p>
                )}
                
                {data.data.price && (
                  <p className="font-medium text-foreground">
                    {data.data.price} {data.data.currency}
                  </p>
                )}

                {data.data.details && (
                  <p className="text-xs italic mt-1 opacity-70 line-clamp-2">
                    {data.data.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ignora
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-violet-600 hover:bg-violet-700">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Aggiungi al Viaggio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 5h4" />
      <path d="M19 21v-4" />
      <path d="M15 19h4" />
    </svg>
  );
}
