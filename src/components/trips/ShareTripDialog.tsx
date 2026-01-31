import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Share2, Copy, Check, Link2, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShareTripDialogProps {
  tripId: string;
  tripTitle: string;
  isPublicShared: boolean;
  publicShareToken: string | null;
  onUpdate: () => void;
}

export function ShareTripDialog({ 
  tripId, 
  tripTitle, 
  isPublicShared, 
  publicShareToken,
  onUpdate 
}: ShareTripDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = publicShareToken 
    ? `${window.location.origin}/share/${publicShareToken}`
    : null;

  const handleToggleShare = async (enabled: boolean) => {
    setLoading(true);
    try {
      if (enabled) {
        // Generate new token
        const newToken = crypto.randomUUID();
        const { error } = await supabase
          .from("trips")
          .update({ 
            is_public_shared: true, 
            public_share_token: newToken 
          })
          .eq("id", tripId);

        if (error) throw error;

        toast({
          title: "Link pubblico attivato",
          description: "Il link è stato generato con successo",
        });
      } else {
        // Disable sharing
        const { error } = await supabase
          .from("trips")
          .update({ 
            is_public_shared: false, 
            public_share_token: null 
          })
          .eq("id", tripId);

        if (error) throw error;

        toast({
          title: "Link pubblico disattivato",
          description: "Il viaggio non è più condiviso pubblicamente",
        });
      }

      onUpdate();
    } catch (error: any) {
      console.error("Error toggling share:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare le impostazioni di condivisione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copiato!",
        description: "Il link è stato copiato negli appunti",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare il link",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateLink = async () => {
    setLoading(true);
    try {
      const newToken = crypto.randomUUID();
      const { error } = await supabase
        .from("trips")
        .update({ public_share_token: newToken })
        .eq("id", tripId);

      if (error) throw error;

      toast({
        title: "Link rigenerato",
        description: "Il vecchio link non funzionerà più",
      });

      onUpdate();
    } catch (error: any) {
      console.error("Error regenerating link:", error);
      toast({
        title: "Errore",
        description: "Impossibile rigenerare il link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Condividi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Condividi "{tripTitle}"
          </DialogTitle>
          <DialogDescription>
            Genera un link pubblico per condividere questo viaggio con chiunque, senza bisogno di un account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-share" className="text-base">
                Link pubblico
              </Label>
              <p className="text-sm text-muted-foreground">
                Chiunque con il link può vedere il viaggio
              </p>
            </div>
            <Switch
              id="public-share"
              checked={isPublicShared}
              onCheckedChange={handleToggleShare}
              disabled={loading}
            />
          </div>

          {/* Link section */}
          {isPublicShared && shareUrl && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(shareUrl, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Anteprima
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerateLink}
                  disabled={loading}
                  className="gap-2 text-muted-foreground"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Rigenera link
                </Button>
              </div>

              <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                💡 <strong>Nota:</strong> La vista pubblica mostra solo le informazioni essenziali: 
                itinerario, trasporti e alloggi. Non include spese, checklist o dati personali.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
