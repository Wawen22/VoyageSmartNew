import { usePushNotifications, UnsupportedReason } from "@/hooks/usePushNotifications";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BellRing, BellOff, Loader2, ShieldCheck, WifiOff, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

function getUnsupportedMessage(reason: UnsupportedReason): { title: string; description: string } {
  switch (reason) {
    case "https_required":
      return {
        title: "Connessione sicura richiesta",
        description: "Le notifiche push richiedono HTTPS. Accedi al sito tramite una connessione sicura.",
      };
    case "sw_failed":
      return {
        title: "Errore Service Worker",
        description: "Impossibile registrare il service worker. Prova a ricaricare la pagina.",
      };
    case "browser_unsupported":
    default:
      return {
        title: "Notifiche Push non supportate",
        description: "Il tuo browser non supporta le notifiche push. Prova con Chrome, Firefox o Edge aggiornati.",
      };
  }
}

export function PushNotificationToggle() {
  const { isSupported, unsupportedReason, permission, subscription, loading, subscribe, unsubscribe } = usePushNotifications();

  // Show loading while checking support
  if (loading && !isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Verifica supporto notifiche...</p>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    const msg = getUnsupportedMessage(unsupportedReason);
    const Icon = unsupportedReason === "https_required" ? WifiOff 
      : unsupportedReason === "sw_failed" ? AlertTriangle 
      : BellOff;
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 opacity-60">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">{msg.title}</p>
          <p className="text-xs text-muted-foreground">{msg.description}</p>
        </div>
      </div>
    );
  }

  const isEnabled = !!subscription;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/50 to-transparent backdrop-blur-xl p-6 group"
    >
      <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <BellRing className="w-24 h-24" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {isEnabled ? <BellRing className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </div>
          <div className="space-y-1">
            <Label htmlFor="push-toggle" className="text-base font-bold cursor-pointer">
              Notifiche Push
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              {isEnabled 
                ? "Ricevi aggiornamenti su chat, viaggi e sondaggi direttamente sul tuo dispositivo."
                : "Attiva per non perdere mai un aggiornamento importante dai tuoi compagni di viaggio."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          <Switch
            id="push-toggle"
            checked={isEnabled}
            onCheckedChange={(checked) => checked ? subscribe() : unsubscribe()}
            disabled={loading}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      {permission === "denied" && (
        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
          <ShieldCheck className="w-3 h-3" />
          Permesso negato nel browser. Controlla le impostazioni del sito.
        </div>
      )}
    </motion.div>
  );
}
