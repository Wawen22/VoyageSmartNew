import { useState, useCallback } from "react";
import { aiService } from "@/lib/ai/service";
import { AIMessage } from "@/lib/ai/types";
import { useItinerary } from "@/hooks/useItinerary";
import { useExpenses } from "@/hooks/useExpenses";
import { useTripIdeas } from "@/hooks/useTripIdeas";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useTransports } from "@/hooks/useTransports";
import { format } from "date-fns";
import { it } from "date-fns/locale";

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
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Context Data Hooks
  // Note: These hooks might cause re-fetches. Ideally, we should pull data from a global store or React Query cache.
  // For now, this is acceptable for the prototype.
  const { activities } = useItinerary(tripId);
  const { expenses, totalSpent } = useExpenses(tripId);
  const { ideas } = useTripIdeas(tripId);
  const { accommodations } = useAccommodations(tripId);
  const { transports } = useTransports(tripId);

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
${activities.map(a => `- [${format(new Date(a.activity_date), "d MMM")} ] ${a.title} (${a.category})`).join("\n")}
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
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage: AIMessage = { role: 'user', content };
    
    // Optimistic update
    setMessages(prev => [...prev, userMessage]);

    try {
      const systemContext = buildSystemContext();
      
      const response = await aiService.sendMessage([
        { role: 'system', content: systemContext },
        ...messages, // Chat history
        userMessage
      ]);

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error("AI Error:", err);
      setError("Si è verificato un errore nella comunicazione con l'assistente.");
      // Remove user message if failed? Or just show error.
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearChat
  };
}
