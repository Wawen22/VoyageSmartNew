import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string | null;
  poll_id?: string | null;
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
      // First fetch member IDs
      const { data: membersData } = await supabase
        .from('trip_members')
        .select('user_id')
        .eq('trip_id', tripId);
      
      if (!membersData || membersData.length === 0) return;

      const userIds = membersData.map(m => m.user_id);

      // Then fetch profiles
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url')
        .in('user_id', userIds);

      if (error) {
        console.error("Error fetching profiles:", error);
      }

      const membersMap: Record<string, ChatMemberProfile> = {};
      profilesData?.forEach((p) => {
        if (p.user_id) {
          membersMap[p.user_id] = {
            full_name: p.full_name,
            username: p.username,
            avatar_url: p.avatar_url
          };
        }
      });
      setMembers(membersMap);
    };
    fetchMembers();
  }, [tripId]);

  // 2. Fetch Initial Messages & Subscribe
  useEffect(() => {
    if (!tripId) return;

    const fetchMessages = async () => {
      // Mark as read immediately when loading chat
      await supabase.rpc('mark_trip_chat_read', { p_trip_id: tripId });

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
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          setMessages((prev) => {
            // Avoid duplicates if already added optimistically or by another event
            if (prev.some(m => m.id === newMessage.id)) return prev;

            // Try to find a matching optimistic message (same sender and content, and has temp ID)
            const matchingIndex = prev.findIndex(m => 
              m.sender_id === newMessage.sender_id && 
              m.content === newMessage.content && 
              (m.id.startsWith('temp-') || m.id.length < 20)
            );

            if (matchingIndex !== -1) {
              const next = [...prev];
              next[matchingIndex] = newMessage;
              return next;
            }

            return [...prev, newMessage];
          });

          scrollToBottom();
          // Mark as read when receiving a new message while in chat
          await supabase.rpc('mark_trip_chat_read', { p_trip_id: tripId });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, toast]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const sendMessage = async (content: string, userId: string) => {
    if (!content.trim()) return;

    const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender_id: userId,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    const { error } = await supabase
      .from('trip_messages')
      .insert({
        trip_id: tripId,
        sender_id: userId,
        content: content.trim()
      });

    if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast({ title: "Errore invio", description: "Riprova più tardi.", variant: "destructive" });
      throw error;
    }
    
    scrollToBottom();
  };

  const sendPoll = async (question: string, options: string[], userId: string, allowMultiple: boolean = false) => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return;

    try {
      // 1. Create poll
      const { data: poll, error: pollError } = await supabase
        .from('trip_polls')
        .insert({
          trip_id: tripId,
          creator_id: userId,
          question: question.trim(),
          allow_multiple_answers: allowMultiple
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // 2. Create options
      const { error: optionsError } = await supabase
        .from('trip_poll_options')
        .insert(
          options
            .filter(o => o.trim())
            .map(text => ({ poll_id: poll.id, text: text.trim() }))
        );

      if (optionsError) throw optionsError;

      // 3. Create message
      const { error: messageError } = await supabase
        .from('trip_messages')
        .insert({
          trip_id: tripId,
          sender_id: userId,
          poll_id: poll.id,
          content: question.trim()
        });

      if (messageError) throw messageError;
      
      // Optimistic update
      const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;
      const newMessage: ChatMessage = {
        id: tempId,
        sender_id: userId,
        content: question.trim(),
        poll_id: poll.id,
        created_at: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({ title: "Errore", description: "Impossibile creare il sondaggio.", variant: "destructive" });
    }
  };

  return {
    messages,
    loading,
    members,
    sendMessage,
    sendPoll,
    scrollRef
  };
};
