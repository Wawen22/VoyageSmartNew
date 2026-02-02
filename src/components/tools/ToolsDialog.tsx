import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Ruler, Languages } from "lucide-react";
import { CurrencyConverter } from "./CurrencyConverter";
import { UnitConverter } from "./UnitConverter";
import { Translator } from "./Translator";

interface ToolsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolsDialog({ open, onOpenChange }: ToolsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Strumenti di Viaggio</DialogTitle>
          <DialogDescription>
            Utility rapide per semplificare il tuo viaggio.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="currency" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="currency"><Coins className="w-4 h-4 mr-2"/>Valuta</TabsTrigger>
            <TabsTrigger value="units"><Ruler className="w-4 h-4 mr-2"/>Unità</TabsTrigger>
            <TabsTrigger value="translate"><Languages className="w-4 h-4 mr-2"/>Traduci</TabsTrigger>
          </TabsList>
          
          <TabsContent value="currency">
            <CurrencyConverter />
          </TabsContent>
          
          <TabsContent value="units">
            <UnitConverter />
          </TabsContent>
          
          <TabsContent value="translate">
            <Translator />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
