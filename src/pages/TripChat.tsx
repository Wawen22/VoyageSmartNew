import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, Send, MessageSquare, Plus, BarChart2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTripChat } from "@/hooks/useTripChat";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TripAIAssistant } from "@/components/ai-assistant/TripAIAssistant";
import { useTripDetails } from "@/hooks/useTripDetails";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CreatePollDialog } from "@/components/chat/CreatePollDialog";
import { PollMessage } from "@/components/chat/PollMessage";

export default function TripChat() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("trip");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tripTitle, setTripTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  
  const { messages, loading, members, sendMessage, sendPoll, scrollRef } = useTripChat(tripId || "");
  const { data: tripDetails } = useTripDetails(tripId);

  // Fetch trip title
  useEffect(() => {
    if (!tripId) {
      navigate("/trips");
      return;
    }
    const fetchTitle = async () => {
      const { data } = await supabase.from('trips').select('title').eq('id', tripId).single();
      if (data) setTripTitle(data.title);
    };
    fetchTitle();
  }, [tripId, navigate]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    const msg = newMessage;
    setNewMessage(""); // Clear input immediately
    await sendMessage(msg, user.id);
  };

  const handleCreatePoll = async (question: string, options: string[], allowMultiple: boolean) => {
    if (!user) return;
    await sendPoll(question, options, user.id, allowMultiple);
  };

  if (!tripId || !user) return null;

  return (
    <AppLayout>
      <main className="pt-24 pb-4 min-h-screen bg-background flex flex-col">
        <div className="container mx-auto px-4 max-w-4xl flex flex-col flex-1 h-[calc(100vh-7rem)]">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/trips/${tripId}`} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna al viaggio
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium truncate">{tripTitle || "Chat"}</span>
          </div>

          <div className="bg-card rounded-xl border shadow-sm flex flex-col flex-1 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Chat di Gruppo</h2>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 scroll-smooth"
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                  <MessageSquare className="w-12 h-12 mb-2" />
                  <p>Nessun messaggio ancora.</p>
                  <p className="text-sm">Inizia la conversazione!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender_id === user.id;
                  const sender = members[msg.sender_id];
                  const showAvatar = !isMe && (index === 0 || messages[index - 1].sender_id !== msg.sender_id);
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}
                    >
                      <div className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        {!isMe && (
                          <div className="w-8 shrink-0 flex flex-col justify-end">
                            {showAvatar ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="w-8 h-8 border cursor-pointer hover:opacity-80 transition-opacity">
                                      <AvatarImage src={sender?.avatar_url || ""} />
                                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {sender?.full_name?.charAt(0) || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{sender?.full_name || sender?.username || "Utente"}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : <div className="w-8" />}
                          </div>
                        )}

                        <div className="flex flex-col">
                          {msg.poll_id ? (
                            <div className="bg-emerald-50/95 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 shadow-md backdrop-blur-sm">
                              {!isMe && showAvatar && sender && (
                                <p className="text-[10px] font-bold text-emerald-700 mb-2 uppercase tracking-wider">
                                  {sender.full_name || sender.username} ha creato un sondaggio
                                </p>
                              )}
                              <PollMessage pollId={msg.poll_id} isMe={isMe} />
                            </div>
                          ) : (
                            <div className={`
                              max-w-[280px] sm:max-w-md rounded-2xl px-4 py-2 text-sm shadow-sm
                              ${isMe 
                                ? "bg-primary text-primary-foreground rounded-br-none" 
                                : "bg-white dark:bg-muted border rounded-bl-none text-foreground"
                              }
                            `}>
                              {!isMe && showAvatar && sender && (
                                <p className={`text-[10px] font-bold mb-1 ${isMe ? "opacity-70" : "text-primary"}`}>
                                  {sender.full_name || sender.username}
                                </p>
                              )}
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          )}
                          <p className={`text-[10px] mt-1 ${isMe ? "text-right" : "text-left"} opacity-50`}>
                            {format(new Date(msg.created_at), "HH:mm", { locale: it })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t">
              <form onSubmit={handleSend} className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" side="top" className="w-48 p-2 mb-2 shadow-xl border-emerald-100">
                    <div className="grid gap-1">
                      <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Strumenti Chat
                      </div>
                      <Button 
                        variant="ghost" 
                        type="button"
                        className="w-full justify-start gap-3 h-10 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        onClick={() => setIsPollDialogOpen(true)}
                      >
                        <div className="bg-emerald-100 p-1.5 rounded-lg">
                          <BarChart2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium">Sondaggio</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Input 
                  placeholder="Scrivi un messaggio..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="rounded-full"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-full shrink-0" 
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <CreatePollDialog 
        open={isPollDialogOpen}
        onOpenChange={setIsPollDialogOpen}
        onSubmit={handleCreatePoll}
      />

      {tripId && <TripAIAssistant tripId={tripId} tripDetails={tripDetails || null} />}
    </AppLayout>
  );
}
