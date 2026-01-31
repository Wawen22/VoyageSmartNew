import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Loader2, Star } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const { subscribe } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  
  // You can set this env variable if you have an annual price ID
  const hasAnnualPlan = Boolean(import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID_ANNUAL);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const priceId = isAnnual && hasAnnualPlan
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
      <DialogContent className="sm:max-w-[480px] p-0 border-0 max-h-[90vh] overflow-y-auto shadow-2xl bg-white dark:bg-slate-950 [&>button:last-child]:bg-white/20 [&>button:last-child]:backdrop-blur-md [&>button:last-child]:rounded-full [&>button:last-child]:text-red-500 [&>button:last-child]:hover:bg-white/30 [&>button:last-child]:opacity-100 [&>button:last-child]:border [&>button:last-child]:border-white/30 [&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:h-8 [&>button:last-child]:w-8 [&>button:last-child]:flex [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child]:transition-all">
        
        {/* Header Section with Gradient */}
        <div className="relative bg-slate-900 px-6 pt-8 pb-12 text-center text-white overflow-hidden">
          {/* Animated Background Mesh */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
             <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-[80px]" />
             <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[150%] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 blur-[80px]" />
          </div>

          <div className="relative z-10">
            <div className="mx-auto w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-lg">
              <Sparkles className="w-6 h-6 text-indigo-300" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight mb-1">
              Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">Pro</span>
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-sm max-w-xs mx-auto">
              Supercharge your travel planning with AI power.
            </DialogDescription>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 relative -mt-6 bg-white dark:bg-slate-950 rounded-t-[1.5rem]">
          
          {/* Billing Toggle */}
          {hasAnnualPlan && (
            <div className="flex justify-center mb-5">
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={cn(
                    "px-5 py-1 rounded-full text-xs font-medium transition-all",
                    !isAnnual ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  Mensile
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={cn(
                    "px-5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-2",
                    isAnnual ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  Annuale
                  <Badge variant="secondary" className="h-3.5 px-1 text-[9px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100">-17%</Badge>
                </button>
              </div>
            </div>
          )}

          {/* Pricing Display */}
          <div className="text-center mb-6">
            <div className="flex items-end justify-center gap-1">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {isAnnual ? "€49.99" : "€4.99"}
              </span>
              <span className="text-slate-500 mb-1 text-sm">
                /{isAnnual ? "anno" : "mese"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {isAnnual ? "Fatturato annualmente. Cancella quando vuoi." : "Flessibile. Cancella quando vuoi."}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { text: "AI Illimitato", sub: "No limiti" },
              { text: "Export Pro", sub: "PDF & Cal" },
              { text: "Priorità", sub: "Supporto 24h" },
              { text: "Badge Pro", sub: "Status" }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100">
                <div className="mt-0.5 w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{feature.text}</p>
                  <p className="text-[10px] text-slate-500">{feature.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <Button 
            size="lg" 
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 h-11 rounded-xl text-sm shadow-xl shadow-indigo-500/10"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2 fill-current" />}
            {loading ? "Elaborazione..." : "Attiva VoyageSmart Pro"}
          </Button>
          
          <p className="text-center text-[10px] text-slate-400 mt-3">
            Pagamenti sicuri via Stripe. 
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}