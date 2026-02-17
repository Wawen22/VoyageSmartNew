import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, TrendingUp, RefreshCw, Coins, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCurrencyRate } from "@/hooks/useCurrencyRate";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CurrencyWidgetProps {
  tripCurrency: string; // Target currency passed from parent (may be EUR)
  userCurrency?: string; // Base currency (e.g., 'EUR'), defaults to EUR
}

// Common currencies list for quick selection
const CURRENCIES = ["EUR", "USD", "GBP", "JPY", "CHF", "AUD", "CAD", "CNY"];

export function CurrencyWidget({ tripCurrency, userCurrency = "EUR" }: CurrencyWidgetProps) {
  // If tripCurrency is same as userCurrency (e.g., EUR), default target to USD so the widget is useful.
  const initialTarget = tripCurrency === userCurrency ? "USD" : tripCurrency;
  
  const [targetCurrency, setTargetCurrency] = useState(initialTarget);
  const [amount, setAmount] = useState<string>("1");
  const [isSwapped, setIsSwapped] = useState(false);
  
  const from = isSwapped ? targetCurrency : userCurrency;
  const to = isSwapped ? userCurrency : targetCurrency;

  const { data: rate, isLoading } = useCurrencyRate(from, to);

  const inputValue = parseFloat(amount) || 0;
  const resultValue = rate ? (inputValue * rate).toFixed(2) : "...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[200px] h-full",
        "bg-gradient-to-br from-amber-400/10 via-yellow-500/5 to-orange-500/10",
        "border border-amber-500/20 hover:border-amber-500/40 transition-colors group"
      )}
    >
      {/* Decorative */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
      <Coins strokeWidth={1} className="absolute bottom-[-20px] right-[-20px] w-24 h-24 text-amber-500/10 transform -rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
               <ArrowRightLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Cambio
            </span>
        </div>
        {rate && (
           <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-white/20 dark:bg-white/5 px-2 py-1 rounded-full border border-white/10 dark:border-white/5">
              <TrendingUp className="w-3 h-3 text-amber-500" />
              1 {from} = {rate.toFixed(2)} {to}
           </div>
        )}
      </div>

      {/* Converter Content */}
      <div className="mt-4 relative z-10 space-y-3">
         {/* Input Row (FROM) */}
         <div className="flex items-center gap-2 bg-background/50 dark:bg-black/20 rounded-2xl p-2 border border-black/5 dark:border-white/5 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all">
            <span className="text-sm font-bold text-muted-foreground pl-2">{from}</span>
            <Input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-0 bg-transparent text-right font-bold text-lg p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
              placeholder="0"
            />
         </div>

         {/* Arrow Down / Swap */}
         <div className="flex justify-center -my-1">
             <Button 
               variant="ghost" 
               size="icon" 
               className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-200 hover:text-amber-700"
               onClick={() => setIsSwapped(!isSwapped)}
             >
                <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
             </Button>
         </div>

         {/* Result Row (TO) */}
         <div className="flex items-center justify-between bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl p-2 pr-3 border border-amber-500/20">
            {/* Target Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-200/50">
                   {to} <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {CURRENCIES.map(curr => (
                   <DropdownMenuItem 
                      key={curr} 
                      onClick={() => {
                        // If swapped, 'to' is userCurrency (fixed base). So we must flip swap to change target.
                        // Actually simplified: 'targetCurrency' state always tracks the foreign one.
                        // 'isSwapped' just flips display.
                        setTargetCurrency(curr);
                      }}
                   >
                      {curr}
                   </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-xl font-bold text-amber-700 dark:text-amber-300 tracking-tight">
               {isLoading ? "..." : resultValue}
            </span>
         </div>
      </div>
    </motion.div>
  );
}