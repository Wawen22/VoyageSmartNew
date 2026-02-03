import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Users, Receipt, Percent, Minus, Plus, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SplitCount() {
  const [amount, setAmount] = useState<string>("");
  const [people, setPeople] = useState<number>(2);
  const [tip, setTip] = useState<number>(0);
  const [result, setResult] = useState<{ perPerson: string; totalTip: string; totalBill: string }>({
    perPerson: "0.00",
    totalTip: "0.00",
    totalBill: "0.00"
  });

  useEffect(() => {
    const bill = parseFloat(amount);
    if (!bill || isNaN(bill)) {
      setResult({ perPerson: "0.00", totalTip: "0.00", totalBill: "0.00" });
      return;
    }

    const tipAmount = bill * (tip / 100);
    const total = bill + tipAmount;
    const split = total / people;

    setResult({
      perPerson: split.toFixed(2),
      totalTip: tipAmount.toFixed(2),
      totalBill: total.toFixed(2)
    });
  }, [amount, people, tip]);

  const TIP_OPTIONS = [0, 5, 10, 15, 20];

  return (
    <div className="w-full h-full flex flex-col gap-6">
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        
        {/* Left Column: Inputs */}
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Bill Amount */}
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider ml-1">Totale Conto</Label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">€</span>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-16 pl-10 text-3xl font-bold bg-card/50 border-border/60 rounded-2xl focus-visible:ring-rose-500/30 shadow-sm"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* People Control */}
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider ml-1">Persone</Label>
                    <span className="text-lg font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-0.5 rounded-lg">
                        {people}
                    </span>
                </div>
                
                <div className="bg-card/50 border border-border/60 rounded-2xl p-4 flex items-center gap-4">
                    <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-10 w-10 rounded-xl shrink-0"
                        onClick={() => setPeople(Math.max(1, people - 1))}
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <Slider 
                        value={[people]} 
                        onValueChange={(v) => setPeople(v[0])} 
                        max={20} 
                        min={1} 
                        step={1}
                        className="flex-1 [&_[role=slider]]:bg-rose-400 [&_[role=slider]]:border-rose-500 [&_.relative]:bg-rose-200"
                    />
                    <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-10 w-10 rounded-xl shrink-0 hover:border-rose-300 hover:text-rose-500"
                        onClick={() => setPeople(Math.min(50, people + 1))}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Tip Selection */}
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider ml-1">Mancia ({tip}%)</Label>
                <div className="flex flex-wrap gap-2 p-1">
                    {TIP_OPTIONS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTip(t)}
                            className={cn(
                                "flex-1 min-w-[60px] py-2 rounded-xl text-sm font-bold border transition-all duration-200",
                                tip === t 
                                    ? "bg-rose-400 text-white border-rose-500 shadow-md shadow-rose-400/20 scale-105" 
                                    : "bg-background border-border/60 text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {t === 0 ? "No" : `${t}%`}
                        </button>
                    ))}
                </div>
            </div>

        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4">
            <div className="flex-1 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                
                <div className="space-y-1 relative z-10">
                    <p className="text-rose-600/70 dark:text-rose-400/70 text-sm font-bold uppercase tracking-widest">A Persona</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl md:text-6xl font-bold tracking-tighter text-rose-700 dark:text-rose-400">€{result.perPerson}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-rose-500/10 relative z-10">
                    <div>
                        <p className="text-rose-600/60 dark:text-rose-400/60 text-[10px] font-bold uppercase mb-1">Mancia Totale</p>
                        <p className="text-xl font-bold text-rose-700 dark:text-rose-300">€{result.totalTip}</p>
                    </div>
                    <div>
                        <p className="text-rose-600/60 dark:text-rose-400/60 text-[10px] font-bold uppercase mb-1">Conto Totale</p>
                        <p className="text-xl font-bold text-rose-700 dark:text-rose-300">€{result.totalBill}</p>
                    </div>
                </div>
            </div>

            <Button 
                className="w-full h-14 text-lg font-bold rounded-2xl bg-card border-2 border-dashed border-border/60 text-muted-foreground hover:bg-rose-500/5 hover:text-rose-600 hover:border-rose-500/20 dark:hover:bg-rose-500/10 transition-all gap-2"
                variant="ghost"
                onClick={() => {
                    if (navigator.share) {
                        navigator.share({
                            title: 'Split Count',
                            text: `Conto diviso: €${result.perPerson} a testa su un totale di €${result.totalBill}.`,
                        }).catch(console.error);
                    }
                }}
            >
                <Share2 className="w-5 h-5" />
                Condividi Risultato
            </Button>
        </div>

      </div>
    </div>
  );
}
