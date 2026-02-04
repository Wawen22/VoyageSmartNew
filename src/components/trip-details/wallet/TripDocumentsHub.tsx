import { useState } from "react";
import { Wallet, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TripWalletStrip } from "@/components/trip-details/wallet/TripWalletStrip";
import { TripVaultPanel } from "@/components/trip-details/wallet/TripVaultPanel";
import { cn } from "@/lib/utils";

interface TripDocumentsHubProps {
  tripId: string;
}

export function TripDocumentsHub({ tripId }: TripDocumentsHubProps) {
  const [activeTab, setActiveTab] = useState<"wallet" | "vault">("wallet");

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 text-white shadow-2xl">
      <div className="absolute -right-12 -top-10 opacity-[0.06]">
        <Wallet className="h-44 w-44" />
      </div>
      <div className="absolute -left-10 -bottom-12 opacity-[0.06]">
        <ShieldCheck className="h-44 w-44" />
      </div>
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -top-24 -right-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 p-6">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Documenti di viaggio</p>
          <h3 className="text-2xl font-semibold">Wallet rapido + Cassaforte protetta</h3>
          <p className="text-sm text-white/70 max-w-2xl">
            Tutto in un’unica area: accesso rapido ai documenti essenziali e vault cifrato per quelli sensibili.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
          {[
            { key: "wallet", label: "Wallet rapido" },
            { key: "vault", label: "Cassaforte" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as "wallet" | "vault")}
              className={cn(
                "flex-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-all",
                activeTab === tab.key
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-4", activeTab !== "wallet" && "hidden")}>
            <TripWalletStrip tripId={tripId} variant="embedded" />
          </div>
          <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-4", activeTab !== "vault" && "hidden")}>
            <TripVaultPanel tripId={tripId} variant="embedded" />
          </div>
        </div>
      </div>
    </Card>
  );
}
