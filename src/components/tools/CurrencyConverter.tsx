import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Loader2, Coins } from "lucide-react";
import { CURRENCIES, getExchangeRate } from "@/lib/currency";

export function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState<number | null>(null);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    // Result clears to force re-calc or we could re-calc immediately
    // but let's just trigger the effect
  };

  useEffect(() => {
    const convert = async () => {
      if (!amount || isNaN(Number(amount))) {
        setResult(null);
        return;
      }
      
      setLoading(true);
      try {
        const rateData = await getExchangeRate(fromCurrency, toCurrency);
        setRate(rateData);
        if (rateData) {
          setResult((Number(amount) * rateData).toFixed(2));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(convert, 500); // Debounce
    return () => clearTimeout(timeout);
  }, [amount, fromCurrency, toCurrency]);

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center text-center space-y-2 mb-6">
        <div className="p-3 bg-primary/10 rounded-full">
          <Coins className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">Convertitore Valuta</h3>
        <p className="text-sm text-muted-foreground">Tassi di cambio aggiornati in tempo reale</p>
      </div>

      <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
        <div className="space-y-2">
          <Label>Da</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} {c.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="icon" className="mb-0.5" onClick={handleSwap}>
          <ArrowRightLeft className="w-4 h-4" />
        </Button>

        <div className="space-y-2">
          <Label>A</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} {c.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Importo</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-lg font-medium"
        />
      </div>

      <div className="bg-muted/30 rounded-lg p-4 text-center border border-border/50">
        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div>
            <div className="text-3xl font-bold tracking-tight text-primary">
              {result ? `${CURRENCIES.find(c => c.code === toCurrency)?.symbol} ${result}` : "---"}
            </div>
            {rate && (
              <p className="text-xs text-muted-foreground mt-1">
                1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
