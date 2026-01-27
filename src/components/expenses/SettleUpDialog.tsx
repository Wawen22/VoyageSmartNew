import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Check,
  Loader2,
  Receipt,
  Sparkles,
  History,
  Trash2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Balance } from "@/hooks/useExpenses";
import type { OptimalPayment, SettlementWithProfiles } from "@/hooks/useSettlements";
import { calculateOptimalPayments } from "@/hooks/useSettlements";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface SettleUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances: Balance[];
  settlements: SettlementWithProfiles[];
  tripId: string;
  currentUserId?: string;
  onSettle: (data: {
    trip_id: string;
    from_user_id: string;
    to_user_id: string;
    amount: number;
    notes?: string;
  }) => Promise<boolean>;
  onDeleteSettlement: (id: string) => Promise<boolean>;
}

export function SettleUpDialog({
  open,
  onOpenChange,
  balances,
  settlements,
  tripId,
  currentUserId,
  onSettle,
  onDeleteSettlement
}: SettleUpDialogProps) {
  const [settlingPayment, setSettlingPayment] = useState<OptimalPayment | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const optimalPayments = calculateOptimalPayments(balances);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSettle = async () => {
    if (!settlingPayment) return;

    setLoading(true);
    const success = await onSettle({
      trip_id: tripId,
      from_user_id: settlingPayment.from.userId,
      to_user_id: settlingPayment.to.userId,
      amount: settlingPayment.amount,
      notes: notes.trim() || undefined
    });

    setLoading(false);
    if (success) {
      setSettlingPayment(null);
      setNotes("");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDeleteSettlement(id);
    setDeletingId(null);
  };

  const allSettled = optimalPayments.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Settle Up
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="payments" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Pagamenti
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Cronologia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="mt-4">
            {allSettled ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-forest" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Tutto saldato! 🎉
                </h3>
                <p className="text-sm text-muted-foreground">
                  Non ci sono pagamenti in sospeso tra i membri del gruppo.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Ecco il modo più efficiente per saldare tutti i debiti:
                </p>

                <AnimatePresence mode="popLayout">
                  {optimalPayments.map((payment, index) => (
                    <motion.div
                      key={`${payment.from.userId}-${payment.to.userId}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border ${
                        settlingPayment === payment
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      } transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        {/* From User */}
                        <div className="flex items-center gap-2 flex-1">
                          <Avatar className="w-10 h-10">
                            {payment.from.avatarUrl && (
                              <AvatarImage src={payment.from.avatarUrl} />
                            )}
                            <AvatarFallback className="bg-secondary/10 text-secondary text-sm">
                              {getInitials(payment.from.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {payment.from.name}
                              {payment.from.userId === currentUserId && " (tu)"}
                            </p>
                            <p className="text-xs text-muted-foreground">paga</p>
                          </div>
                        </div>

                        {/* Amount & Arrow */}
                        <div className="flex items-center gap-2 px-3">
                          <span className="font-bold text-lg text-foreground">
                            €{payment.amount.toFixed(2)}
                          </span>
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>

                        {/* To User */}
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <div className="min-w-0 text-right">
                            <p className="font-medium text-foreground text-sm truncate">
                              {payment.to.name}
                              {payment.to.userId === currentUserId && " (tu)"}
                            </p>
                            <p className="text-xs text-muted-foreground">riceve</p>
                          </div>
                          <Avatar className="w-10 h-10">
                            {payment.to.avatarUrl && (
                              <AvatarImage src={payment.to.avatarUrl} />
                            )}
                            <AvatarFallback className="bg-forest/10 text-forest text-sm">
                              {getInitials(payment.to.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 pt-3 border-t border-border">
                        {settlingPayment === payment ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Note (opzionale, es. 'Bonifico', 'Contanti')"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSettlingPayment(null);
                                  setNotes("");
                                }}
                                disabled={loading}
                              >
                                Annulla
                              </Button>
                              <Button
                                variant="sunset"
                                size="sm"
                                onClick={handleSettle}
                                disabled={loading}
                                className="flex-1"
                              >
                                {loading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Conferma Saldo
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-primary hover:text-primary"
                            onClick={() => setSettlingPayment(payment)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Segna come saldato
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {settlements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Nessun saldo registrato ancora.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {settlements.map((settlement) => (
                  <motion.div
                    key={settlement.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          {settlement.from_profile?.avatar_url && (
                            <AvatarImage src={settlement.from_profile.avatar_url} />
                          )}
                          <AvatarFallback className="bg-muted text-xs">
                            {getInitials(settlement.from_profile?.full_name || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <Avatar className="w-8 h-8">
                          {settlement.to_profile?.avatar_url && (
                            <AvatarImage src={settlement.to_profile.avatar_url} />
                          )}
                          <AvatarFallback className="bg-muted text-xs">
                            {getInitials(settlement.to_profile?.full_name || "U")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="font-semibold text-forest">
                        €{settlement.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {settlement.from_profile?.full_name} → {settlement.to_profile?.full_name}
                      </span>
                      <span>
                        {format(new Date(settlement.settled_at), "d MMM yyyy", { locale: it })}
                      </span>
                    </div>
                    {settlement.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        "{settlement.notes}"
                      </p>
                    )}
                    {settlement.created_by === currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full text-destructive hover:text-destructive"
                        onClick={() => handleDelete(settlement.id)}
                        disabled={deletingId === settlement.id}
                      >
                        {deletingId === settlement.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Elimina
                          </>
                        )}
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
