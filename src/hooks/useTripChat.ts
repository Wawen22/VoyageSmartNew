import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ChatMemberProfile {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export const useTripChat = (tripId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Record<string, ChatMemberProfile>>({});
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Members (for avatar lookup)
  useEffect(() => {
    if (!tripId) return;
    
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('trip_members')
        .select('user_id, profiles(full_name, username, avatar_url)')
        .eq('trip_id', tripId);
      
      const membersMap: Record<string, ChatMemberProfile> = {};
      data?.forEach((m: any) => {
        if (m.profiles) membersMap[m.user_id] = m.profiles;
      });
      setMembers(membersMap);
    };
    fetchMembers();
  }, [tripId]);

  // 2. Fetch Initial Messages & Subscribe
  useEffect(() => {
    if (!tripId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('trip_messages')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
        toast({ title: "Errore chat", description: "Impossibile caricare i messaggi.", variant: "destructive" });
      } else {
        setMessages(data || []);
      }
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();

    // Realtime Subscription
    const channel = supabase
      .channel(`trip-chat-${tripId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trip_messages', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const sendMessage = async (content: string, userId: string) => {
    if (!content.trim()) return;

    // We don't optimistically update here to avoid duplicates with Realtime,
    // unless we implement a robust temp-id system. Realtime is usually fast enough (<100ms).
    const { error } = await supabase
      .from('trip_messages')
      .insert({
        trip_id: tripId,
        sender_id: userId,
        content: content.trim()
      });

    if (error) {
      toast({ title: "Errore invio", description: "Riprova più tardi.", variant: "destructive" });
      throw error;
    }
    
    scrollToBottom();
  };

  return {
    messages,
    loading,
    members,
    sendMessage,
    scrollRef
  };
};
