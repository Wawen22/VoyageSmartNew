import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Trash2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

interface IdeaCommentsProps {
  ideaId: string;
  tripId: string;
}

export function IdeaComments({ ideaId, tripId }: IdeaCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchComments = async () => {
    try {
      // 1. Fetch Comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("trip_idea_comments")
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq("idea_id", ideaId)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      // 2. Fetch Profiles for authors
      const userIds = Array.from(new Set(commentsData.map(c => c.user_id)));
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // 3. Map profiles to comments
      const profilesMap: Record<string, any> = {};
      profilesData?.forEach(p => {
        if (p.user_id) profilesMap[p.user_id] = p;
      });

      const enrichedComments = commentsData.map(c => ({
        ...c,
        profiles: profilesMap[c.user_id] || null
      }));

      setComments(enrichedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`comments-${ideaId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_idea_comments",
          filter: `idea_id=eq.${ideaId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ideaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from("trip_idea_comments").insert({
        trip_id: tripId,
        idea_id: ideaId,
        user_id: user.id,
        content: newComment.trim()
      });

      if (error) throw error;
      setNewComment("");
      // Manually refetch to ensure UI updates immediately
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("trip_idea_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="flex flex-col mt-6 pt-4 border-t">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Commenti ({comments.length})
      </h4>

      <div className="flex flex-col h-[300px] border rounded-md bg-background overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 text-sm">
              <p>Nessun commento.</p>
              <p className="text-xs">Inizia la discussione!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 items-start group">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarImage src={comment.profiles?.avatar_url || ""} />
                  <AvatarFallback className="text-xs">
                    {(comment.profiles?.full_name || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold truncate">
                      {comment.profiles?.full_name || "Utente"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), "d MMM, HH:mm", { locale: it })}
                    </span>
                  </div>
                  <div className="text-sm text-foreground/90 whitespace-pre-wrap break-words bg-muted/40 p-2.5 rounded-lg rounded-tl-none">
                    {comment.content}
                  </div>
                </div>
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t bg-muted/10">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Scrivi un commento..."
              className="min-h-[40px] max-h-[100px] resize-none text-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={sending || !newComment.trim()}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
