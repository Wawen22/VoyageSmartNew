import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Coins, 
  Ruler, 
  Languages, 
  CloudSun, 
  Calculator,
  ChevronLeft,
  LayoutGrid,
  X
} from "lucide-react";
import { CurrencyConverter } from "./CurrencyConverter";
import { UnitConverter } from "./UnitConverter";
import { Translator } from "./Translator";
import { ToolCard } from "./ToolCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ToolsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ToolType = "menu" | "currency" | "units" | "translate";

export function ToolsDialog({ open, onOpenChange }: ToolsDialogProps) {
  const [activeTool, setActiveTool] = useState<ToolType>("menu");

  const handleToolSelect = (tool: ToolType) => {
    setActiveTool(tool);
  };

  const handleBack = () => {
    setActiveTool("menu");
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case "currency":
        return <CurrencyConverter />;
      case "units":
        return <UnitConverter />;
      case "translate":
        return <Translator />;
      default:
        return null;
    }
  };

  const getToolTitle = () => {
    switch (activeTool) {
      case "currency": return "Convertitore Valuta";
      case "units": return "Convertitore Unità";
      case "translate": return "Traduttore AI";
      default: return "Strumenti di Viaggio";
    }
  };

  const getToolIcon = () => {
    switch (activeTool) {
      case "currency": return Coins;
      case "units": return Ruler;
      case "translate": return Languages;
      default: return LayoutGrid;
    }
  };

  const ToolIcon = getToolIcon();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-background/95 backdrop-blur-2xl border-white/10 shadow-2xl flex flex-col [&>button]:hidden">
        
        {/* Custom Close Button - Glassy Reddish */}
        <div className="absolute right-4 top-4 z-[60]">
          <DialogClose className="h-10 w-10 flex items-center justify-center rounded-full bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-600 hover:bg-red-500/20 hover:text-red-700 transition-all active:scale-95 shadow-lg shadow-red-500/10">
             <X className="h-5 w-5" />
             <span className="sr-only">Chiudi</span>
          </DialogClose>
        </div>

        {/* Unified Header */}
        <div className="flex-none p-6 pb-4 border-b border-border/40 flex items-center justify-between relative z-20 bg-background/50 backdrop-blur-md">
           <div className="flex items-center gap-4 pr-12">
             {activeTool !== "menu" ? (
               <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full hover:bg-muted/80 transition-colors"
                  onClick={handleBack}
               >
                  <ChevronLeft className="w-6 h-6" />
               </Button>
             ) : (
               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                 <LayoutGrid className="w-5 h-5" />
               </div>
             )}
             
             <div>
               <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                 {activeTool !== "menu" && <ToolIcon className="w-6 h-6 text-muted-foreground/50" />}
                 {getToolTitle()}
               </DialogTitle>
               <DialogDescription className="text-base hidden sm:block">
                 {activeTool === "menu" 
                   ? "Seleziona uno strumento per gestire al meglio il tuo viaggio."
                   : "Gestisci le tue necessità in modo rapido e semplice."
                 }
               </DialogDescription>
             </div>
           </div>
        </div>

        {/* Content Area - Fixed Size Container */}
        <div className="flex-1 relative overflow-hidden bg-muted/10">
          <AnimatePresence mode="wait">
            {activeTool === "menu" ? (
              <motion.div 
                key="menu"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ScrollArea className="h-full p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <ToolCard 
                      index={0}
                      title="Convertitore Valuta"
                      description="Tassi di cambio aggiornati in tempo reale per oltre 150 valute mondiali."
                      icon={Coins}
                      theme="amber"
                      onClick={() => handleToolSelect("currency")}
                    />
                    <ToolCard 
                      index={1}
                      title="Convertitore Unità"
                      description="Converti facilmente lunghezze, pesi e temperature (Metric/Imperial)."
                      icon={Ruler}
                      theme="emerald"
                      onClick={() => handleToolSelect("units")}
                    />
                    <ToolCard 
                      index={2}
                      title="Traduttore AI"
                      description="Traduci frasi e testi istantaneamente in qualsiasi lingua con l'IA."
                      icon={Languages}
                      theme="indigo"
                      onClick={() => handleToolSelect("translate")}
                    />
                    
                    {/* Coming Soon */}
                    <div className="opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all cursor-not-allowed">
                        <ToolCard 
                          index={3}
                          title="Meteo Avanzato"
                          description="Previsioni dettagliate per tutte le tappe."
                          icon={CloudSun}
                          theme="sky"
                          onClick={() => {}} 
                        />
                    </div>
                     <div className="opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all cursor-not-allowed">
                        <ToolCard 
                          index={4}
                          title="Split Count"
                          description="Dividi le spese di gruppo in modo rapido."
                          icon={Calculator}
                          theme="rose"
                          onClick={() => {}} 
                        />
                    </div>
                  </div>
                </ScrollArea>
              </motion.div>
            ) : (
              <motion.div 
                key="tool"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                 <ScrollArea className="h-full p-6 md:p-10">
                    <div className="max-w-5xl mx-auto h-full flex flex-col justify-center min-h-[50vh]">
                       {renderActiveTool()}
                    </div>
                 </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </DialogContent>
    </Dialog>
  );
}
