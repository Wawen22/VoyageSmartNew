import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFPreviewDialog } from "./PDFPreviewDialog";

interface ExportPDFButtonProps {
  tripId: string;
  tripTitle: string;
}

export function ExportPDFButton({ tripId, tripTitle }: ExportPDFButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
        className="relative overflow-hidden"
      >
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Esporta PDF
        </motion.span>
      </Button>

      <PDFPreviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tripId={tripId}
        tripTitle={tripTitle}
      />
    </>
  );
}
