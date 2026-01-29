import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera } from "lucide-react";

export interface ProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileData | null;
  onProfileUpdated: () => void;
}

export function EditProfileDialog({ open, onOpenChange, profile, onProfileUpdated }: EditProfileDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
      });
      setPreviewUrl(profile.avatar_url);
    }
  }, [profile, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    try {
      let avatarPath = profile.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarPath = publicUrl;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          avatar_url: avatarPath,
          updated_at: new Date().toISOString(),
        } as any) // Casting as any because types are not yet regenerated
        .eq('id', profile.id);

      if (error) throw error;

      toast.success("Profilo aggiornato con successo!");
      onProfileUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Errore durante l'aggiornamento del profilo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Modifica Profilo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative group cursor-pointer">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || ""} objectFit="cover" />
                <AvatarFallback>{formData.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-6 w-6 text-white" />
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">Clicca per cambiare foto</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="pl-8"
                placeholder="username"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Il tuo nome"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Racconta qualcosa di te..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Posizione</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Città, Paese"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website">Sito Web</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salva modifiche
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
