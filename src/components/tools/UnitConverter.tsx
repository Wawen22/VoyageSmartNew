import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Thermometer, Weight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type UnitType = "length" | "weight" | "temp";

export function UnitConverter() {
  const [activeTab, setActiveTab] = useState<UnitType>("length");
  const [value, setValue] = useState<string>("");
  const [fromUnit, setFromUnit] = useState<string>("km");
  const [toUnit, setToUnit] = useState<string>("mi");

  const convert = (val: number, from: string, to: string, type: UnitType): number => {
    if (type === "length") {
      const factors: Record<string, number> = { m: 1, km: 1000, mi: 1609.34, ft: 0.3048, cm: 0.01};
      const meters = val * factors[from];
      return meters / factors[to];
    }
    if (type === "weight") {
      const factors: Record<string, number> = { g: 1, kg: 1000, lb: 453.592, oz: 28.3495 };
      const grams = val * factors[from];
      return grams / factors[to];
    }
    if (type === "temp") {
      if (from === to) return val;
      if (from === "c" && to === "f") return (val * 9/5) + 32;
      if (from === "f" && to === "c") return (val - 32) * 5/9;
    }
    return val;
  };

  const result = value && !isNaN(Number(value)) 
    ? convert(Number(value), fromUnit, toUnit, activeTab).toFixed(2) 
    : "---";

  const renderSelect = (val: string, setVal: (v: string) => void, align: "start" | "end" = "start") => {
    return (
      <Select value={val} onValueChange={setVal}>
        <SelectTrigger className="w-full h-12 bg-muted/50 border-0 rounded-xl font-bold text-lg hover:bg-muted transition-colors">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align={align}>
          {activeTab === "length" && (
            <>
              <SelectItem value="km">Chilometri (km)</SelectItem>
              <SelectItem value="mi">Miglia (mi)</SelectItem>
              <SelectItem value="m">Metri (m)</SelectItem>
              <SelectItem value="ft">Piedi (ft)</SelectItem>
              <SelectItem value="cm">Centimetri (cm)</SelectItem>
            </>
          )}
          {activeTab === "weight" && (
            <>
              <SelectItem value="kg">Chilogrammi (kg)</SelectItem>
              <SelectItem value="lb">Libbre (lb)</SelectItem>
              <SelectItem value="g">Grammi (g)</SelectItem>
              <SelectItem value="oz">Once (oz)</SelectItem>
            </>
          )}
          {activeTab === "temp" && (
            <>
              <SelectItem value="c">Celsius (°C)</SelectItem>
              <SelectItem value="f">Fahrenheit (°F)</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    );
  };

  const handleTabChange = (val: string) => {
    const type = val as UnitType;
    setActiveTab(type);
    setValue("");
    if (type === "length") { setFromUnit("km"); setToUnit("mi"); }
    if (type === "weight") { setFromUnit("kg"); setToUnit("lb"); }
    if (type === "temp") { setFromUnit("c"); setToUnit("f"); }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center gap-8">
      
      {/* Category Tabs */}
      <div className="mx-auto w-full max-w-md">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-12 rounded-2xl">
            <TabsTrigger 
                value="length" 
                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 transition-all"
            >
                <Ruler className="w-4 h-4 mr-2"/>Lunghezza
            </TabsTrigger>
            <TabsTrigger 
                value="weight"
                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 transition-all"
            >
                <Weight className="w-4 h-4 mr-2"/>Peso
            </TabsTrigger>
            <TabsTrigger 
                value="temp"
                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 transition-all"
            >
                <Thermometer className="w-4 h-4 mr-2"/>Temp.
            </TabsTrigger>
            </TabsList>
        </Tabs>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
          
          {/* FROM Card */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all">
             <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4 block">Valore</Label>
             <div className="flex flex-col gap-4">
                <Input 
                    type="number" 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)} 
                    placeholder="0"
                    className="text-4xl md:text-5xl font-bold bg-transparent border-0 p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/30"
                />
                {renderSelect(fromUnit, setFromUnit)}
             </div>
          </div>

          {/* Divider Arrow */}
          <div className="flex justify-center text-muted-foreground/30">
              <ArrowRight className="w-8 h-8 md:rotate-0 rotate-90" />
          </div>

          {/* TO Card */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all bg-emerald-500/5 dark:bg-emerald-500/10">
             <Label className="text-xs font-bold uppercase text-emerald-600/70 dark:text-emerald-400/70 tracking-wider mb-4 block">Risultato</Label>
             <div className="flex flex-col gap-4">
                <div className="h-[48px] md:h-[60px] flex items-center text-4xl md:text-5xl font-bold text-emerald-700 dark:text-emerald-400 truncate">
                    {result}
                </div>
                {renderSelect(toUnit, setToUnit)}
             </div>
          </div>
      </div>
    </div>
  );
}
