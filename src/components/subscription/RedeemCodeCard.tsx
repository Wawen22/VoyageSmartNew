import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Clock, 
  PartyPopper,
  History,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { usePromoCode, UserRedemption } from "@/hooks/usePromoCode";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface RedemptionSuccessState {
  show: boolean;
  message: string;
  benefit: string;
  type: string;
}

export function RedeemCodeCard() {
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState<RedemptionSuccessState | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<UserRedemption[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const { redeemCode, getRedemptionHistory, loading, error, clearError } = usePromoCode();

  // Load redemption history when component mounts or history section opens
  useEffect(() => {
    if (showHistory && history.length === 0) {
      loadHistory();
    }
  }, [showHistory]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const data = await getRedemptionHistory();
    setHistory(data);
    setHistoryLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;

    clearError();
    setSuccess(null);

    const result = await redeemCode(code);

    if (result.success) {
      setSuccess({
        show: true,
        message: result.message,
        benefit: result.benefit || "",
        type: result.type || "trial",
      });
      setCode("");
      // Refresh history if it was previously loaded
      if (history.length > 0) {
        loadHistory();
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lifetime":
        return <Sparkles className="w-4 h-4" />;
      case "trial":
        return <Clock className="w-4 h-4" />;
      case "subscription":
        return <CheckCircle2 className="w-4 h-4" />;
      case "discount":
        return <Gift className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "lifetime":
        return "Lifetime";
      case "trial":
        return "Prova";
      case "subscription":
        return "Abbonamento";
      case "discount":
        return "Sconto";
      default:
        return type;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "lifetime":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0";
      case "trial":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0";
      case "subscription":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0";
      case "discount":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0";
      default:
        return "";
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900/50 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="w-5 h-5 text-indigo-500" />
          Codice Promozionale
        </CardTitle>
        <CardDescription>
          Hai un codice? Inseriscilo qui per attivare i tuoi vantaggi.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Success Message */}
        {success?.show && (
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 p-4">
            <div className="absolute top-0 right-0 opacity-10">
              <PartyPopper className="w-20 h-20 text-green-500 transform rotate-12" />
            </div>
            <div className="flex items-start gap-3 relative z-10">
              <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-2 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-green-800 dark:text-green-200">{success.message}</p>
                {success.benefit && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn("text-xs", getTypeBadgeClass(success.type))}>
                      {getTypeIcon(success.type)}
                      <span className="ml-1">{getTypeLabel(success.type)}</span>
                    </Badge>
                    <span className="text-sm text-green-700 dark:text-green-300">{success.benefit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-100 dark:bg-red-900/50 p-2 shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Controlla il codice e riprova.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Code Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Inserisci il codice"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (error) clearError();
                if (success) setSuccess(null);
              }}
              disabled={loading}
              className={cn(
                "uppercase tracking-wider font-mono text-center",
                "border-slate-300 dark:border-slate-700",
                "focus:border-indigo-500 focus:ring-indigo-500",
                "placeholder:normal-case placeholder:tracking-normal placeholder:font-sans",
                error && "border-red-300 dark:border-red-700"
              )}
              maxLength={30}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !code.trim()}
            className={cn(
              "px-6 shrink-0",
              "bg-gradient-to-r from-indigo-600 to-purple-600",
              "hover:from-indigo-700 hover:to-purple-700",
              "text-white border-0 shadow-md",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifica...
              </>
            ) : (
              "Applica"
            )}
          </Button>
        </form>

        {/* Redemption History Toggle */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Cronologia codici riscattati
            </span>
            {showHistory ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* History List */}
          {showHistory && (
            <div className="mt-2 space-y-2">
              {historyLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  <Gift className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Nessun codice riscattato</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "rounded-full p-2 shrink-0",
                          item.code_type === "lifetime" && "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
                          item.code_type === "trial" && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                          item.code_type === "subscription" && "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                          item.code_type === "discount" && "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        )}>
                          {getTypeIcon(item.code_type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{item.code_name}</p>
                          <p className="text-xs text-muted-foreground">{item.benefit}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(item.code_type)}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(item.redeemed_at), "dd MMM yyyy", { locale: it })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
