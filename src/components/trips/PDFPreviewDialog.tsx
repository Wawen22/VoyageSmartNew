import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FileDown,
  Loader2,
  CheckCircle,
  Calendar,
  Bed,
  Plane,
  Wallet,
  FileText,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateTripPDF, PDFSections } from "@/utils/pdfExport";

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  tripTitle: string;
}

const sectionConfig = [
  {
    id: "itinerary" as keyof PDFSections,
    label: "Itinerario",
    description: "Tutte le attività programmate giorno per giorno",
    icon: Calendar,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "accommodations" as keyof PDFSections,
    label: "Alloggi",
    description: "Hotel, appartamenti e strutture prenotate",
    icon: Bed,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "transports" as keyof PDFSections,
    label: "Trasporti",
    description: "Voli, treni e altri mezzi di trasporto",
    icon: Plane,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "expenses" as keyof PDFSections,
    label: "Spese",
    description: "Riepilogo di tutte le spese sostenute",
    icon: Wallet,
    color: "text-forest",
    bgColor: "bg-forest/10",
  },
];

export function PDFPreviewDialog({
  open,
  onOpenChange,
  tripId,
  tripTitle,
}: PDFPreviewDialogProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [sections, setSections] = useState<PDFSections>({
    itinerary: true,
    accommodations: true,
    transports: true,
    expenses: true,
  });

  const toggleSection = (sectionId: keyof PDFSections) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const selectAll = () => {
    setSections({
      itinerary: true,
      accommodations: true,
      transports: true,
      expenses: true,
    });
  };

  const deselectAll = () => {
    setSections({
      itinerary: false,
      accommodations: false,
      transports: false,
      expenses: false,
    });
  };

  const selectedCount = Object.values(sections).filter(Boolean).length;
  const allSelected = selectedCount === 4;
  const noneSelected = selectedCount === 0;

  const handleExport = async () => {
    if (noneSelected) {
      toast({
        title: "Seleziona almeno una sezione",
        description: "Devi includere almeno una sezione nel PDF",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    try {
      // Fetch all data in parallel
      const [
        tripResult,
        activitiesResult,
        accommodationsResult,
        transportsResult,
        expensesResult,
        membersResult,
      ] = await Promise.all([
        supabase.from("trips").select("*").eq("id", tripId).single(),
        supabase
          .from("itinerary_activities")
          .select("*")
          .eq("trip_id", tripId)
          .order("activity_date", { ascending: true })
          .order("start_time", { ascending: true, nullsFirst: false }),
        supabase
          .from("accommodations")
          .select("*")
          .eq("trip_id", tripId)
          .order("check_in", { ascending: true }),
        supabase
          .from("transports")
          .select("*")
          .eq("trip_id", tripId)
          .order("departure_datetime", { ascending: true }),
        supabase
          .from("expenses")
          .select("*")
          .eq("trip_id", tripId)
          .order("expense_date", { ascending: false }),
        supabase
          .from("trip_members")
          .select("user_id, role")
          .eq("trip_id", tripId),
      ]);

      if (tripResult.error) throw tripResult.error;

      // Get profiles for members and expense payers
      const memberUserIds = membersResult.data?.map((m) => m.user_id) || [];
      const expensePaidByIds = expensesResult.data?.map((e) => e.paid_by) || [];
      const allUserIds = [...new Set([...memberUserIds, ...expensePaidByIds])];

      const profilesMap: Record<string, string> = {};
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", allUserIds);

        profiles?.forEach((p) => {
          profilesMap[p.user_id] = p.full_name || "Utente";
        });
      }

      // Transform data for PDF
      const exportData = {
        trip: tripResult.data,
        activities: (activitiesResult.data || []).map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          location: a.location,
          activity_date: a.activity_date,
          start_time: a.start_time,
          end_time: a.end_time,
          category: a.category || "activity",
        })),
        accommodations: (accommodationsResult.data || []).map((a) => ({
          id: a.id,
          name: a.name,
          address: a.address,
          check_in: a.check_in,
          check_out: a.check_out,
          check_in_time: a.check_in_time,
          check_out_time: a.check_out_time,
          price: a.price,
          currency: a.currency,
          booking_reference: a.booking_reference,
        })),
        transports: (transportsResult.data || []).map((t) => ({
          id: t.id,
          transport_type: t.transport_type,
          departure_location: t.departure_location,
          arrival_location: t.arrival_location,
          departure_datetime: t.departure_datetime,
          arrival_datetime: t.arrival_datetime,
          carrier: t.carrier,
          booking_reference: t.booking_reference,
          price: t.price,
          currency: t.currency,
        })),
        expenses: (expensesResult.data || []).map((e) => ({
          id: e.id,
          description: e.description,
          amount: e.amount,
          currency: e.currency,
          category: e.category,
          expense_date: e.expense_date,
          paid_by_name: profilesMap[e.paid_by] || "Utente",
        })),
        members: (membersResult.data || []).map((m) => ({
          name: profilesMap[m.user_id] || "Utente",
          role: m.role,
        })),
      };

      await generateTripPDF(exportData, sections);

      setExportSuccess(true);
      toast({
        title: "PDF generato con successo!",
        description: `Il documento "${tripTitle}" è stato scaricato`,
      });

      // Reset and close after delay
      setTimeout(() => {
        setExportSuccess(false);
        onOpenChange(false);
      }, 1500);
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Errore nell'esportazione",
        description: "Impossibile generare il PDF. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            Esporta PDF
          </DialogTitle>
          <DialogDescription>
            Seleziona le sezioni da includere nel documento PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedCount} sezioni selezionate
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                disabled={allSelected}
                className="text-xs"
              >
                Seleziona tutto
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deselectAll}
                disabled={noneSelected}
                className="text-xs"
              >
                Deseleziona tutto
              </Button>
            </div>
          </div>

          <Separator />

          {/* Section Checkboxes */}
          <div className="space-y-3">
            {sectionConfig.map((section) => {
              const Icon = section.icon;
              const isChecked = sections[section.id];

              return (
                <motion.div
                  key={section.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleSection(section.id)}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
                    ${
                      isChecked
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card hover:border-muted-foreground/20"
                    }
                  `}
                >
                  <Checkbox
                    id={section.id}
                    checked={isChecked}
                    onCheckedChange={() => toggleSection(section.id)}
                    className="pointer-events-none"
                  />
                  <div
                    className={`p-2.5 rounded-xl ${section.bgColor} transition-all`}
                  >
                    <Icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={section.id}
                      className="text-sm font-semibold cursor-pointer"
                    >
                      {section.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {section.description}
                    </p>
                  </div>
                  {isChecked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-primary"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Premium Note */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
            <p className="text-xs text-muted-foreground">
              Il PDF include un layout professionale con grafici, tabelle e
              design moderno
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Annulla
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || noneSelected}
            className="min-w-[140px]"
          >
            <AnimatePresence mode="wait">
              {isExporting ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generazione...
                </motion.span>
              ) : exportSuccess ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Completato!
                </motion.span>
              ) : (
                <motion.span
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Scarica PDF
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
