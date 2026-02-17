
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, CreditCard, CheckCircle2, Sparkles, Gift, Calendar, Clock, Infinity } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionDialog } from "@/components/subscription/SubscriptionDialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface UserRedemption {
  redeemed_at: string;
  trial_ends_at: string | null;
  code_name: string;
  code_type: string;
  benefit: string;
}

export function SubscriptionCard() {
  const { isPro, aiUsageCount, remainingMessages, manageSubscription, isPromoSubscription } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redemptionInfo, setRedemptionInfo] = useState<UserRedemption | null>(null);

  // Fetch user's redemption info if they have a promo subscription
  useEffect(() => {
    const fetchRedemptionInfo = async () => {
      if (isPromoSubscription) {
        const { data, error } = await supabase.rpc("get_user_redemptions");
        if (!error && data && data.length > 0) {
          // Get the most recent redemption
          const latest = data[0];
          setRedemptionInfo({
            redeemed_at: latest.redeemed_at,
            trial_ends_at: latest.trial_ends_at,
            code_name: latest.code_name,
            code_type: latest.code_type,
            benefit: latest.benefit,
          });
        }
      }
    };
    fetchRedemptionInfo();
  }, [isPromoSubscription]);

  const handleManage = async () => {
    setLoading(true);
    try {
      await manageSubscription();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return format(new Date(dateStr), "d MMMM yyyy", { locale: it });
  };

  // Check if subscription is lifetime (type lifetime OR trial_ends_at is null for promo)
  const isLifetime = redemptionInfo?.code_type === 'lifetime' || 
    (isPromoSubscription && redemptionInfo && !redemptionInfo.trial_ends_at);
  
  // Check if trial/subscription is still valid
  const subscriptionEndDate = redemptionInfo?.trial_ends_at || null;
  const isValid = !subscriptionEndDate || new Date(subscriptionEndDate) > new Date();

  if (isPro && isPromoSubscription) {
    // Promo code subscription card
    return (
      <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-950 dark:to-emerald-950/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Gift className="w-24 h-24 text-emerald-500 transform rotate-12" />
        </div>
        
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                VoyageSmart Pro
                <Badge className="bg-emerald-600 hover:bg-emerald-700 border-0">ATTIVO</Badge>
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                Attivato tramite Codice Promozionale
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          {/* Redemption Details */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/50 rounded-lg p-3 space-y-2 border border-emerald-100 dark:border-emerald-900">
            {redemptionInfo?.code_name && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Codice:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-300">{redemptionInfo.code_name}</span>
              </div>
            )}
            {redemptionInfo?.benefit && (
              <div className="flex items-center gap-2 text-sm">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span className="text-muted-foreground">Beneficio:</span>
                <span className="font-medium">{redemptionInfo.benefit}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-muted-foreground">Attivato il:</span>
              <span className="font-medium">{redemptionInfo?.redeemed_at ? formatDate(redemptionInfo.redeemed_at) : formatDate(null)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isLifetime ? (
                <>
                  <Infinity className="w-4 h-4 text-emerald-600" />
                  <span className="text-muted-foreground">Validità:</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    Lifetime / A vita
                  </Badge>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-muted-foreground">Valido fino al:</span>
                  <span className="font-medium">{formatDate(subscriptionEndDate)}</span>
                </>
              )}
            </div>
          </div>

          {/* Features list */}
          <div className="grid gap-2 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> AI Assistant Illimitato
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Dark Mode Pro 🌙
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Export PDF & Calendario
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Supporto Prioritario
            </div>
          </div>
        </CardContent>
        {/* No manage button for promo subscriptions - they don't have Stripe */}
      </Card>
    );
  }

  if (isPro) {
    // Regular Stripe subscription card
    return (
      <Card className="border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-950 dark:to-indigo-950/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-24 h-24 text-indigo-500 transform rotate-12" />
        </div>
        
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                VoyageSmart Pro
                <Badge className="bg-indigo-600 hover:bg-indigo-700 border-0">ATTIVO</Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Hai accesso completo a tutte le funzionalità.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> AI Assistant Illimitato
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Dark Mode Pro 🌙
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Export PDF & Calendario
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Supporto Prioritario
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full bg-white/50 dark:bg-black/20" onClick={handleManage} disabled={loading}>
            <CreditCard className="w-4 h-4 mr-2" />
            Gestisci Abbonamento
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Piano Gratuito
            <Badge variant="secondary">FREE</Badge>
          </CardTitle>
          <CardDescription>
            Passa a Pro per rimuovere i limiti.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Messaggi AI usati</span>
              <span className="font-medium">{aiUsageCount} / 5</span>
            </div>
            <Progress value={(aiUsageCount / 5) * 100} className="h-2" />
            {remainingMessages === 0 && (
              <p className="text-xs text-red-500 font-medium">Limite raggiunto. L'AI è in pausa.</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0" onClick={() => setShowUpgrade(true)}>
            <Zap className="w-4 h-4 mr-2 fill-current" />
            Passa a Pro
          </Button>
        </CardFooter>
      </Card>

      <SubscriptionDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
}
