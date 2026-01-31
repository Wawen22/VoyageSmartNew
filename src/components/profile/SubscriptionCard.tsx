
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, CreditCard, CheckCircle2, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionDialog } from "@/components/subscription/SubscriptionDialog";

export function SubscriptionCard() {
  const { isPro, aiUsageCount, remainingMessages, manageSubscription } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loading, setLoading] = useState(false);

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

  if (isPro) {
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
