import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Thermometer, Weight, ArrowRight } from "lucide-react";

type UnitType = "length" | "weight" | "temp";

export function UnitConverter() {
  const [activeTab, setActiveTab] = useState<UnitType>("length");
  const [value, setValue] = useState<string>("");
  const [fromUnit, setFromUnit] = useState<string>("km");
  const [toUnit, setToUnit] = useState<string>("mi");

  const convert = (val: number, from: string, to: string, type: UnitType): number => {
    if (type === "length") {
      // Base: meters
      const factors: Record<string, number> = { m: 1, km: 1000, mi: 1609.34, ft: 0.3048, cm: 0.01};
      const meters = val * factors[from];
      return meters / factors[to];
    }
    if (type === "weight") {
      // Base: grams
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

  const renderSelect = (val: string, setVal: (v: string) => void) => {
    return (
      <Select value={val} onValueChange={setVal}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {activeTab === "length" && (
            <>
              <SelectItem value="km">Chilometri (km)</SelectItem>
              <SelectItem value="mi">Miglia (mi)</SelectItem>
              <SelectItem value="m">Metri (m)</SelectItem>
              <SelectItem value="ft">Piedi (ft)</SelectItem>
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

  // Reset units when tab changes
  const handleTabChange = (val: string) => {
    const type = val as UnitType;
    setActiveTab(type);
    setValue("");
    if (type === "length") { setFromUnit("km"); setToUnit("mi"); }
    if (type === "weight") { setFromUnit("kg"); setToUnit("lb"); }
    if (type === "temp") { setFromUnit("c"); setToUnit("f"); }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center text-center space-y-2 mb-2">
        <div className="p-3 bg-primary/10 rounded-full">
          <Ruler className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">Convertitore Unità</h3>
        <p className="text-sm text-muted-foreground">Misure internazionali facili</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="length"><Ruler className="w-4 h-4 mr-2"/>Lunghezza</TabsTrigger>
          <TabsTrigger value="weight"><Weight className="w-4 h-4 mr-2"/>Peso</TabsTrigger>
          <TabsTrigger value="temp"><Thermometer className="w-4 h-4 mr-2"/>Temp.</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end pt-4">
        <div className="space-y-2">
          <Label>Da</Label>
          {renderSelect(fromUnit, setFromUnit)}
        </div>
        <div className="mb-2.5 text-muted-foreground">
          <ArrowRight className="w-4 h-4" />
        </div>
        <div className="space-y-2">
          <Label>A</Label>
          {renderSelect(toUnit, setToUnit)}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Valore</Label>
        <Input 
          type="number" 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          placeholder="Inserisci valore..."
          className="text-lg"
        />
      </div>

      <div className="bg-muted/30 rounded-lg p-4 text-center border border-border/50">
        <div className="text-3xl font-bold tracking-tight text-primary">
          {result} <span className="text-sm font-normal text-muted-foreground">{toUnit}</span>
        </div>
      </div>
    </div>
  );
}
