import { useState, useRef } from "react";
import { Paperclip, X, FileText, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  tripId: string;
  folder: "expenses" | "accommodations" | "transports";
  label?: string;
  accept?: string;
}

export function DocumentUpload({
  value,
  onChange,
  tripId,
  folder,
  label = "Documento",
  accept = "image/*,.pdf,.doc,.docx"
}: DocumentUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "Il file deve essere inferiore a 8MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${tripId}/${folder}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("trip-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("trip-documents")
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast({ title: "Documento caricato" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Errore upload",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extract file path from URL
      const url = new URL(value);
      const pathMatch = url.pathname.match(/\/trip-documents\/(.+)$/);
      if (pathMatch) {
        await supabase.storage
          .from("trip-documents")
          .remove([pathMatch[1]]);
      }
      onChange(null);
      toast({ title: "Documento rimosso" });
    } catch (error: any) {
      console.error("Remove error:", error);
      onChange(null);
    }
  };

  const isImage = value?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {value ? (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          {isImage ? (
            <img 
              src={value} 
              alt="Preview" 
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <FileText className="w-8 h-8 text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">Documento allegato</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => window.open(value, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleUpload}
            className="hidden"
            id={`doc-upload-${folder}`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <Paperclip className="w-4 h-4 mr-2" />
                Allega documento
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
