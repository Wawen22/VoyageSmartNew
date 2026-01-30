import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Image, FileText, Loader2 } from "lucide-react";
import { useTripIdeas, IdeaType, TripIdea } from "@/hooks/useTripIdeas";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface IdeaFormDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TripIdea; // If present, we are in Edit mode
}

export function IdeaFormDialog({ tripId, open, onOpenChange, initialData }: IdeaFormDialogProps) {
  const [activeTab, setActiveTab] = useState<IdeaType>('NOTE');
  const { createIdea, updateIdea } = useTripIdeas(tripId);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setActiveTab(initialData.type);
      if (initialData.type === 'LINK') {
        setContent(initialData.media_url || "");
      } else {
        setContent(initialData.content || "");
      }
    } else {
      resetForm();
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'NOTE' && !content) return;
    if (activeTab === 'LINK' && !content) return;
    if (activeTab === 'IMAGE' && !file && !initialData) return; // Allow update without new file

    const isEdit = !!initialData;
    const isLoading = isEdit ? updateIdea.isPending : createIdea.isPending;

    try {
      if (isEdit) {
        await updateIdea.mutateAsync({
          id: initialData.id,
          title,
          content,
          type: activeTab
        });
      } else {
        await createIdea.mutateAsync({
          title,
          content,
          type: activeTab,
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
    setContent("");
    setFile(null);
    setActiveTab('NOTE');
  };

  const isPending = createIdea.isPending || updateIdea.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Modifica Idea" : "Nuova Idea"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Aggiorna i dettagli della tua idea." : "Aggiungi una nota, un link utile o una foto."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="NOTE" value={activeTab} onValueChange={(v) => setActiveTab(v as IdeaType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="NOTE" className="gap-2" disabled={!!initialData && initialData.type !== 'NOTE'}><FileText className="h-4 w-4"/> Nota</TabsTrigger>
            <TabsTrigger value="LINK" className="gap-2" disabled={!!initialData && initialData.type !== 'LINK'}><Link className="h-4 w-4"/> Link</TabsTrigger>
            <TabsTrigger value="IMAGE" className="gap-2" disabled={!!initialData && initialData.type !== 'IMAGE'}><Image className="h-4 w-4"/> Foto</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo (Opzionale)</Label>
              <Input 
                id="title" 
                placeholder="Es. Ristorante romantico" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>

            <TabsContent value="NOTE" className="space-y-2 mt-0">
              <Label>Contenuto</Label>
              <RichTextEditor 
                value={content} 
                onChange={setContent} 
                placeholder="Scrivi qui la tua nota..."
              />
            </TabsContent>

            <TabsContent value="LINK" className="space-y-2 mt-0">
              <Label htmlFor="link-url">URL</Label>
              <Input 
                id="link-url" 
                type="url" 
                placeholder="https://..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required={activeTab === 'LINK'}
              />
            </TabsContent>

            <TabsContent value="IMAGE" className="space-y-2 mt-0">
              {!initialData && (
                <>
                  <Label htmlFor="image-file">Carica Immagine</Label>
                  <Input 
                    id="image-file" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required={activeTab === 'IMAGE' && !initialData}
                    className="cursor-pointer"
                  />
                  {file && <p className="text-sm text-muted-foreground">Selezionato: {file.name}</p>}
                </>
              )}
              {initialData?.type === 'IMAGE' && (
                <div className="aspect-video w-full overflow-hidden rounded-md border">
                  <img src={initialData.media_url || ''} alt="Current" className="w-full h-full object-cover" />
                </div>
              )}
            </TabsContent>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Aggiorna" : "Salva"}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
