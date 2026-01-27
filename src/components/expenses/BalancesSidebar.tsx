import { useState } from "react";
import { Users, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Balance } from "@/hooks/useExpenses";
import type { SettlementWithProfiles } from "@/hooks/useSettlements";
import { SettleUpDialog } from "./SettleUpDialog";

interface BalancesSidebarProps {
  balances: Balance[];
  currentUserId?: string;
  tripId?: string;
  settlements?: SettlementWithProfiles[];
  onSettle?: (data: {
    trip_id: string;
    from_user_id: string;
    to_user_id: string;
    amount: number;
    notes?: string;
  }) => Promise<boolean>;
  onDeleteSettlement?: (id: string) => Promise<boolean>;
}

export function BalancesSidebar({ 
  balances, 
  currentUserId,
  tripId,
  settlements = [],
  onSettle,
  onDeleteSettlement
}: BalancesSidebarProps) {
  const [showSettleDialog, setShowSettleDialog] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Sort: current user first, then by amount descending
  const sortedBalances = [...balances].sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return b.amount - a.amount;
  });

  // Check if there are debts to settle
  const hasDebts = balances.some(b => Math.abs(b.amount) > 0.01);

  return (
    <>
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border sticky top-24">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Bilanci del Gruppo</h3>
        </div>

        {balances.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nessuna spesa ancora
          </p>
        ) : (
          <div className="space-y-4">
            {sortedBalances.map((person) => (
              <div key={person.userId} className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  {person.avatarUrl && <AvatarImage src={person.avatarUrl} />}
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    {getInitials(person.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    {person.name}
                    {person.userId === currentUserId && " (tu)"}
                  </p>
                </div>
                <p
                  className={`font-semibold text-sm ${
                    person.amount > 0
                      ? "text-forest"
                      : person.amount < 0
                      ? "text-secondary"
                      : "text-muted-foreground"
                  }`}
                >
                  {person.amount > 0 ? "+" : ""}€{person.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border">
          <Button 
            variant={hasDebts ? "sunset" : "outline"} 
            className="w-full"
            disabled={!tripId || !hasDebts}
            onClick={() => setShowSettleDialog(true)}
          >
            <Receipt className="w-4 h-4 mr-2" />
            {hasDebts ? "Settle Up" : "Tutto saldato ✓"}
          </Button>
        </div>
      </div>

      {tripId && onSettle && onDeleteSettlement && (
        <SettleUpDialog
          open={showSettleDialog}
          onOpenChange={setShowSettleDialog}
          balances={balances}
          settlements={settlements}
          tripId={tripId}
          currentUserId={currentUserId}
          onSettle={onSettle}
          onDeleteSettlement={onDeleteSettlement}
        />
      )}
    </>
  );
}
