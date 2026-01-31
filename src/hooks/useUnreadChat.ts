import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useUnreadChat = (tripId: string | null) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!tripId || !user) {
      setUnreadCount(0);
      return;
    }

    let isMounted = true;

    const fetchUnreadCount = async () => {
      // 1. Get last read time
      const { data: memberData, error: memberError } = await supabase
        .from('trip_members')
        .select('last_read_chat_at')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData) {
        // Handle error or not member
        return;
      }

      const lastRead = memberData.last_read_chat_at;

      // 2. Count messages after last read
      let query = supabase
        .from('trip_messages')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', tripId);

      if (lastRead) {
        query = query.gt('created_at', lastRead);
      }

      const { count, error: countError } = await query;

      if (!countError && count !== null && isMounted) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // 3. Subscribe to new messages
    const messageChannel = supabase
      .channel(`unread-messages-${tripId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trip_messages', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          const newMessage = payload.new as any;
          if (newMessage.sender_id !== user.id) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    // 4. Subscribe to member updates (to detect mark as read)
    const memberChannel = supabase
      .channel(`unread-members-${tripId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'trip_members', 
          filter: `trip_id=eq.${tripId}&user_id=eq.${user.id}` 
        },
        () => {
          // When member is updated (likely read time changed), re-fetch or reset
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(memberChannel);
    };
  }, [tripId, user]);

  return unreadCount;
};
