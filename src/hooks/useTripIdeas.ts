import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type IdeaType = 'NOTE' | 'LINK' | 'IMAGE';

export interface TripIdea {
  id: string;
  trip_id: string;
  created_by: string;
  title: string | null;
  content: string | null;
  type: IdeaType;
  media_url: string | null;
  created_at: string;
  // Extended fields
  votes_count?: number;
  comments_count?: number;
  has_voted?: boolean;
}

export const useTripIdeas = (tripId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ideas, isLoading } = useQuery({
    queryKey: ['trip-ideas', tripId],
    queryFn: async () => {
      // 1. Fetch Ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('trip_ideas')
        .select('*, comments:trip_idea_comments(count)')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (ideasError) throw ideasError;

      // 2. Fetch Votes for this trip
      const { data: votesData, error: votesError } = await supabase
        .from('trip_idea_votes')
        .select('idea_id, user_id')
        .eq('trip_id', tripId);

      if (votesError) throw votesError;

      // 3. Map votes to ideas
      const user = (await supabase.auth.getUser()).data.user;
      
      const ideasWithVotes = ideasData.map((idea) => {
        const ideaVotes = votesData.filter(v => v.idea_id === idea.id);
        const hasVoted = user ? ideaVotes.some(v => v.user_id === user.id) : false;
        
        return {
          ...idea,
          votes_count: ideaVotes.length,
          comments_count: idea.comments?.[0]?.count || 0,
          has_voted: hasVoted
        } as TripIdea;
      });

      return ideasWithVotes;
    },
    enabled: !!tripId,
  });

  const createIdea = useMutation({
    mutationFn: async ({ 
      title, 
      content, 
      type, 
      file 
    }: { 
      title: string; 
      content: string; 
      type: IdeaType; 
      file?: File | null 
    }) => {
      let media_url = null;

      // Handle Image Upload
      if (type === 'IMAGE' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${tripId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('trip-ideas')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('trip-ideas')
          .getPublicUrl(fileName);

        media_url = publicUrl;
      } else if (type === 'LINK') {
        media_url = content; // Store the URL in media_url for links
      }

      const { data, error } = await supabase
        .from('trip_ideas')
        .insert({
          trip_id: tripId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          title,
          content: type === 'LINK' ? null : content,
          type,
          media_url
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-ideas', tripId] });
      toast({
        title: "Idea aggiunta",
        description: "La tua idea è stata salvata nella bacheca.",
      });
    },
    onError: (error) => {
      console.error('Error creating idea:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile salvare l'idea.",
        variant: "destructive",
      });
    },
  });

  const deleteIdea = useMutation({
    mutationFn: async (ideaId: string) => {
      const { error } = await supabase
        .from('trip_ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-ideas', tripId] });
      toast({
        title: "Idea eliminata",
        description: "L'elemento è stato rimosso dalla bacheca.",
      });
    },
    onError: (error) => {
      console.error('Error deleting idea:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile eliminare l'idea.",
        variant: "destructive",
      });
    },
  });

  const updateIdea = useMutation({
    mutationFn: async ({ 
      id,
      title, 
      content, 
      type,
    }: { 
      id: string;
      title: string; 
      content: string; 
      type: IdeaType;
    }) => {
      const updateData: any = {
        title,
        type
      };

      if (type === 'LINK') {
        updateData.media_url = content;
      } else if (type === 'NOTE') {
        updateData.content = content;
      }

      const { data, error } = await supabase
        .from('trip_ideas')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-ideas', tripId] });
      toast({
        title: "Idea aggiornata",
        description: "Le modifiche sono state salvate.",
      });
    },
    onError: (error) => {
      console.error('Error updating idea:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'idea.",
        variant: "destructive",
      });
    },
  });

  const toggleVote = useMutation({
    mutationFn: async ({ ideaId, hasVoted }: { ideaId: string, hasVoted: boolean }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Utente non autenticato");

      if (hasVoted) {
        // Remove vote
        const { error } = await supabase
          .from('trip_idea_votes')
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Add vote
        const { error } = await supabase
          .from('trip_idea_votes')
          .insert({
            trip_id: tripId,
            idea_id: ideaId,
            user_id: user.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-ideas', tripId] });
    },
    onError: (error) => {
      console.error('Error toggling vote:', error);
      toast({
        title: "Errore",
        description: "Impossibile registrare il voto.",
        variant: "destructive",
      });
    }
  });

  return {
    ideas,
    isLoading,
    createIdea,
    deleteIdea,
    updateIdea,
    toggleVote
  };
};