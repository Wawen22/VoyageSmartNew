import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ChatReaction {
  id: string;
  user_id: string;
  emoji: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string | null;
  poll_id?: string | null;
  created_at: string;
  reactions?: ChatReaction[];
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
        .select(`
          *,
          reactions:trip_message_reactions(id, user_id, emoji)
        `)
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

    // Realtime Reactions Subscription
    const reactionChannel = supabase
      .channel(`trip-chat-reactions-${tripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trip_message_reactions' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReaction = payload.new as ChatReaction & { message_id: string };
            setMessages(prev => prev.map(msg => {
              if (msg.id === newReaction.message_id) {
                const reactions = msg.reactions || [];
                
                // 1. Check if ID already exists (avoid double processing)
                if (reactions.some(r => r.id === newReaction.id)) return msg;

                // 2. Check for matching optimistic reaction (same user and emoji)
                const optimisticIndex = reactions.findIndex(r => 
                  r.user_id === newReaction.user_id && 
                  r.emoji === newReaction.emoji && 
                  r.id.startsWith('temp-')
                );

                if (optimisticIndex !== -1) {
                  // Replace optimistic with real
                  const updatedReactions = [...reactions];
                  updatedReactions[optimisticIndex] = newReaction;
                  return { ...msg, reactions: updatedReactions };
                }

                // 3. Just append if no match found
                return {
                  ...msg,
                  reactions: [...reactions, newReaction]
                };
              }
              return msg;
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedReaction = payload.old as { id: string };
            setMessages(prev => prev.map(msg => {
              if (msg.reactions?.some(r => r.id === deletedReaction.id)) {
                return {
                  ...msg,
                  reactions: msg.reactions.filter(r => r.id !== deletedReaction.id)
                };
              }
              return msg;
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(reactionChannel);
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

  const toggleReaction = async (messageId: string, emoji: string, userId: string) => {
    // 1. Find message and check if user already reacted with this emoji
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const message = messages[messageIndex];
    const existingReaction = message.reactions?.find(r => r.user_id === userId && r.emoji === emoji);

    // 2. Optimistic Update
    setMessages(prev => {
      const next = [...prev];
      const msg = { ...next[messageIndex] };
      
      if (existingReaction) {
        // Remove
        msg.reactions = msg.reactions?.filter(r => r.id !== existingReaction.id);
      } else {
        // Add (temp id)
        msg.reactions = [
          ...(msg.reactions || []),
          { id: `temp-${Date.now()}`, user_id: userId, emoji }
        ];
      }
      
      next[messageIndex] = msg;
      return next;
    });

    try {
      if (existingReaction) {
        // Remove from DB
        await supabase
          .from('trip_message_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Add to DB
        await supabase
          .from('trip_message_reactions')
          .insert({
            message_id: messageId,
            user_id: userId,
            emoji
          });
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
      // Revert optimistic update (could be better, but simple re-fetch works for now or complex rollback logic)
    }
  };

  return {
    messages,
    loading,
    members,
    sendMessage,
    sendPoll,
    toggleReaction,
    scrollRef
  };
};
