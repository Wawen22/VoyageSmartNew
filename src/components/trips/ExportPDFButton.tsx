import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, Loader2, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFPreviewDialog } from "./PDFPreviewDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionDialog } from "@/components/subscription/SubscriptionDialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExportPDFButtonProps {
  tripId: string;
  tripTitle: string;
}

export function ExportPDFButton({ tripId, tripTitle }: ExportPDFButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const { isPro } = useSubscription();

  const handleClick = () => {
    if (!isPro) {
      setShowSubscriptionDialog(true);
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Button
        variant={!isPro ? "outline" : "outline"}
        onClick={handleClick}
        className={cn(
          "relative overflow-hidden gap-2 transition-all",
          !isPro && "border-dashed text-muted-foreground hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
        )}
      >
        <FileDown className="w-4 h-4" />
        Esporta PDF
        {!isPro && (
          <Badge variant="secondary" className="ml-1 h-5 px-1 text-[9px] bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
            PRO
          </Badge>
        )}
      </Button>

      <PDFPreviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tripId={tripId}
        tripTitle={tripTitle}
      />
      
      <SubscriptionDialog 
        open={showSubscriptionDialog} 
        onOpenChange={setShowSubscriptionDialog} 
      />
    </>
  );
}
