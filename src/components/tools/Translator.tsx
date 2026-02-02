import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Languages, Loader2, Copy, Check } from "lucide-react";
import { aiService } from "@/lib/ai/service";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: "en", name: "Inglese" },
  { code: "es", name: "Spagnolo" },
  { code: "fr", name: "Francese" },
  { code: "de", name: "Tedesco" },
  { code: "pt", name: "Portoghese" },
  { code: "ja", name: "Giapponese" },
  { code: "zh", name: "Cinese" },
  { code: "ru", name: "Russo" },
  { code: "ar", name: "Arabo" },
  { code: "hi", name: "Hindi" },
];

export function Translator() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
      
      const response = await aiService.sendMessage([
        { 
          role: "system", 
          content: `Sei un traduttore esperto. Traduci il testo fornito dall'utente in ${targetLangName}. 
          Rispondi SOLO con il testo tradotto, senza spiegazioni o preamboli. Mantiere il tono originale.` 
        },
        { role: "user", content: text }
      ]);

      if (response.content) {
        setTranslation(response.content);
      } else {
        throw new Error("Nessuna risposta");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Errore",
        description: "Impossibile completare la traduzione.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!translation) return;
    navigator.clipboard.writeText(translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ description: "Testo copiato!" });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center text-center space-y-2 mb-2">
        <div className="p-3 bg-primary/10 rounded-full">
          <Languages className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">Traduttore AI</h3>
        <p className="text-sm text-muted-foreground">Traduzioni naturali e contestuali</p>
      </div>

      <div className="space-y-2">
        <Label>Traduci in</Label>
        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Testo originale</Label>
        <Textarea 
          placeholder="Digita o incolla qui..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="resize-none min-h-[100px]"
        />
      </div>

      <Button className="w-full" onClick={handleTranslate} disabled={loading || !text.trim()}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Languages className="w-4 h-4 mr-2" />}
        Traduci ora
      </Button>

      {translation && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <Label className="text-primary font-medium">Risultato</Label>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copyToClipboard}>
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-sm border border-border/50 min-h-[80px]">
            {translation}
          </div>
        </div>
      )}
    </div>
  );
}
