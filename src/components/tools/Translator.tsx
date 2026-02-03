import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Check, ArrowRightLeft, Sparkles, MessageSquareQuote, ArrowRight } from "lucide-react";
import { aiService } from "@/lib/ai/service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "Inglese", flag: "🇬🇧" },
  { code: "es", name: "Spagnolo", flag: "🇪🇸" },
  { code: "fr", name: "Francese", flag: "🇫🇷" },
  { code: "de", name: "Tedesco", flag: "🇩🇪" },
  { code: "pt", name: "Portoghese", flag: "🇵🇹" },
  { code: "ja", name: "Giapponese", flag: "🇯🇵" },
  { code: "zh", name: "Cinese", flag: "🇨🇳" },
  { code: "ru", name: "Russo", flag: "🇷🇺" },
  { code: "ar", name: "Arabo", flag: "🇸🇦" },
];

export function Translator() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSwap = () => {
    if (sourceLang === "auto") {
      toast({
        description: "Seleziona una lingua specifica per invertire.",
        variant: "destructive"
      });
      return;
    }
    const tempSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempSource);
    
    if (translation) {
      setText(translation);
      setTranslation(""); 
    }
  };

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const sourceLangName = sourceLang === "auto" ? "la lingua rilevata" : (LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang);
      const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
      
      const prompt = `Sei un traduttore esperto e madrelingua. 
      Compito: Traduci il seguente testo ${sourceLang === 'auto' ? 'rilevando la lingua originale' : `dall'${sourceLangName}`} all'${targetLangName}.
      Regole: Rispondi SOLO con il testo tradotto. Mantieni tono e stile.
      Testo: "${text}"`;

      const response = await aiService.sendMessage([
        { role: "user", content: prompt }
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
    <div className="w-full h-full flex flex-col justify-start md:justify-center gap-6 p-1">
      
      {/* Action Bar (Responsive) */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-4 w-full">
         <Select value={sourceLang} onValueChange={setSourceLang}>
            <SelectTrigger className="w-full md:w-[180px] h-12 rounded-xl bg-background border-border/60 font-medium order-1">
               <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="auto" className="font-semibold text-indigo-500">✨ Rileva lingua</SelectItem>
                {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.flag} {l.name}</SelectItem>
                ))}
            </SelectContent>
         </Select>

         <Button size="icon" variant="ghost" className="rounded-full hover:bg-muted order-2 md:order-none rotate-90 md:rotate-0 shrink-0" onClick={handleSwap} disabled={sourceLang === "auto"}>
             <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
         </Button>

         <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="w-full md:w-[180px] h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 font-medium text-indigo-700 dark:text-indigo-300 order-3">
               <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.flag} {l.name}</SelectItem>
                ))}
            </SelectContent>
         </Select>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6 min-h-[400px] h-full md:h-[400px]">
        
        {/* Source Text Area */}
        <div className="relative group flex-1 md:flex-auto min-h-[200px]">
            <Textarea 
                placeholder="Digita o incolla qui..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-full resize-none border-border/60 bg-background/50 rounded-3xl p-6 text-lg md:text-xl leading-relaxed focus-visible:ring-indigo-500/30 shadow-sm"
            />
            <div className="absolute bottom-4 right-4 z-10">
                 <Button 
                    size="lg" 
                    className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all px-4 md:px-6 font-semibold"
                    onClick={handleTranslate}
                    disabled={loading || !text.trim()}
                 >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                    Traduci
                 </Button>
            </div>
        </div>

        {/* Target Result Area */}
        <div className={cn(
            "relative w-full h-full min-h-[200px] rounded-3xl border transition-all duration-500 p-6 flex flex-col flex-1 md:flex-auto",
            translation 
                ? "bg-indigo-500/5 border-indigo-500/20 shadow-inner" 
                : "bg-muted/20 border-border/30 border-dashed justify-center items-center"
        )}>
            {translation ? (
                <>
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <p className="text-xl text-foreground/90 leading-relaxed font-medium">{translation}</p>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button 
                            variant="outline" 
                            className="rounded-xl gap-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            onClick={copyToClipboard}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copiato!" : "Copia testo"}
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center opacity-40">
                    <MessageSquareQuote className="w-12 h-12 mx-auto mb-2 text-indigo-400" />
                    <p className="text-lg font-medium">La traduzione apparirà qui</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
