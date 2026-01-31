import { useState, useEffect, useRef, useCallback } from "react";
import { useTripAI } from "@/hooks/useTripAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, Loader2, Sparkles, User, Trash2, X, Mic, MicOff, Volume2, StopCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichMessageRenderer } from "./RichMessageRenderer";
import { ActionProposalCard } from "./ActionProposalCard";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionDialog } from "@/components/subscription/SubscriptionDialog";
import { Badge } from "@/components/ui/badge";

interface TripAIAssistantProps {
  tripId: string;
  tripDetails: any; // Using any for simplicity here, but should match Trip type
}

export function TripAIAssistant({ tripId, tripDetails }: TripAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, executeTool, isLoading, error, clearChat, contextData } = useTripAI({ 
    tripId, 
    tripDetails 
  });

  const { isPro, remainingMessages, isLimitReached } = useSubscription();

  const { speak, cancel: cancelSpeech, isSpeaking } = useTextToSpeech();
  
  const handleSpeechResult = useCallback((text: string) => {
    setInput(text);
  }, []);

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: isSpeechSupported 
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isListening]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (isLimitReached) {
      setShowSubscriptionDialog(true);
      return;
    }
    sendMessage(input);
    setInput("");
    if (isListening) stopListening();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        cancelSpeech();
        if (isListening) stopListening();
      }
    }}>
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
                <div className="flex items-center gap-2">
                  <SheetDescription>Il tuo assistente personale</SheetDescription>
                  {!isPro && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-indigo-50 text-indigo-600 border-indigo-100">
                      {remainingMessages} rimasti
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!isPro && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 gap-1.5 text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100"
                  onClick={() => setShowSubscriptionDialog(true)}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Upgrade</span>
                </Button>
              )}
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
          <ScrollArea className="h-full">
            <div className="space-y-6 p-4 pb-4">
              {messages.length === 0 && (
                <div className="text-center space-y-4 py-6 px-2">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border inline-block">
                    <Sparkles className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Come posso aiutarti?</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Chiedimi informazioni sull'itinerario, consigli su ristoranti, meteo o dettagli sulle spese.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                    <Button variant="outline" className="text-xs h-auto py-2 justify-start" onClick={() => sendMessage("Quali sono i miei alloggi?")}>
                      🏨 I miei alloggi?
                    </Button>
                    <Button variant="outline" className="text-xs h-auto py-2 justify-start" onClick={() => sendMessage("Quali sono i miei trasporti?")}>
                      ✈️ I miei trasporti?
                    </Button>
                    <Button variant="outline" className="text-xs h-auto py-2 justify-start" onClick={() => sendMessage("Quanto abbiamo speso finora?")}>
                      💰 Spese totali?
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
                    "flex gap-3 group",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex flex-col gap-2 items-center justify-end">
                      <Avatar className="h-8 w-8 border bg-indigo-100 dark:bg-indigo-900/50 flex-shrink-0">
                        <AvatarFallback><Bot className="h-4 w-4 text-indigo-600" /></AvatarFallback>
                      </Avatar>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => speak(msg.content)}
                        title="Leggi ad alta voce"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed overflow-hidden relative",
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none max-w-[90%]"
                        : "bg-white dark:bg-slate-800 border rounded-bl-none max-w-full w-auto"
                    )}
                  >
                    {msg.toolCalls && msg.toolCalls.length > 0 ? (
                      <ActionProposalCard 
                        functionName={msg.toolCalls[0].name}
                        args={msg.toolCalls[0].args}
                        onConfirm={() => executeTool(msg.id!, msg.toolCalls![0])}
                        onCancel={() => {}} 
                        isExecuted={msg.isExecuted}
                      />
                    ) : msg.role === "assistant" ? (
                      <>
                        <RichMessageRenderer 
                          content={msg.content}
                          contextData={contextData}
                          tripId={tripId}
                          onLinkClick={() => setIsOpen(false)}
                        />
                      </>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
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
              
              {isListening && (
                <div className="flex gap-3 justify-end items-center animate-pulse">
                   <span className="text-xs text-indigo-600 font-medium">Ti ascolto...</span>
                   <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                   <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-75" />
                   <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-150" />
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

        <div className="p-4 border-t bg-white dark:bg-slate-900 relative">
          {isSpeaking && (
            <div className="absolute -top-10 left-0 w-full flex justify-center pb-2 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900">
               <Button variant="secondary" size="sm" onClick={cancelSpeech} className="h-8 gap-2 rounded-full shadow-sm text-xs border">
                 <StopCircle className="w-3.5 h-3.5 text-red-500" /> Stop Lettura
               </Button>
            </div>
          )}
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            {isSpeechSupported && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full shrink-0 transition-all duration-300", 
                  isListening ? "bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 animate-pulse" : "text-muted-foreground hover:bg-slate-100"
                )}
                onClick={toggleListening}
                disabled={isLimitReached}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            )}
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLimitReached ? "Limite raggiunto. Passa a Pro!" : (isListening ? "Parla ora..." : "Scrivi un messaggio...")}
              className={cn(
                "flex-1 rounded-full border-0 focus-visible:ring-indigo-500 transition-colors",
                isListening ? "bg-red-50 placeholder:text-red-400" : "bg-slate-100 dark:bg-slate-800",
                isLimitReached && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading || isLimitReached}
            />
            {isLimitReached ? (
              <Button 
                type="button" 
                size="icon" 
                className="rounded-full shrink-0 bg-indigo-600 hover:bg-indigo-700 animate-pulse"
                onClick={() => setShowSubscriptionDialog(true)}
              >
                <Zap className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={handleSend}
                size="icon" 
                className={cn("rounded-full h-10 w-10 shrink-0", input.trim() ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-200 text-slate-400 hover:bg-slate-200 dark:bg-slate-800")}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
          <div className="text-[10px] text-center text-muted-foreground mt-2">
            AI può commettere errori. Verifica le informazioni importanti.
          </div>
        </div>
      </SheetContent>
      
      <SubscriptionDialog 
        open={showSubscriptionDialog} 
        onOpenChange={setShowSubscriptionDialog} 
      />
    </Sheet>
  );
}