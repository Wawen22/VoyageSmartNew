import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, Send, MessageSquare, Plus, BarChart2, X, Pencil, Check, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTripChat } from "@/hooks/useTripChat";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { ReactionPicker } from "@/components/chat/reactions/ReactionPicker";
import { MessageReactions } from "@/components/chat/reactions/MessageReactions";
import { ReplyPreview } from "@/components/chat/reply/ReplyPreview";
import { Reply, CalendarPlus, Wallet, MoreHorizontal, Pin, PinOff } from "lucide-react";
import { TripAIAssistant } from "@/components/ai-assistant/TripAIAssistant";
import { useTripDetails } from "@/hooks/useTripDetails";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CreatePollDialog } from "@/components/chat/CreatePollDialog";
import { PollMessage } from "@/components/chat/PollMessage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddActivityDialog } from "@/components/itinerary/AddActivityDialog";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { useItinerary } from "@/hooks/useItinerary";
import { useExpenses } from "@/hooks/useExpenses";
import { ChatMessage } from "@/hooks/useTripChat";
import { MobileMessageActions } from "@/components/chat/mobile/MobileMessageActions";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TripChat() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("trip");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tripTitle, setTripTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [chatToPlan, setChatToPlan] = useState<{ msg: ChatMessage, type: 'activity' | 'expense' } | null>(null);
  
  const { messages, loading, members, sendMessage, sendPoll, toggleReaction, togglePin, deleteMessage, editMessage, scrollRef } = useTripChat(tripId || "");
  const { data: tripDetails } = useTripDetails(tripId);
  const { createActivity } = useItinerary(tripId || undefined);
  const { createExpense } = useExpenses(tripId || "");
  const isMobile = useIsMobile();

  const pinnedMessages = messages.filter(m => m.is_pinned);

  // Convert members map to array for expense dialog
  const memberList = Object.entries(members).map(([id, profile]) => ({
    user_id: id,
    profile
  }));

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

  useEffect(() => {
    if (editingMessage) {
      setNewMessage(editingMessage.content || "");
    }
  }, [editingMessage]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    if (editingMessage) {
      const msgId = editingMessage.id;
      const content = newMessage;
      setEditingMessage(null);
      setNewMessage("");
      await editMessage(msgId, content);
    } else {
      const msg = newMessage;
      setNewMessage(""); 
      setReplyTo(null);
      await sendMessage(msg, user.id, replyTo);
    }
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
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Chat di Gruppo</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                  {Object.keys(members).length} Membri
                </span>
              </div>
            </div>

            {/* Pinned Messages Bar */}
            {pinnedMessages.length > 0 && (
              <div className="bg-primary/5 border-b px-4 py-2 flex items-center gap-3 animate-in slide-in-from-top duration-300 relative z-20">
                <Pin className="w-3 h-3 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-primary uppercase">Messaggi in evidenza</p>
                    <span className="text-[10px] text-muted-foreground opacity-50">•</span>
                    <span className="text-[10px] text-muted-foreground">{pinnedMessages.length} totali</span>
                  </div>
                  <button 
                    onClick={() => {
                      const lastPinned = pinnedMessages[pinnedMessages.length - 1];
                      const el = document.getElementById(`msg-${lastPinned.id}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el?.classList.add('ring-2', 'ring-primary/20');
                      setTimeout(() => el?.classList.remove('ring-2', 'ring-primary/20'), 2000);
                    }}
                    className="text-xs text-foreground truncate block w-full text-left hover:underline underline-offset-2"
                  >
                    {pinnedMessages[pinnedMessages.length - 1].poll_id 
                      ? "📊 Sondaggio: " + pinnedMessages[pinnedMessages.length - 1].content 
                      : pinnedMessages[pinnedMessages.length - 1].content}
                  </button>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-primary"
                    onClick={() => {
                      const lastPinned = pinnedMessages[pinnedMessages.length - 1];
                      togglePin(lastPinned.id, true);
                    }}
                  >
                    <PinOff className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

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
                  const replyToMessage = msg.reply_to;
                  const replySender = replyToMessage ? members[replyToMessage.sender_id] : null;
                  
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
                          {replyToMessage && (
                            <div 
                              className={`
                                text-xs mb-1 p-2 rounded-lg border-l-2 bg-muted/30 opacity-80 cursor-pointer hover:opacity-100 transition-opacity
                                ${isMe ? "border-primary/50 text-right self-end" : "border-primary/50 text-left self-start"}
                              `}
                              onClick={() => {
                                const el = document.getElementById(`msg-${replyToMessage.id}`);
                                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                el?.classList.add('bg-primary/5');
                                setTimeout(() => el?.classList.remove('bg-primary/5'), 1000);
                              }}
                            >
                              <p className="font-bold text-[10px] text-primary">
                                {replySender?.full_name || replySender?.username || "Utente"}
                              </p>
                              <p className="line-clamp-1 text-muted-foreground">
                                {replyToMessage.poll_id ? "📊 Sondaggio" : replyToMessage.content}
                              </p>
                            </div>
                          )}

                          {isMobile ? (
                            <MobileMessageActions
                              message={msg}
                              userId={user.id}
                              onReply={(m) => setReplyTo(m)}
                              onReaction={(emoji) => toggleReaction(msg.id, emoji, user.id)}
                              onPin={(id, status) => togglePin(id, status)}
                              onDelete={(id) => deleteMessage(id)}
                              onEdit={(m) => setEditingMessage(m)}
                              onAction={(m, type) => setChatToPlan({ msg: m, type })}
                            >
                              {msg.poll_id ? (
                                <div id={`msg-${msg.id}`} className="bg-emerald-50/95 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 shadow-md backdrop-blur-sm transition-colors duration-500 relative group/pinned">
                                  {msg.is_pinned && (
                                    <div className="absolute -top-2 -left-2 bg-amber-500 text-white p-1 rounded-full shadow-md z-10 border border-white dark:border-slate-800 animate-in zoom-in">
                                      <Pin className="w-2.5 h-2.5 fill-current" />
                                    </div>
                                  )}
                                  {!isMe && showAvatar && sender && (
                                    <p className="text-[10px] font-bold text-emerald-700 mb-2 uppercase tracking-wider">
                                      {sender.full_name || sender.username} ha creato un sondaggio
                                    </p>
                                  )}
                                  <PollMessage pollId={msg.poll_id} isMe={isMe} />
                                </div>
                              ) : (
                                <div className="group/msg relative" id={`msg-${msg.id}`}>
                                  {msg.is_pinned && (
                                    <div className={`absolute -top-2 bg-amber-500 text-white p-1 rounded-full shadow-md z-10 border border-white dark:border-slate-800 animate-in zoom-in ${isMe ? "-right-2" : "-left-2"}`}>
                                      <Pin className="w-2.5 h-2.5 fill-current" />
                                    </div>
                                  )}
                                  <div className={`
                                    max-w-[280px] sm:max-w-md rounded-2xl px-4 py-2 text-sm shadow-sm transition-colors duration-500
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
                                </div>
                              )}
                            </MobileMessageActions>
                          ) : (
                            <>
                              {msg.poll_id ? (
                                <div id={`msg-${msg.id}`} className="bg-emerald-50/95 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 shadow-md backdrop-blur-sm transition-colors duration-500 relative group/pinned">
                                  {msg.is_pinned && (
                                    <div className="absolute -top-2 -left-2 bg-amber-500 text-white p-1 rounded-full shadow-md z-10 border border-white dark:border-slate-800 animate-in zoom-in">
                                      <Pin className="w-2.5 h-2.5 fill-current" />
                                    </div>
                                  )}
                                  {!isMe && showAvatar && sender && (
                                    <p className="text-[10px] font-bold text-emerald-700 mb-2 uppercase tracking-wider">
                                      {sender.full_name || sender.username} ha creato un sondaggio
                                    </p>
                                  )}
                                  <PollMessage pollId={msg.poll_id} isMe={isMe} />
                                </div>
                              ) : (
                                <div className="group/msg relative" id={`msg-${msg.id}`}>
                                  {msg.is_pinned && (
                                    <div className={`absolute -top-2 bg-amber-500 text-white p-1 rounded-full shadow-md z-10 border border-white dark:border-slate-800 animate-in zoom-in ${isMe ? "-right-2" : "-left-2"}`}>
                                      <Pin className="w-2.5 h-2.5 fill-current" />
                                    </div>
                                  )}
                                  <div className={`
                                    max-w-[280px] sm:max-w-md rounded-2xl px-4 py-2 text-sm shadow-sm transition-colors duration-500
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
                                  
                                  {/* Reaction Picker Button & Reply Button & Context Menu */}
                                  <div className={`
                                    absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 flex items-center gap-1
                                    ${isMe ? "-left-24" : "-right-24"}
                                  `}>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50"
                                        >
                                          <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align={isMe ? "end" : "start"}>
                                        <DropdownMenuItem onClick={() => setChatToPlan({ msg, type: 'activity' })}>
                                          <CalendarPlus className="w-4 h-4 mr-2" />
                                          Crea Attività
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setChatToPlan({ msg, type: 'expense' })}>
                                          <Wallet className="w-4 h-4 mr-2" />
                                          Crea Spesa
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => togglePin(msg.id, msg.is_pinned || false)}>
                                          {msg.is_pinned ? (
                                            <>
                                              <PinOff className="w-4 h-4 mr-2" />
                                              Rimuovi in evidenza
                                            </>
                                          ) : (
                                            <>
                                              <Pin className="w-4 h-4 mr-2" />
                                              Metti in evidenza
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                        {isMe && (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={() => setEditingMessage(msg)}
                                          disabled={(() => {
                                            const sentAt = new Date(msg.created_at).getTime();
                                            const now = new Date().getTime();
                                            return (now - sentAt) / (1000 * 60) > 15 || !!msg.poll_id;
                                          })()}
                                        >
                                          <Pencil className="w-4 h-4 mr-2" />
                                          Modifica
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => deleteMessage(msg.id)}
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                          disabled={(() => {
                                            const sentAt = new Date(msg.created_at).getTime();
                                            const now = new Date().getTime();
                                            return (now - sentAt) / (1000 * 60) > 15;
                                          })()}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Elimina
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50"
                                      onClick={() => setReplyTo(msg)}
                                    >
                                      <Reply className="w-4 h-4" />
                                    </Button>
                                    <ReactionPicker 
                                      onSelect={(emoji) => toggleReaction(msg.id, emoji, user.id)}
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Display Reactions */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <MessageReactions 
                              reactions={msg.reactions} 
                              onToggle={(emoji) => toggleReaction(msg.id, emoji, user.id)}
                              isMe={isMe}
                            />
                          )}

                          <p className={`text-[10px] mt-1 ${isMe ? "text-right" : "text-left"} opacity-50 flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                            {msg.is_edited && <span className="italic">(modificato)</span>}
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
            <div className="bg-background border-t">
              {replyTo && (
                <ReplyPreview 
                  replyTo={replyTo}
                  sender={members[replyTo.sender_id]}
                  onCancel={() => setReplyTo(null)}
                />
              )}
              {editingMessage && (
                <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border-t animate-in slide-in-from-bottom-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Pencil className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Modifica messaggio</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 rounded-full" 
                    onClick={() => {
                      setEditingMessage(null);
                      setNewMessage("");
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <form onSubmit={handleSend} className="p-4 flex gap-2">
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
                  placeholder={editingMessage ? "Modifica il tuo messaggio..." : "Scrivi un messaggio..."} 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className={cn("rounded-full", editingMessage && "border-primary ring-1 ring-primary/20")}
                  autoFocus={!!editingMessage}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn("rounded-full shrink-0", editingMessage ? "bg-primary" : "")} 
                  disabled={!newMessage.trim()}
                >
                  {editingMessage ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
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

      {tripId && (
        <>
          <AddActivityDialog
            tripId={tripId}
            open={chatToPlan?.type === 'activity'}
            onOpenChange={(open) => !open && setChatToPlan(null)}
            initialTitle={chatToPlan?.msg.content || ""}
            onAdd={async (data) => {
              const success = await createActivity(data);
              if (success) setChatToPlan(null);
              return success;
            }}
          />
          
          <AddExpenseDialog
            open={chatToPlan?.type === 'expense'}
            onOpenChange={(open) => !open && setChatToPlan(null)}
            tripId={tripId}
            members={memberList}
            currentUserId={user.id}
            initialDescription={chatToPlan?.msg.content || ""}
            onSubmit={async (data) => {
              const success = await createExpense(data);
              if (success) setChatToPlan(null);
              return success;
            }}
          />
        </>
      )}

      {tripId && <TripAIAssistant tripId={tripId} tripDetails={tripDetails || null} />}
    </AppLayout>
  );
}
