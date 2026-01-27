import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "general", label: "Generale" },
  { value: "documents", label: "Documenti" },
  { value: "clothes", label: "Vestiti" },
  { value: "electronics", label: "Elettronica" },
  { value: "toiletries", label: "Igiene personale" },
  { value: "health", label: "Salute" },
  { value: "money", label: "Soldi" },
  { value: "other", label: "Altro" },
];

interface AddChecklistItemDialogProps {
  isPersonal: boolean;
  onAdd: (data: { text: string; isPersonal: boolean; category: string }) => void;
  isLoading?: boolean;
}

export function AddChecklistItemDialog({
  isPersonal,
  onAdd,
  isLoading,
}: AddChecklistItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("general");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAdd({ text: text.trim(), isPersonal, category });
    setText("");
    setCategory("general");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Aggiungi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isPersonal ? "Aggiungi elemento personale" : "Aggiungi elemento di gruppo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Cosa portare/fare</Label>
            <Input
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="es. Passaporto, Caricabatterie..."
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={!text.trim() || isLoading}>
              Aggiungi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
