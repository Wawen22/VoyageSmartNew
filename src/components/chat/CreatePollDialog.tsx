import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, BarChart2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (question: string, options: string[], allowMultiple: boolean) => void;
}

export function CreatePollDialog({ open, onOpenChange, onSubmit }: CreatePollDialogProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) return;

    onSubmit(question, validOptions, allowMultiple);
    onOpenChange(false);
    setQuestion("");
    setOptions(["", ""]);
    setAllowMultiple(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Crea un sondaggio
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question">Domanda</Label>
            <Input
              id="question"
              placeholder="Es. Dove mangiamo stasera?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          <div className="space-y-3">
            <Label>Opzioni</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder={`Opzione ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required={index < 2}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="w-full mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi opzione
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="allow-multiple">Risposte multiple</Label>
              <p className="text-[10px] text-muted-foreground">Gli utenti potranno scegliere più opzioni</p>
            </div>
            <Switch
              id="allow-multiple"
              checked={allowMultiple}
              onCheckedChange={setAllowMultiple}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={!question.trim() || options.filter(o => o.trim()).length < 2}>
              Invia sondaggio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
