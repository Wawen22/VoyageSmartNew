import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import type { ExpenseCategory } from "@/hooks/useExpenses";

interface TripMember {
  user_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  members: TripMember[];
  currentUserId: string;
  onSubmit: (data: {
    trip_id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    paid_by: string;
    expense_date: string;
    split_with: string[];
    receipt_url?: string;
  }) => Promise<boolean>;
}

const CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: "food", label: "Cibo & Ristoranti", emoji: "🍽️" },
  { value: "transport", label: "Trasporti", emoji: "🚗" },
  { value: "accommodation", label: "Alloggio", emoji: "🏨" },
  { value: "activities", label: "Attività", emoji: "🎭" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "other", label: "Altro", emoji: "📦" },
];

export function AddExpenseDialog({
  open,
  onOpenChange,
  tripId,
  members,
  currentUserId,
  onSubmit
}: AddExpenseDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitWith, setSplitWith] = useState<string[]>(members.map(m => m.user_id));
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSplitToggle = (userId: string) => {
    setSplitWith(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || splitWith.length === 0) return;

    setSubmitting(true);
    const success = await onSubmit({
      trip_id: tripId,
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      paid_by: paidBy,
      expense_date: expenseDate,
      split_with: splitWith,
      receipt_url: receiptUrl || undefined
    });

    if (success) {
      setDescription("");
      setAmount("");
      setCategory("food");
      setPaidBy(currentUserId);
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setSplitWith(members.map(m => m.user_id));
      setReceiptUrl(null);
      onOpenChange(false);
    }
    setSubmitting(false);
  };

  const splitAmount = splitWith.length > 0 
    ? (parseFloat(amount) || 0) / splitWith.length 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aggiungi Spesa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Input
              id="description"
              placeholder="Es. Cena al ristorante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Importo (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Pagato da</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.profile?.full_name || "Utente"} 
                    {member.user_id === currentUserId && " (tu)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dividi con</Label>
            <div className="rounded-lg border border-border p-3 space-y-2 max-h-40 overflow-y-auto">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center gap-3">
                  <Checkbox
                    id={`split-${member.user_id}`}
                    checked={splitWith.includes(member.user_id)}
                    onCheckedChange={() => handleSplitToggle(member.user_id)}
                  />
                  <label
                    htmlFor={`split-${member.user_id}`}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    {member.profile?.full_name || "Utente"}
                    {member.user_id === currentUserId && " (tu)"}
                  </label>
                  <AnimatePresence>
                    {splitWith.includes(member.user_id) && amount && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-sm text-muted-foreground"
                      >
                        €{splitAmount.toFixed(2)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            {splitWith.length === 0 && (
              <p className="text-xs text-destructive">Seleziona almeno una persona</p>
            )}
          </div>

          <DocumentUpload
            value={receiptUrl}
            onChange={setReceiptUrl}
            tripId={tripId}
            folder="expenses"
            label="Ricevuta / Scontrino"
            accept="image/*,.pdf"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="sunset"
              className="flex-1"
              disabled={submitting || !description.trim() || !amount || splitWith.length === 0}
            >
              {submitting ? "Salvataggio..." : "Aggiungi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
