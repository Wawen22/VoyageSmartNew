import { useState, useCallback, useEffect } from "react";
import { aiService } from "@/lib/ai/service";
import { AIMessage } from "@/lib/ai/types";
import { useItinerary } from "@/hooks/useItinerary";
import { useExpenses } from "@/hooks/useExpenses";
import { useTripIdeas } from "@/hooks/useTripIdeas";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useTransports } from "@/hooks/useTransports";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UseTripAIProps {
  tripId: string;
  tripDetails: {
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    description: string | null;
  } | null;
}

export function useTripAI({ tripId, tripDetails }: UseTripAIProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Context Data Hooks
  const { activities } = useItinerary(tripId);
  const { expenses, totalSpent } = useExpenses(tripId);
  const { ideas } = useTripIdeas(tripId);
  const { accommodations } = useAccommodations(tripId);
  const { transports } = useTransports(tripId);

  // Load Chat History
  useEffect(() => {
    if (!user || !tripId) return;

    const loadHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_chat_messages')
          .select('role, content')
          .eq('trip_id', tripId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };

    loadHistory();
  }, [tripId, user]);

  const buildSystemContext = useCallback(() => {
    if (!tripDetails) return "";

    let context = `Sei VoyageSmart AI, un assistente di viaggio intelligente per il viaggio "${tripDetails.title}".
Dettagli Viaggio:
- Destinazione: ${tripDetails.destination}
- Date: ${format(new Date(tripDetails.start_date), "d MMM yyyy", { locale: it })} - ${format(new Date(tripDetails.end_date), "d MMM yyyy", { locale: it })}
- Descrizione: ${tripDetails.description || "Nessuna descrizione."}

Contesto Attuale:
`;

    // Itinerary
    if (activities && activities.length > 0) {
      context += `
Itinerario (${activities.length} attività):
${activities.map(a => `- [${format(new Date(a.activity_date), "d MMM")}] ${a.title} (${a.category})`).join("\n")}
`;
    }

    // Accommodations
    if (accommodations && accommodations.length > 0) {
      context += `
Alloggi:
${accommodations.map(a => `- ${a.name} (${a.check_in_date} - ${a.check_out_date})`).join("\n")}
`;
    }

    // Transports
    if (transports && transports.length > 0) {
       context += `
Trasporti:
${transports.map(t => `- ${t.type}: ${t.departure_location} -> ${t.arrival_location} (${format(new Date(t.departure_date), "d MMM HH:mm")})`).join("\n")}
`;
    }

    // Expenses
    if (expenses && expenses.length > 0) {
      context += `
Spese:
- Totale Speso: €${totalSpent.toFixed(2)}
- Ultime spese: ${expenses.slice(0, 5).map(e => `${e.description} (€${e.amount})`).join(", ")}
`;
    }

    // Ideas
    if (ideas && ideas.length > 0) {
      context += `
Idee e Note:
${ideas.slice(0, 5).map(i => `- ${i.title || i.content?.substring(0, 50)}`).join("\n")}
`;
    }

    context += `
Istruzioni:
- Rispondi alle domande dell'utente relative a questo viaggio.
- Sii utile, conciso e amichevole.
- Usa le informazioni fornite per dare risposte contestuali (es. "Dove dormiamo?" -> controlla Alloggi).
- Se l'utente chiede raccomandazioni (ristoranti, attività), offri suggerimenti basati sulla destinazione e sugli orari liberi nell'itinerario.
- Parla in Italiano.
`;

    return context;
  }, [tripDetails, activities, expenses, ideas, accommodations, transports, totalSpent]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return;

    setIsLoading(true);
    setError(null);

    const userMessage: AIMessage = { role: 'user', content };
    
    // Optimistic update
    setMessages(prev => [...prev, userMessage]);

    try {
      // 1. Save User Message
      const { error: saveError } = await supabase.from('ai_chat_messages').insert({
        trip_id: tripId,
        user_id: user.id,
        role: 'user',
        content: content
      });
      
      if (saveError) console.error("Error saving user message:", saveError);

      const systemContext = buildSystemContext();
      
      const response = await aiService.sendMessage([
        { role: 'system', content: systemContext },
        ...messages, // Chat history
        userMessage
      ]);

      const assistantMessage: AIMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);

      // 2. Save Assistant Message
      const { error: saveResponseError } = await supabase.from('ai_chat_messages').insert({
        trip_id: tripId,
        user_id: user.id,
        role: 'assistant',
        content: response
      });

      if (saveResponseError) console.error("Error saving AI message:", saveResponseError);

    } catch (err) {
      console.error("AI Error:", err);
      setError("Si è verificato un errore nella comunicazione con l'assistente.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    
    setMessages([]);
    try {
      const { error } = await supabase
        .from('ai_chat_messages')
        .delete()
        .eq('trip_id', tripId)
        .eq('user_id', user.id);
        
      if (error) throw error;
    } catch (err) {
      console.error("Error clearing chat history:", err);
      setError("Impossibile cancellare la cronologia.");
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearChat
  };
}