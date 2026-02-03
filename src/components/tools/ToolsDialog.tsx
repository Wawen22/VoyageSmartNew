import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Coins, 
  Ruler, 
  Languages, 
  Calculator, 
  CloudSun, 
  Map as MapIcon,
  ChevronLeft
} from "lucide-react";
import { CurrencyConverter } from "./CurrencyConverter";
import { UnitConverter } from "./UnitConverter";
import { Translator } from "./Translator";
import { ToolCard } from "./ToolCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "bg-card/95 backdrop-blur-2xl border-white/10 p-0 overflow-hidden shadow-2xl transition-all duration-300",
        activeTool === "menu" ? "max-w-4xl h-[85vh] sm:h-auto" : "max-w-md"
      )}>
        
        {/* Header Section */}
        <div className="p-6 pb-2 border-b border-border/40 relative">
           {activeTool !== "menu" && (
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-4 top-5 h-8 w-8 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                onClick={handleBack}
             >
                <ChevronLeft className="w-5 h-5" />
             </Button>
           )}
           
           <DialogHeader className={cn(activeTool !== "menu" && "pl-8")}>
             <DialogTitle className="text-2xl font-bold tracking-tight">
               {activeTool === "menu" ? "Strumenti di Viaggio" : 
                activeTool === "currency" ? "Valuta" :
                activeTool === "units" ? "Unità" : "Traduttore"}
             </DialogTitle>
             <DialogDescription className="text-base">
               {activeTool === "menu" 
                 ? "Seleziona uno strumento per gestire al meglio il tuo viaggio."
                 : "Torna al menu per selezionare un altro strumento."
               }
             </DialogDescription>
           </DialogHeader>
        </div>

        {/* Content Area */}
        <ScrollArea className={cn(
            "p-6",
            activeTool === "menu" ? "h-[calc(85vh-100px)] sm:h-auto" : "max-h-[600px]"
        )}>
          {activeTool === "menu" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
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
              
              {/* Future Placeholders / Coming Soon */}
              <div className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                  <ToolCard 
                    index={3}
                    title="Meteo Avanzato"
                    description="Previsioni dettagliate per tutte le tappe del tuo viaggio."
                    icon={CloudSun}
                    theme="sky"
                    onClick={() => {}} // Disabled
                  />
              </div>
               <div className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                  <ToolCard 
                    index={4}
                    title="Split Count"
                    description="Dividi le spese di gruppo in modo rapido e preciso."
                    icon={Calculator}
                    theme="rose"
                    onClick={() => {}} // Disabled
                  />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               {renderActiveTool()}
            </div>
          )}
        </ScrollArea>

      </DialogContent>
    </Dialog>
  );
}