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
import { TRIP_TOOLS } from "@/lib/ai/tools";

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

export interface ChatMessage extends AIMessage {
  id?: string;
  toolCalls?: any[];
  isExecuted?: boolean;
}

export function useTripAI({ tripId, tripDetails }: UseTripAIProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Context Data Hooks
  const { activities, createActivity } = useItinerary(tripId);
  const { expenses, totalSpent, createExpense } = useExpenses(tripId);
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
          .select('id, role, content, metadata')
          .eq('trip_id', tripId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          setMessages(data.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            toolCalls: m.metadata?.tool_calls,
            isExecuted: m.metadata?.executed
          })));
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
${activities.map(a => `- [ID: ${a.id}] [${format(new Date(a.activity_date), "d MMM")}] ${a.title} (${a.category})`).join("\n")}
`;
    }

    // Accommodations
    if (accommodations && accommodations.length > 0) {
      context += `
Alloggi:
${accommodations.map(a => `- [ID: ${a.id}] ${a.name} (${a.check_in_date} - ${a.check_out_date})`).join("\n")}
`;
    }

    // Transports
    if (transports && transports.length > 0) {
       context += `
Trasporti:
${transports.map(t => `- [ID: ${t.id}] ${t.type}: ${t.departure_location} -> ${t.arrival_location} (${format(new Date(t.departure_date), "d MMM HH:mm")})`).join("\n")}
`;
    }

    // Expenses
    if (expenses && expenses.length > 0) {
      context += `
Spese:
- Totale Speso: €${totalSpent.toFixed(2)}
- Ultime spese: ${expenses.slice(0, 5).map(e => `- [ID: ${e.id}] ${e.description} (€${e.amount})`).join("\n")}
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
- Usa le informazioni fornite per dare risposte contestuali.
- Per mostrare un elemento specifico usa: [[TYPE:ID]].
- Se l'utente chiede di eseguire un'azione (es. "aggiungi spesa", "crea attività"), USA GLI STRUMENTI (TOOLS) forniti. Non limitarti a dire "lo faccio", usa la function call.
- Parla in Italiano.
`;

    return context;
  }, [tripDetails, activities, expenses, ideas, accommodations, transports, totalSpent]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return;

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { role: 'user', content };
    
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
      ], TRIP_TOOLS);

      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: response.content || (response.toolCalls ? "Ho preparato un'azione per te:" : ""),
        toolCalls: response.toolCalls
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // 2. Save Assistant Message
      const { data: savedMsg, error: saveResponseError } = await supabase.from('ai_chat_messages').insert({
        trip_id: tripId,
        user_id: user.id,
        role: 'assistant',
        content: assistantMessage.content,
        metadata: response.toolCalls ? { tool_calls: response.toolCalls, executed: false } : null
      }).select().single();

      if (saveResponseError) console.error("Error saving AI message:", saveResponseError);
      
      // Update local state with real ID
      if (savedMsg) {
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, id: savedMsg.id } : m));
      }

    } catch (err) {
      console.error("AI Error:", err);
      setError("Si è verificato un errore nella comunicazione con l'assistente.");
    } finally {
      setIsLoading(false);
    }
  };

  const executeTool = async (messageId: string, toolCall: any) => {
    if (!user) return;

    try {
      if (toolCall.name === 'add_expense') {
        const amount = Number(toolCall.args.amount);
        const currency = toolCall.args.currency || 'EUR';
        
        await createExpense({
          trip_id: tripId,
          description: toolCall.args.description,
          amount: amount,
          original_amount: amount,
          original_currency: currency,
          exchange_rate: 1,
          category: 'other', // Default
          paid_by: user.id,
          split_with: [user.id]
        });
      } else if (toolCall.name === 'add_activity') {
        const date = toolCall.args.date || format(new Date(), "yyyy-MM-dd");
        
        await createActivity({
          trip_id: tripId,
          title: toolCall.args.title,
          activity_date: date,
          start_time: toolCall.args.time,
          category: toolCall.args.category || 'activity'
        });
      }

      // Mark as executed in DB
      await supabase.from('ai_chat_messages').update({
        metadata: { tool_calls: [toolCall], executed: true } // Preserve tool call but mark executed
      }).eq('id', messageId);

      // Update local state
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isExecuted: true } : m));

    } catch (e) {
      console.error("Error executing tool:", e);
      setError("Impossibile eseguire l'azione.");
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
    executeTool,
    isLoading,
    error,
    clearChat,
    contextData: {
      activities,
      expenses,
      ideas,
      accommodations,
      transports
    }
  };
}