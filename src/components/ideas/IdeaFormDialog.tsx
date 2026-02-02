import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTripIdeas, TripIdea } from "@/hooks/useTripIdeas";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface IdeaFormDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TripIdea; // If present, we are in Edit mode
}

export function IdeaFormDialog({ tripId, open, onOpenChange, initialData }: IdeaFormDialogProps) {
  const { createIdea, updateIdea } = useTripIdeas(tripId);
  
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [dayNumber, setDayNumber] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData && open) {
      setTitle(initialData.title || "");
      setLocation(initialData.location || "");
      setDayNumber(initialData.day_number ? String(initialData.day_number) : "");
      setContent(initialData.content || "");
      setUrl(initialData.url || "");
      setFile(null); // Clear file when opening for edit
    } else if (!open) {
      // Small delay to prevent flickering while dialog closes
      const timer = setTimeout(() => {
        if (!initialData) resetForm();
        setFile(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Minimum validation: Require at least title or content
    if (!title && !content) {
      // Maybe show a toast or error? For now just return
      return;
    }

    const isEdit = !!initialData;
    const parsedDayNumber = dayNumber.trim() ? Number.parseInt(dayNumber, 10) : null;
    const safeDayNumber = Number.isNaN(parsedDayNumber) ? null : parsedDayNumber;

    try {
      if (isEdit) {
        await updateIdea.mutateAsync({
          id: initialData.id,
          title,
          location,
          dayNumber: safeDayNumber,
          content,
          url,
          file
        });
      } else {
        await createIdea.mutateAsync({
          title,
          location,
          dayNumber: safeDayNumber,
          content,
          url,
          file
        });
      }
      onOpenChange(false);
      if (!isEdit) resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setDayNumber("");
    setContent("");
    setUrl("");
    setFile(null);
  };

  const isPending = createIdea.isPending || updateIdea.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Modifica Idea" : "Nuova Idea"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Aggiorna i dettagli della tua idea." : "Aggiungi note, luoghi, link o foto per il tuo viaggio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="title">Titolo</Label>
              <Input 
                id="title" 
                placeholder="Es. Ristorante romantico" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Luogo</Label>
              <Input
                id="location"
                placeholder="Es. Trastevere, Roma"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day-number">Giorno del viaggio (Opzionale)</Label>
            <Input
              id="day-number"
              type="number"
              min={1}
              step={1}
              placeholder="Es. 1 per il primo giorno"
              value={dayNumber}
              onChange={(e) => setDayNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Contenuto / Note</Label>
            <RichTextEditor 
              value={content} 
              onChange={setContent} 
              placeholder="Scrivi qui i dettagli..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Link URL (Opzionale)</Label>
            <Input 
              id="url" 
              type="url" 
              placeholder="https://..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-file">Immagine (Opzionale)</Label>
            <Input 
              id="image-file" 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            {file ? (
              <p className="text-sm text-muted-foreground">Nuova immagine selezionata: {file.name}</p>
            ) : initialData?.media_url ? (
              <div className="space-y-1">
                 <p className="text-xs text-muted-foreground">Immagine attuale:</p>
                 <div className="aspect-video w-40 overflow-hidden rounded-md border relative">
                   <img src={initialData.media_url} alt="Current" className="w-full h-full object-cover" />
                 </div>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Aggiorna" : "Salva"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}