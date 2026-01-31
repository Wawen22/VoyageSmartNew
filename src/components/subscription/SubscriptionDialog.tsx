
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const { subscribe } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const hasAnnualPlan = Boolean(import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID_ANNUAL);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const priceId =
        plan === "annual"
          ? import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID_ANNUAL
          : import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID;
      await subscribe(priceId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden border-0 p-0">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
        
        <DialogHeader className="p-6 pb-0 relative z-10">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center font-bold">
            Passa a <span className="text-indigo-600 dark:text-indigo-400">VoyageSmart Pro</span>
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            Sblocca tutto il potenziale del tuo assistente di viaggio.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4 relative z-10">
          <div className="bg-card/50 border rounded-xl p-4 space-y-3">
            {[
              "Messaggi AI Illimitati",
              "Accesso prioritario alle nuove feature",
              "Supporto Premium",
              "Badge Pro sul profilo"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPlan("monthly")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                plan === "monthly"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-border bg-card/60 text-foreground/80"
              }`}
            >
              €4.99 / mese
            </button>
            <button
              type="button"
              onClick={() => setPlan("annual")}
              disabled={!hasAnnualPlan}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                plan === "annual"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-border bg-card/60 text-foreground/80"
              } ${!hasAnnualPlan ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              €50 / anno
            </button>
          </div>

          <div className="text-center">
            <span className="text-3xl font-bold">
              {plan === "annual" ? "€50" : "€4.99"}
            </span>
            <span className="text-muted-foreground">
              {plan === "annual" ? "/anno" : "/mese"}
            </span>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 relative z-10">
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/25"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2 fill-current" />}
            {loading ? "Reindirizzamento..." : "Attiva Pro Ora"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
