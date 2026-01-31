
import { useState, useEffect, useRef } from "react";
import { useTripAI } from "@/hooks/useTripAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, Loader2, Sparkles, User, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripAIAssistantProps {
  tripId: string;
  tripDetails: any; // Using any for simplicity here, but should match Trip type
}

export function TripAIAssistant({ tripId, tripDetails }: TripAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, isLoading, error, clearChat } = useTripAI({ 
    tripId, 
    tripDetails 
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-2 border-white/20"
          size="icon"
        >
          <Bot className="h-7 w-7 text-white" />
          <span className="sr-only">Apri Assistente AI</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[95%] sm:w-[540px] flex flex-col p-0 h-full border-l-2 border-indigo-100 dark:border-indigo-900 [&>button]:hidden">
        <SheetHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <SheetTitle className="text-xl">Voyage AI</SheetTitle>
                <SheetDescription>Il tuo assistente di viaggio personale</SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearChat} 
                title="Cancella chat"
                className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <SheetClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-950/50">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6 pb-4">
              {messages.length === 0 && (
                <div className="text-center space-y-4 py-10 px-4">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border inline-block">
                    <Sparkles className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Come posso aiutarti?</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Chiedimi informazioni sull'itinerario, consigli su ristoranti, meteo o dettagli sulle spese.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                    <Button variant="outline" className="text-xs h-auto py-2 justify-start" onClick={() => sendMessage("Qual è il programma di oggi?")}>
                      📅 Programma di oggi?
                    </Button>
                    <Button variant="outline" className="text-xs h-auto py-2 justify-start" onClick={() => sendMessage("Quanto abbiamo speso finora?")}>
                      💰 Spese totali?
                    </Button>
                    <Button variant="outline" className="text-xs h-auto py-2 justify-start" onClick={() => sendMessage("Consigliami un ristorante per stasera")}>
                      🍝 Ristorante per cena?
                    </Button>
                    <Button variant="outline" className="text-xs h-auto py-2 justify-start" onClick={() => sendMessage("Cosa non devo dimenticare?")}>
                      📋 Oggetti da portare?
                    </Button>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 border bg-indigo-100 dark:bg-indigo-900/50">
                      <AvatarFallback><Bot className="h-4 w-4 text-indigo-600" /></AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[80%] text-sm shadow-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white dark:bg-slate-800 border rounded-bl-none"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 border bg-slate-100 dark:bg-slate-800">
                       <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 border bg-indigo-100 dark:bg-indigo-900/50">
                    <AvatarFallback><Bot className="h-4 w-4 text-indigo-600" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-slate-800 border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    <span className="text-xs text-muted-foreground">Sto pensando...</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs text-center border border-red-100 mx-auto max-w-xs">
                  {error}
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un messaggio..."
              className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 border-0 focus-visible:ring-indigo-500"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className={cn("rounded-full h-10 w-10 shrink-0", input.trim() ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-200 text-slate-400 hover:bg-slate-200 dark:bg-slate-800")}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-[10px] text-center text-muted-foreground mt-2">
            AI può commettere errori. Verifica le informazioni importanti.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
