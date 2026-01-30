import { useTripIdeas } from "@/hooks/useTripIdeas";
import { IdeaCard } from "./IdeaCard";
import { AddIdeaDialog } from "./AddIdeaDialog";
import { Loader2, Lightbulb } from "lucide-react";

interface IdeaBoardProps {
  tripId: string;
}

export function IdeaBoard({ tripId }: IdeaBoardProps) {
  const { ideas, isLoading, deleteIdea } = useTripIdeas(tripId);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Bacheca Idee
          </h2>
          <p className="text-muted-foreground">
            Raccogli spunti, link e foto per il tuo viaggio.
          </p>
        </div>
        <AddIdeaDialog tripId={tripId} />
      </div>

      {(!ideas || ideas.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-muted/20">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Nessuna idea, per ora</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mb-6">
            La bacheca è vuota. Inizia aggiungendo link interessanti, note o foto di luoghi che vorresti visitare.
          </p>
          <AddIdeaDialog tripId={tripId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="h-full">
              <IdeaCard 
                idea={idea} 
                onDelete={(id) => deleteIdea.mutate(id)} 
                tripId={tripId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
