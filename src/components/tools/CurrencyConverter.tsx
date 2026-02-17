import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Loader2, TrendingUp, ArrowRight } from "lucide-react";
import { CURRENCIES, getExchangeRate } from "@/lib/currency";
import { cn } from "@/lib/utils";

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
    const timeout = setTimeout(convert, 500); 
    return () => clearTimeout(timeout);
  }, [amount, fromCurrency, toCurrency]);

  return (
    <div className="w-full h-full flex flex-col justify-center gap-8">
      {/* Rate Info Pill */}
      {rate && (
        <div className="mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-sm font-medium animate-in fade-in slide-in-from-top-4">
           <TrendingUp className="w-4 h-4" />
           <span>1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</span>
        </div>
      )}

      {/* Main Grid: Input -> Swap -> Output */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
          
          {/* FROM Card */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all group">
             <div className="flex justify-between items-center mb-4">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Da</Label>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    {CURRENCIES.find(c => c.code === fromCurrency)?.symbol}
                </span>
             </div>
             
             <div className="flex flex-col gap-4">
                <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-4xl md:text-5xl font-bold bg-transparent border-0 p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/30"
                    placeholder="0"
                />
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="w-full h-12 bg-muted/50 border-0 rounded-xl font-bold text-lg hover:bg-muted transition-colors">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {CURRENCIES.map((c) => (
                            <SelectItem key={c.code} value={c.code} className="font-medium">
                                <span className="mr-2 text-muted-foreground">{c.symbol}</span> {c.code}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
          </div>

          {/* Swap Button (Center) */}
          <div className="flex md:flex-col justify-center items-center gap-2">
              <div className="hidden md:block w-px h-12 bg-border/50" />
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full h-12 w-12 bg-background border-border shadow-sm hover:border-amber-500 hover:text-amber-500 hover:scale-110 transition-all"
                onClick={handleSwap}
              >
                 <ArrowRightLeft className="w-5 h-5" />
              </Button>
              <div className="hidden md:block w-px h-12 bg-border/50" />
          </div>

          {/* TO Card */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all group bg-amber-500/5 dark:bg-amber-500/10">
             <div className="flex justify-between items-center mb-4">
                <Label className="text-xs font-bold uppercase text-amber-600/70 dark:text-amber-400/70 tracking-wider">A</Label>
                <span className="text-xs font-mono text-amber-600/70 dark:text-amber-400/70 bg-amber-500/10 px-2 py-1 rounded">
                    {CURRENCIES.find(c => c.code === toCurrency)?.symbol}
                </span>
             </div>
             
             <div className="flex flex-col gap-4">
                <div className="h-[48px] md:h-[60px] flex items-center text-4xl md:text-5xl font-bold text-amber-700 dark:text-amber-400 truncate">
                    {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                    ) : (
                        result || "0.00"
                    )}
                </div>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="w-full h-12 bg-white/50 dark:bg-white/5 border-0 rounded-xl font-bold text-lg hover:bg-white/80 dark:hover:bg-white/10 transition-colors text-amber-800 dark:text-amber-300">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {CURRENCIES.map((c) => (
                            <SelectItem key={c.code} value={c.code} className="font-medium">
                                <span className="mr-2 text-muted-foreground">{c.symbol}</span> {c.code}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
          </div>
      </div>
    </div>
  );
}
