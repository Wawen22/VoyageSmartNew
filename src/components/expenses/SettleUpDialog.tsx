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
  Trash2,
  Wallet,
  Banknote
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Balance } from "@/hooks/useExpenses";
import type { OptimalPayment, SettlementWithProfiles } from "@/hooks/useSettlements";
import { calculateOptimalPayments } from "@/hooks/useSettlements";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const optimalPayments = calculateOptimalPayments(balances);

  const getPaymentId = (payment: OptimalPayment) => `${payment.from.userId}-${payment.to.userId}`;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSettle = async () => {
    if (!settlingId) return;
    const payment = optimalPayments.find(p => getPaymentId(p) === settlingId);
    if (!payment) return;

    setLoading(true);
    const success = await onSettle({
      trip_id: tripId,
      from_user_id: payment.from.userId,
      to_user_id: payment.to.userId,
      amount: payment.amount,
      notes: notes.trim() || undefined
    });

    setLoading(false);
    if (success) {
      setSettlingId(null);
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
      <DialogContent className="w-full max-w-sm p-0 overflow-hidden rounded-2xl gap-0 bg-background/95 backdrop-blur-xl border-border/60">
        
        {/* Header */}
        <div className="bg-gradient-to-b from-muted/50 to-background px-5 py-4 border-b border-border/40">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 ring-1 ring-emerald-500/20 shadow-sm">
                 <Wallet className="w-5 h-5" />
              </div>
              <div>
                 <DialogTitle className="text-lg font-semibold tracking-tight">Saldare i conti</DialogTitle>
                 <p className="text-xs text-muted-foreground font-medium">Gestisci i debiti del gruppo</p>
              </div>
           </div>
        </div>

        <Tabs defaultValue="payments" className="w-full">
          <div className="px-5 pt-4 pb-2">
            <TabsList className="grid w-full grid-cols-2 h-9 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="payments" className="text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <Banknote className="w-3.5 h-3.5 mr-1.5" />
                Pagamenti ({optimalPayments.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <History className="w-3.5 h-3.5 mr-1.5" />
                Cronologia
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-5 pb-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
            <TabsContent value="payments" className="mt-2 focus-visible:outline-none">
              {allSettled ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                    <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">Tutto saldato!</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    I conti tornano perfettamente. Nessun debito in sospeso.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {optimalPayments.map((payment, index) => {
                      const paymentId = getPaymentId(payment);
                      const isExpanded = settlingId === paymentId;

                      return (
                      <motion.div
                        key={paymentId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                        className={cn(
                          "relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group",
                          isExpanded
                            ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10 shadow-sm"
                            : "border-border/60 bg-card hover:border-emerald-500/20 hover:shadow-sm"
                        )}
                        onClick={() => setSettlingId(isExpanded ? null : paymentId)}
                      >
                        {/* Card Content */}
                        <div className="p-3">
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                             {/* FROM */}
                             <div className="flex flex-col items-center text-center">
                                <Avatar className="w-9 h-9 ring-2 ring-background shadow-sm">
                                  {payment.from.avatarUrl && <AvatarImage src={payment.from.avatarUrl} />}
                                  <AvatarFallback className="bg-muted text-[10px]">{getInitials(payment.from.name)}</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-semibold mt-1.5 truncate w-full px-1">
                                  {payment.from.userId === currentUserId ? "Tu" : payment.from.name.split(' ')[0]}
                                </span>
                             </div>

                             {/* CENTER (Amount) */}
                             <div className="flex flex-col items-center justify-center relative w-24">
                                <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-10 border-t border-dashed border-muted-foreground/30"></div>
                                <div className="bg-background px-2 py-0.5 rounded-full border border-border shadow-sm flex items-center gap-1 z-10 group-hover:scale-105 transition-transform">
                                  <span className="font-bold text-sm text-foreground">€{payment.amount.toFixed(2)}</span>
                                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                </div>
                             </div>

                             {/* TO */}
                             <div className="flex flex-col items-center text-center">
                                <Avatar className="w-9 h-9 ring-2 ring-background shadow-sm">
                                  {payment.to.avatarUrl && <AvatarImage src={payment.to.avatarUrl} />}
                                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">{getInitials(payment.to.name)}</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-semibold mt-1.5 truncate w-full px-1">
                                  {payment.to.userId === currentUserId ? "Tu" : payment.to.name.split(' ')[0]}
                                </span>
                             </div>
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="px-3 pb-3">
                          <AnimatePresence initial={false}>
                            {isExpanded ? (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                 <div className="pt-2 space-y-3 border-t border-dashed border-border/50">
                                    <Textarea
                                      placeholder="Aggiungi una nota..."
                                      value={notes}
                                      onChange={(e) => setNotes(e.target.value)}
                                      className="min-h-[50px] text-xs resize-none bg-background/50 focus:bg-background"
                                    />
                                    <div className="flex gap-2">
                                       <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="flex-1 h-8 text-xs hover:bg-muted"
                                        onClick={() => { setSettlingId(null); setNotes(""); }}
                                       >
                                         Annulla
                                       </Button>
                                       <Button 
                                        size="sm" 
                                        className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                        onClick={handleSettle}
                                        disabled={loading}
                                       >
                                         {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Conferma"}
                                       </Button>
                                    </div>
                                 </div>
                              </motion.div>
                            ) : (
                              <div className="pt-2 border-t border-dashed border-border/50">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-8 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSettlingId(paymentId);
                                  }}
                                >
                                  <Check className="w-3.5 h-3.5 mr-1.5" />
                                  Salda ora
                                </Button>
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-2 focus-visible:outline-none">
               {settlements.length === 0 ? (
                 <div className="text-center py-8">
                    <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Nessun storico saldi.</p>
                 </div>
               ) : (
                 <div className="space-y-2">
                   {settlements.map((settlement) => (
                      <div key={settlement.id} className="p-3 rounded-xl border border-border/50 bg-card/50 flex flex-col gap-2">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="flex -space-x-2">
                                  <Avatar className="w-6 h-6 ring-1 ring-background">
                                     {settlement.from_profile?.avatar_url && <AvatarImage src={settlement.from_profile.avatar_url} />}
                                     <AvatarFallback className="text-[9px]">{getInitials(settlement.from_profile?.full_name || "?")}</AvatarFallback>
                                  </Avatar>
                                  <Avatar className="w-6 h-6 ring-1 ring-background">
                                     {settlement.to_profile?.avatar_url && <AvatarImage src={settlement.to_profile.avatar_url} />}
                                     <AvatarFallback className="text-[9px]">{getInitials(settlement.to_profile?.full_name || "?")}</AvatarFallback>
                                  </Avatar>
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-medium leading-tight">
                                     {settlement.from_profile?.full_name?.split(' ')[0]} <ArrowRight className="w-2 h-2 inline text-muted-foreground" /> {settlement.to_profile?.full_name?.split(' ')[0]}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground">{format(new Date(settlement.settled_at), "d MMM", { locale: it })}</span>
                               </div>
                            </div>
                            <span className="font-bold text-emerald-600 text-sm">€{settlement.amount.toFixed(2)}</span>
                         </div>
                         
                         {(settlement.notes || settlement.created_by === currentUserId) && (
                            <div className="flex items-center justify-between border-t border-border/30 pt-1.5 mt-0.5">
                               <p className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">
                                 {settlement.notes ? `"${settlement.notes}"` : ""}
                               </p>
                               {settlement.created_by === currentUserId && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 -mr-1 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(settlement.id)}
                                    disabled={deletingId === settlement.id}
                                  >
                                     {deletingId === settlement.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                  </Button>
                               )}
                            </div>
                         )}
                      </div>
                   ))}
                 </div>
               )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
