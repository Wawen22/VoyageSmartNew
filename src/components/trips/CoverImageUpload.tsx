import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CoverImageUploadProps {
  tripId: string;
  userId: string;
  currentImage: string | null;
  onImageUpdate: (url: string | null) => void;
}

export function CoverImageUpload({
  tripId,
  userId,
  currentImage,
  onImageUpdate,
}: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato non valido",
        description: "Seleziona un'immagine (JPG, PNG, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "L'immagine deve essere inferiore a 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${tripId}-${Date.now()}.${fileExt}`;

      // Delete old image if exists
      if (currentImage) {
        const oldPath = currentImage.split("/trip-covers/")[1];
        if (oldPath) {
          await supabase.storage.from("trip-covers").remove([oldPath]);
        }
      }

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from("trip-covers")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("trip-covers")
        .getPublicUrl(fileName);

      // Update trip record
      const { error: updateError } = await supabase
        .from("trips")
        .update({ cover_image: publicUrl })
        .eq("id", tripId);

      if (updateError) throw updateError;

      onImageUpdate(publicUrl);

      toast({
        title: "Immagine caricata",
        description: "La copertina del viaggio è stata aggiornata",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Errore upload",
        description: error.message || "Impossibile caricare l'immagine",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImage) return;

    setIsUploading(true);

    try {
      const oldPath = currentImage.split("/trip-covers/")[1];
      if (oldPath) {
        await supabase.storage.from("trip-covers").remove([oldPath]);
      }

      const { error } = await supabase
        .from("trips")
        .update({ cover_image: null })
        .eq("id", tripId);

      if (error) throw error;

      onImageUpdate(null);

      toast({
        title: "Immagine rimossa",
        description: "La copertina è stata eliminata",
      });
    } catch (error: any) {
      console.error("Remove error:", error);
      toast({
        title: "Errore",
        description: "Impossibile rimuovere l'immagine",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {currentImage ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group rounded-2xl overflow-hidden"
          >
            <img
              src={currentImage}
              alt="Cover del viaggio"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Cambia
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative h-48 rounded-2xl border-2 border-dashed cursor-pointer
              transition-all duration-300 flex flex-col items-center justify-center gap-3
              ${isDragging 
                ? "border-primary bg-primary/10 scale-[1.02]" 
                : "border-border hover:border-primary/50 hover:bg-muted/50"
              }
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {isDragging ? "Rilascia l'immagine" : "Aggiungi copertina"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trascina o clicca per caricare (max 5MB)
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
