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
  className?: string;
  size?: "default" | "sm" | "icon" | "lg";
  forceShowLabel?: boolean;
}

export function ExportPDFButton({ tripId, tripTitle, className, size = "default", forceShowLabel }: ExportPDFButtonProps) {
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
        size={size}
        className={cn(
          "relative overflow-hidden gap-2 transition-all group duration-300",
          !isPro && "border-amber-200 text-amber-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50/50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20",
          isPro && "hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)] active:scale-95",
          className
        )}
      >
        <FileDown className="w-4 h-4" />
        <span className={cn("hidden md:inline", forceShowLabel && "inline")}>Esporta PDF</span>
        {!isPro && (
          <Badge variant="secondary" className={cn("hidden md:inline-flex ml-1 h-5 px-1 text-[9px] bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800", forceShowLabel && "inline-flex")}>
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
