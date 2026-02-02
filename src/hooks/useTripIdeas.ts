import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TripIdea {
  id: string;
  trip_id: string;
  created_by: string;
  title: string | null;
  location: string | null;
  day_number: number | null;
  content: string | null;
  url: string | null;
  type: string; // Simplified, effectively ignored or defaulted
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
      location,
      dayNumber,
      content, 
      url, 
      file 
    }: { 
      title: string; 
      location: string;
      dayNumber: number | null;
      content: string; 
      url?: string;
      file?: File | null 
    }) => {
      let media_url = null;

      // Handle Image Upload
      if (file) {
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
      }

      const { data, error } = await supabase
        .from('trip_ideas')
        .insert({
          trip_id: tripId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          title,
          location,
          day_number: dayNumber,
          content,
          url: url || null,
          type: 'IDEA', // Default type
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
      location,
      dayNumber,
      content, 
      url,
      file
    }: { 
      id: string;
      title: string; 
      location: string;
      dayNumber: number | null;
      content: string; 
      url?: string;
      file?: File | null;
    }) => {
      let media_url = undefined;

      // Handle Image Upload if new file provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${tripId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('trip-ideas')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('trip-ideas')
          .getPublicUrl(fileName);

        media_url = publicUrl;
      }

      const updateData: any = {
        title,
        location,
        day_number: dayNumber,
        content,
        url: url || null
      };

      if (media_url) {
        updateData.media_url = media_url;
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
