import { useState } from "react";
import { aiService } from "@/lib/ai/service";
import { TRIP_TOOLS } from "@/lib/ai/tools";

export interface AnalyzedData {
  entity_type: "transport" | "accommodation" | "activity" | "expense";
  data: {
    title?: string;
    date?: string;
    time?: string;
    end_date?: string;
    location?: string;
    price?: number;
    currency?: string;
    details?: string;
  };
}

export function useDocumentAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzedData | null>(null);

  const analyze = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      const systemPrompt = `Sei un esperto analista di documenti di viaggio.
Analizza l'immagine/documento fornito ed estrai i dettagli chiave.
Se trovi una prenotazione (volo, hotel, treno, evento) o una ricevuta di spesa, USA LO STRUMENTO 'extract_trip_data' per restituire i dati strutturati.
Se il documento non contiene informazioni utili per un itinerario o budget, rispondi semplicemente "Nessun dato rilevante trovato" senza usare strumenti.
Cerca di estrarre:
- Date e orari precisi
- Luoghi (partenza/arrivo o indirizzo)
- Prezzi (se presenti)
- Codici di prenotazione (nel campo details)
`;

      const response = await aiService.sendMessage(
        [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: "Analizza questo documento e estrai i dati.",
            images: [base64]
          }
        ],
        TRIP_TOOLS.filter(t => t.name === 'extract_trip_data')
      );

      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolCall = response.toolCalls.find(tc => tc.name === 'extract_trip_data');
        if (toolCall) {
          setResult(toolCall.args as AnalyzedData);
        }
      }

    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResult = () => setResult(null);

  return {
    analyze,
    isAnalyzing,
    result,
    clearResult
  };
}
