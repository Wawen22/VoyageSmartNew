import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerHeader } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Reply, CalendarPlus, Wallet, Pin, PinOff, Copy, Trash2, SmilePlus } from "lucide-react";
import { ChatMessage } from "@/hooks/useTripChat";
import { ReactionPicker } from "../reactions/ReactionPicker";

interface MobileMessageActionsProps {
  message: ChatMessage;
  userId: string;
  onReply: (msg: ChatMessage) => void;
  onReaction: (emoji: string) => void;
  onPin: (msgId: string, currentStatus: boolean) => void;
  onDelete: (msgId: string) => void;
  onAction: (msg: ChatMessage, type: 'activity' | 'expense') => void;
  children: React.ReactNode;
}

export function MobileMessageActions({ 
  message, 
  userId, 
  onReply, 
  onReaction, 
  onPin, 
  onDelete,
  onAction,
  children 
}: MobileMessageActionsProps) {
  const [open, setOpen] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle Long Press
  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setOpen(true);
      // Vibrate if supported and allowed by user interaction
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
        }
      } catch (e) {
        // Ignore vibration errors (often blocked by browser policies)
        console.debug("Vibration blocked or not supported");
      }
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const isDeletable = () => {
    if (message.sender_id !== userId) return false;
    const now = new Date();
    const sentAt = new Date(message.created_at);
    const diffInMinutes = (now.getTime() - sentAt.getTime()) / (1000 * 60);
    return diffInMinutes <= 15;
  };

  const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  return (
    <>
      <div 
        onTouchStart={handleTouchStart} 
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart} // For testing on desktop
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        className="touch-none select-none active:scale-[0.98] transition-transform duration-200"
      >
        {children}
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="pb-8 px-4">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Azioni Messaggio</DrawerTitle>
          </DrawerHeader>
          
          {/* Reaction Bar */}
          <div className="flex justify-between items-center bg-muted/30 p-2 rounded-full mb-6 mx-2 overflow-x-auto gap-2 no-scrollbar">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReaction(emoji);
                  setOpen(false);
                }}
                className="text-2xl hover:scale-125 transition-transform p-2"
              >
                {emoji}
              </button>
            ))}
            <ReactionPicker 
              onSelect={(emoji) => {
                onReaction(emoji);
                setOpen(false);
              }}
              className="bg-transparent hover:bg-muted/50"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mb-2">
            <Button variant="outline" className="flex flex-col gap-1 h-20 border-muted-foreground/20 hover:bg-muted/50 hover:text-primary" onClick={() => { onReply(message); setOpen(false); }}>
              <Reply className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Rispondi</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col gap-1 h-20 border-muted-foreground/20 hover:bg-muted/50 hover:text-primary" onClick={() => { onPin(message.id, message.is_pinned || false); setOpen(false); }}>
              {message.is_pinned ? <PinOff className="w-6 h-6 mb-1" /> : <Pin className="w-6 h-6 mb-1" />}
              <span className="text-[10px] font-medium">{message.is_pinned ? "Rimuovi" : "Fissa"}</span>
            </Button>

            <Button variant="outline" className="flex flex-col gap-1 h-20 border-muted-foreground/20 hover:bg-muted/50 hover:text-primary" onClick={() => { navigator.clipboard.writeText(message.content || ""); setOpen(false); }}>
              <Copy className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Copia</span>
            </Button>

            {message.sender_id === userId && (
               <Button 
                variant="outline" 
                className="flex flex-col gap-1 h-20 border-muted-foreground/20 hover:bg-destructive/10 text-destructive hover:text-destructive disabled:opacity-30 disabled:grayscale" 
                onClick={() => { onDelete(message.id); setOpen(false); }}
                disabled={!isDeletable()}
              >
                <Trash2 className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">Elimina</span>
              </Button>
            )}
          </div>

          <div className="space-y-2 mt-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Azioni Rapide</p>
            <Button variant="secondary" className="w-full justify-start gap-3 h-12" onClick={() => { onAction(message, 'activity'); setOpen(false); }}>
              <div className="bg-emerald-100 p-1.5 rounded-md">
                <CalendarPlus className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-medium">Crea Attività da questo messaggio</span>
            </Button>
            <Button variant="secondary" className="w-full justify-start gap-3 h-12" onClick={() => { onAction(message, 'expense'); setOpen(false); }}>
              <div className="bg-amber-100 p-1.5 rounded-md">
                <Wallet className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-medium">Crea Spesa da questo messaggio</span>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
