import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, Send, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTripChat } from "@/hooks/useTripChat";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TripAIAssistant } from "@/components/ai-assistant/TripAIAssistant";
import { useTripDetails } from "@/hooks/useTripDetails";

export default function TripChat() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("trip");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tripTitle, setTripTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  
  const { messages, loading, members, sendMessage, scrollRef } = useTripChat(tripId || "");
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
                      className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                    >
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
                      
                      <div className={`
                        max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm
                        ${isMe 
                          ? "bg-primary text-primary-foreground rounded-br-none" 
                          : "bg-white dark:bg-muted border rounded-bl-none"
                        }
                      `}>
                        {!isMe && showAvatar && sender && (
                          <p className="text-[10px] font-bold opacity-70 mb-1 text-primary">
                            {sender.full_name || sender.username}
                          </p>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? "opacity-70" : "text-muted-foreground"}`}>
                          {format(new Date(msg.created_at), "HH:mm", { locale: it })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t">
              <form onSubmit={handleSend} className="flex gap-2">
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
      {tripId && <TripAIAssistant tripId={tripId} tripDetails={tripDetails || null} />}
    </AppLayout>
  );
}
