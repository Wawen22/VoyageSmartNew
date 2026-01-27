import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, X, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendingInvitations } from "@/hooks/usePendingInvitations";
import { useState } from "react";

export function PendingInvitationsBanner() {
  const { invitations, loading, acceptInvitation, declineInvitation } =
    usePendingInvitations();
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (loading || invitations.length === 0) {
    return null;
  }

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    await acceptInvitation(id);
    setProcessingId(null);
  };

  const handleDecline = async (id: string) => {
    setProcessingId(id);
    await declineInvitation(id);
    setProcessingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="app-section p-4 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/20">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Inviti in sospeso ({invitations.length})
          </h3>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {invitations.map((invitation) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="app-surface p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {invitation.trip?.title || "Viaggio"}
                  </h4>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">
                      {invitation.trip?.destination || "Destinazione"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecline(invitation.id)}
                    disabled={processingId === invitation.id}
                    className="text-muted-foreground"
                  >
                    {processingId === invitation.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Rifiuta
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(invitation.id)}
                    disabled={processingId === invitation.id}
                  >
                    {processingId === invitation.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Accetta
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
