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
}

export const useTripIdeas = (tripId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ideas, isLoading } = useQuery({
    queryKey: ['trip-ideas', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_ideas')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TripIdea[];
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
          content: type === 'LINK' ? null : content, // Don't duplicate URL in content for links
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

  return {
    ideas,
    isLoading,
    createIdea,
    deleteIdea,
    updateIdea
  };
};
