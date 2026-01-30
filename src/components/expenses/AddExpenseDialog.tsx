import { useState, useEffect } from "react";
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
import { Loader2, RefreshCw } from "lucide-react";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import type { ExpenseCategory, ExpenseWithSplits } from "@/hooks/useExpenses";
import { CURRENCIES, getExchangeRate } from "@/lib/currency";

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
  expenseToEdit?: ExpenseWithSplits | null;
  onSubmit: (data: {
    id?: string;
    trip_id: string;
    description: string;
    amount: number;
    original_amount: number;
    original_currency: string;
    exchange_rate: number;
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
  expenseToEdit,
  onSubmit
}: AddExpenseDialogProps) {
  const [description, setDescription] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitWith, setSplitWith] = useState<string[]>(members.map(m => m.user_id));
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load expense data if editing
  useEffect(() => {
    if (open && expenseToEdit) {
      setDescription(expenseToEdit.description);
      
      // Handle legacy expenses (no original_amount)
      const amt = expenseToEdit.original_amount !== null ? expenseToEdit.original_amount : expenseToEdit.amount;
      setOriginalAmount(amt.toString());
      
      const curr = expenseToEdit.original_currency || "EUR";
      setCurrency(curr);
      
      setExchangeRate(expenseToEdit.exchange_rate || 1);
      setCategory(expenseToEdit.category);
      setPaidBy(expenseToEdit.paid_by);
      setExpenseDate(expenseToEdit.expense_date);
      setSplitWith(expenseToEdit.splits.map(s => s.user_id));
      setReceiptUrl(expenseToEdit.receipt_url);
    } else if (open && !expenseToEdit) {
      // Reset form if opening as new
      setDescription("");
      setOriginalAmount("");
      setCurrency("EUR");
      setCategory("food");
      setPaidBy(currentUserId);
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setSplitWith(members.map(m => m.user_id));
      setReceiptUrl(null);
      setExchangeRate(1);
    }
  }, [open, expenseToEdit, currentUserId, members]);

  // Fetch exchange rate when currency or date changes
  useEffect(() => {
    const fetchRate = async () => {
      // Don't fetch if editing and values match (avoids overwriting stored custom rates if we had them)
      // But for now, let's keep it simple: if currency changes by user interaction.
      // Ideally we shouldn't re-fetch if just opening edit dialog.
      if (currency === 'EUR') {
        setExchangeRate(1);
        return;
      }
      
      // If editing and currency matches stored, don't overwrite rate immediately? 
      // Actually, standard behavior is fine: fetch latest rate for date. 
      // If user wants to keep old rate, they shouldn't change currency/date.
      // But on initial load of edit, we set state. This effect might run and overwrite it.
      // Let's rely on the fact that setCurrency in useEffect above sets state, 
      // and this effect runs after.
      // To prevent overwriting the stored rate with a fresh API rate on open:
      if (expenseToEdit && expenseToEdit.original_currency === currency && expenseToEdit.expense_date === expenseDate) {
         // It's the same, so keep the stored rate (already set in previous useEffect)
         return;
      }

      setIsLoadingRate(true);
      const rate = await getExchangeRate(currency, 'EUR', expenseDate);
      if (rate) {
        setExchangeRate(rate);
      }
      setIsLoadingRate(false);
    };
    
    fetchRate();
  }, [currency, expenseDate]); // Warning: this depends on expenseToEdit being stable or ignored here.

  // Recalculate converted amount
  useEffect(() => {
    const raw = parseFloat(originalAmount);
    if (!isNaN(raw)) {
      setConvertedAmount(raw * exchangeRate);
    } else {
      setConvertedAmount(0);
    }
  }, [originalAmount, exchangeRate]);

  const handleSplitToggle = (userId: string) => {
    setSplitWith(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !originalAmount || splitWith.length === 0) return;

    setSubmitting(true);
    const success = await onSubmit({
      id: expenseToEdit?.id,
      trip_id: tripId,
      description: description.trim(),
      amount: convertedAmount, // Base currency
      original_amount: parseFloat(originalAmount),
      original_currency: currency,
      exchange_rate: exchangeRate,
      category,
      paid_by: paidBy,
      expense_date: expenseDate,
      split_with: splitWith,
      receipt_url: receiptUrl || undefined
    });

    if (success) {
      onOpenChange(false);
    }
    setSubmitting(false);
  };

  const splitAmount = splitWith.length > 0 
    ? convertedAmount / splitWith.length 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{expenseToEdit ? "Modifica Spesa" : "Aggiungi Spesa"}</DialogTitle>
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
              <Label htmlFor="amount">Importo</Label>
              <div className="flex gap-2">
                 <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  required
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Valuta</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exchange Rate Info */}
          {currency !== 'EUR' && (
            <div className="bg-muted/40 p-3 rounded-lg text-sm flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className={`w-3 h-3 ${isLoadingRate ? 'animate-spin' : ''}`} />
                <span>Tasso: {exchangeRate.toFixed(4)}</span>
              </div>
              <div className="font-medium">
                ≈ €{convertedAmount.toFixed(2)}
              </div>
            </div>
          )}

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
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 space-y-2 max-h-40 overflow-y-auto">
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
                    {splitWith.includes(member.user_id) && convertedAmount > 0 && (
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
              disabled={submitting || !description.trim() || !originalAmount || splitWith.length === 0}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aggiungi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}