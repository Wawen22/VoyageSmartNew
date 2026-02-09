import { useState, useEffect, useRef, useCallback } from "react";
import { useTripAI } from "@/hooks/useTripAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, Loader2, Sparkles, User, Trash2, X, Mic, MicOff, Volume2, StopCircle, Zap, Paperclip, Image as ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichMessageRenderer } from "./RichMessageRenderer";
import { ActionProposalCard } from "./ActionProposalCard";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionDialog } from "@/components/subscription/SubscriptionDialog";
import { Badge } from "@/components/ui/badge";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

interface TripAIAssistantProps {
  tripId: string;
  tripDetails: any; // Using any for simplicity here, but should match Trip type
  className?: string;
}

export function TripAIAssistant({ tripId, tripDetails, className }: TripAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<{url: string, type: string}[]>([]);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, sendMessage, executeTool, rejectTool, isLoading, error, clearChat, contextData } = useTripAI({ 
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
  }, [messages, isLoading, isListening, attachedFiles]);

  // Listen for external open events
  useEffect(() => {
    const handleOpenAI = (e: CustomEvent) => {
      setIsOpen(true);
      if (e.detail?.message) {
        setInput(e.detail.message);
      }
    };

    window.addEventListener('open-trip-ai' as any, handleOpenAI);
    return () => window.removeEventListener('open-trip-ai' as any, handleOpenAI);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File troppo grande",
          description: "Il limite massimo è di 8MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFiles(prev => [...prev, { 
          url: reader.result as string, 
          type: file.type 
        }]);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (isLimitReached) {
      setShowSubscriptionDialog(true);
      return;
    }
    sendMessage(input, attachedFiles.length > 0 ? attachedFiles.map(f => f.url) : undefined);
    setInput("");
    setAttachedFiles([]);
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

  const { toast } = useToast();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        cancelSpeech();
        if (isListening) stopListening();
      }
    }}>
      <SheetTrigger asChild>
        <div className={cn("fixed bottom-24 lg:bottom-6 right-6 z-50 group", className)}>
          <div className="relative">
             {/* Pulsing background glow */}
             <div className="absolute inset-0 rounded-2xl bg-violet-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
             
             <Button
              className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_200%] animate-gradient-xy border border-white/20 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 overflow-hidden"
              size="icon"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:animate-shine" />
              
              <Sparkles className="h-7 w-7 text-white drop-shadow-md" />
              <span className="sr-only">Apri Assistente AI</span>
            </Button>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[540px] lg:max-w-[1000px] lg:w-[90vw] right-0 flex flex-col p-0 h-full border-l-2 border-indigo-100 dark:border-indigo-900 [&>button]:hidden overflow-x-hidden"
      >
        {/* Main Header */}
        <div className="p-5 border-b bg-background/80 backdrop-blur-md sticky top-0 z-20 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Voyage AI</SheetTitle>
                <SheetDescription className="text-xs font-medium">Il tuo Assistente di Viaggio Intelligente</SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearChat} 
                title="Cancella chat"
                className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <SheetClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </SheetClose>
            </div>
          </div>
        </div>

        {/* Subscription Status Bar (Free Tier Only) */}
        {!isPro && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 px-5 py-3 border-b flex items-center justify-between gap-4 w-full">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mb-1.5">
                <span>Messaggi Gratuiti</span>
                <span>{remainingMessages} rimasti</span>
              </div>
              <div className="h-1.5 w-full bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(Math.max(0, 5 - remainingMessages) / 5) * 100}%` }}
                />
              </div>
            </div>
            <Button 
              size="sm" 
              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border-0"
              onClick={() => setShowSubscriptionDialog(true)}
            >
              <Zap className="w-3 h-3 mr-1.5 fill-current" />
              Upgrade
            </Button>
          </div>
        )}
        
        <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-950/50 w-full">
          <ScrollArea className="h-full w-full">
            <div className="space-y-6 p-4 md:px-10 pb-10 w-full overflow-x-hidden">
              {messages.length === 0 && (
                <div className="text-center space-y-4 py-6 px-2">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border inline-block">
                    <Sparkles className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Come posso aiutarti?</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Chiedimi informazioni sull'itinerario, consigli su ristoranti, meteo o dettagli sulle spese.
                      Puoi anche allegare foto o PDF di prenotazioni!
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
                    <Button variant="outline" className="text-xs h-auto py-2 justify-start" onClick={() => sendMessage("Suggeriscimi qualcosa da fare")}>
                      💡 Suggerimenti?
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
                        <AvatarFallback><Sparkles className="h-4 w-4 text-indigo-600" /></AvatarFallback>
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
                    {msg.images && msg.images.length > 0 && (
                      <div className="mb-2 flex gap-2 flex-wrap">
                        {msg.images.map((img, i) => (
                          img.startsWith("data:application/pdf") ? (
                            <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg border border-white/10 w-full max-w-[200px]">
                              <FileText className="h-8 w-8 text-indigo-400" />
                              <span className="text-[10px] truncate">Documento PDF</span>
                            </div>
                          ) : (
                            <img key={i} src={img} className="w-full max-w-[200px] h-auto rounded-lg border border-white/20" alt="Attached" />
                          )
                        ))}
                      </div>
                    )}

                    {msg.toolCalls && msg.toolCalls.length > 0 ? (
                      <ActionProposalCard 
                        functionName={msg.toolCalls[0].name}
                        args={msg.toolCalls[0].args}
                        onConfirm={(newArgs) => executeTool(msg.id!, newArgs || msg.toolCalls![0])}
                        onCancel={() => rejectTool(msg.id!)} 
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
                    <AvatarFallback><Sparkles className="h-4 w-4 text-indigo-600" /></AvatarFallback>
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

        {/* File Preview Area */}
        {attachedFiles.length > 0 && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t flex gap-2 overflow-x-auto">
            {attachedFiles.map((file, i) => (
              <div key={i} className="relative group/img flex-shrink-0">
                {file.type === "application/pdf" ? (
                  <div className="h-16 w-16 flex flex-col items-center justify-center bg-slate-800 rounded-lg border text-[8px] text-white">
                    <FileText className="h-6 w-6 text-indigo-400 mb-1" />
                    PDF
                  </div>
                ) : (
                  <img src={file.url} className="h-16 w-16 object-cover rounded-lg border" alt="Preview" />
                )}
                <button 
                  onClick={() => removeFile(i)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

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
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf" 
              multiple
              onChange={handleFileSelect} 
            />
            
            <div className="flex flex-col items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full shrink-0 transition-colors h-9 w-9", 
                  attachedFiles.length > 0 ? "text-indigo-600 bg-indigo-50" : "text-muted-foreground hover:bg-slate-100"
                )}
                onClick={() => fileInputRef.current?.click()}
                disabled={isLimitReached}
                title="Allega immagine o PDF"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <span className="text-[7px] font-bold uppercase text-muted-foreground/60 leading-none">8MB</span>
            </div>

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
              placeholder={isLimitReached ? "Limite raggiunto. Passa a Pro!" : (isListening ? "Parla ora..." : "Scrivi o allega un file...")}
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
                className={cn("rounded-full h-10 w-10 shrink-0", input.trim() || attachedFiles.length > 0 ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-200 text-slate-400 hover:bg-slate-200 dark:bg-slate-800")}
                disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
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
