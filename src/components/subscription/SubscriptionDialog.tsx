import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Loader2, Star, X, Crown, ShieldCheck, Globe, Trophy, CreditCard, ChevronRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const { subscribe } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  
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
      <DialogContent className="w-[95%] sm:max-w-[500px] p-0 border-0 overflow-hidden shadow-2xl bg-background/80 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] max-h-[92vh] overflow-y-auto">
        <DialogClose className="absolute right-3 top-3 z-50 rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all">
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Chiudi</span>
        </DialogClose>

        {/* Hero Section */}
        <div className="relative overflow-hidden pt-10 pb-8 sm:pt-12 sm:pb-10 px-6 sm:px-8 text-center bg-slate-950">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 opacity-40">
             <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[100%] rounded-full bg-indigo-600/40 blur-[100px] animate-pulse" />
             <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[100%] rounded-full bg-purple-600/40 blur-[100px] animate-pulse delay-700" />
          </div>

          {/* Watermark Icon */}
          <div className="absolute -right-12 -top-12 opacity-[0.05] pointer-events-none">
            <Crown className="w-32 h-32 sm:w-48 sm:h-48 text-white rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"
            >
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 fill-amber-400/20" />
            </motion.div>
            
            <DialogTitle className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-2 sm:mb-3">
              VoyageSmart <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">Pro</span>
            </DialogTitle>
            <DialogDescription className="text-white/60 text-sm sm:text-lg max-w-xs mx-auto leading-relaxed">
              Sblocca l'esperienza di viaggio definitiva con AI illimitata.
            </DialogDescription>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 bg-card dark:bg-slate-900/50">
          
          {/* Toggle Mensile/Annuale */}
          {hasAnnualPlan && (
            <div className="flex justify-center">
              <div className="flex items-center p-1 bg-muted/50 backdrop-blur-sm rounded-[1rem] border border-white/5">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={cn(
                    "px-4 py-1.5 sm:px-6 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
                    !isAnnual ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Mensile
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={cn(
                    "px-4 py-1.5 sm:px-6 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    isAnnual ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Annuale
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[8px] sm:text-[9px] font-black px-1 py-0">-17%</Badge>
                </button>
              </div>
            </div>
          )}

          {/* Pricing Card */}
          <div className="text-center bg-gradient-to-br from-primary/5 via-primary/2 to-transparent p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-primary/10 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
               <CreditCard className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground tabular-nums">
                  {isAnnual ? "€49.99" : "€4.99"}
                </span>
                <span className="text-muted-foreground font-bold text-base sm:text-lg">
                  /{isAnnual ? "anno" : "mese"}
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1 sm:text-2">
                {isAnnual ? "Fatturazione Annuale" : "Abbonamento Flessibile"}
              </p>
            </div>
          </div>

          {/* Features Grid - Always 2 columns */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: Zap, text: "AI Illimitata", color: "text-amber-500", bg: "bg-amber-500/10" },
              { icon: ShieldCheck, text: "Vault Cifrato", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { icon: Globe, text: "Export HD", color: "text-indigo-500", bg: "bg-indigo-500/10" },
              { icon: Trophy, text: "Badge Pro", color: "text-rose-500", bg: "bg-rose-500/10" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className={cn("p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all group-hover:scale-110 shrink-0", feature.bg)}>
                  <feature.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", feature.color)} />
                </div>
                <span className="font-bold text-[10px] sm:text-sm text-foreground/80 leading-tight">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4 pt-2 sm:pt-4">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:shadow-2xl hover:shadow-primary/30 h-14 sm:h-16 rounded-xl sm:rounded-[1.5rem] text-base sm:text-lg font-black tracking-tight transition-all active:scale-[0.98]"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2 sm:mr-3" />
              ) : (
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 fill-white" />
              )}
              {loading ? "ELABORAZIONE..." : "ATTIVA ORA PRO"}
            </Button>
            
            <div className="flex flex-col items-center gap-2">
              <p className="flex items-center gap-1.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />
                Sicurezza Stripe Garantita
              </p>
              <p className="text-[8px] sm:text-[9px] text-muted-foreground/60 max-w-[200px] text-center leading-tight">
                Cancella quando vuoi con un click. Nessun costo nascosto.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
