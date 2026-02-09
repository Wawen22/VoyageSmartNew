import { useMemo, useRef, useState, useEffect, type ComponentType } from "react";
import {
  Wallet,
  Plus,
  TicketsPlane,
  Building2,
  IdCard,
  ShieldCheck,
  Ticket,
  FileText,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Scan,
  Loader2,
  Sparkles,
  Lock,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTripDocuments, WalletDocumentCategory } from "@/hooks/useTripDocuments";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { SubscriptionDialog } from "@/components/subscription/SubscriptionDialog";
import { useDocumentAnalysis } from "@/hooks/useDocumentAnalysis";
import { SmartDocumentDialog } from "@/components/documents/SmartDocumentDialog";

const CATEGORY_META: Record<
  WalletDocumentCategory,
  { label: string; icon: ComponentType<{ className?: string }>; color: string }
> = {
  flight: { label: "Volo", icon: TicketsPlane, color: "text-sky-200 bg-sky-500/20" },
  hotel: { label: "Hotel", icon: Building2, color: "text-indigo-200 bg-indigo-500/20" },
  passport: { label: "Passaporto", icon: IdCard, color: "text-emerald-200 bg-emerald-500/20" },
  insurance: { label: "Assicurazione", icon: ShieldCheck, color: "text-amber-200 bg-amber-500/20" },
  visa: { label: "Visto", icon: Ticket, color: "text-rose-200 bg-rose-500/20" },
  ticket: { label: "Biglietto", icon: Ticket, color: "text-purple-200 bg-purple-500/20" },
  other: { label: "Altro", icon: FileText, color: "text-slate-200 bg-slate-500/20" },
};

const CATEGORY_BADGE: Record<WalletDocumentCategory, string> = {
  flight: "bg-teal-500/20 text-teal-100",
  hotel: "bg-indigo-500/20 text-indigo-100",
  passport: "bg-emerald-500/20 text-emerald-100",
  insurance: "bg-amber-500/20 text-amber-100",
  visa: "bg-rose-500/20 text-rose-100",
  ticket: "bg-purple-500/20 text-purple-100",
  other: "bg-slate-500/20 text-slate-100",
};

const CATEGORY_CARD_DARK: Record<WalletDocumentCategory, string> = {
  flight: "bg-gradient-to-br from-teal-500/15 via-white/5 to-emerald-500/15 border-teal-500/20",
  hotel: "bg-gradient-to-br from-indigo-500/15 via-white/5 to-violet-500/15 border-indigo-500/20",
  passport: "bg-gradient-to-br from-emerald-500/15 via-white/5 to-teal-500/15 border-emerald-500/20",
  insurance: "bg-gradient-to-br from-amber-500/15 via-white/5 to-orange-500/15 border-amber-500/20",
  visa: "bg-gradient-to-br from-rose-500/15 via-white/5 to-pink-500/15 border-rose-500/20",
  ticket: "bg-gradient-to-br from-purple-500/15 via-white/5 to-fuchsia-500/15 border-purple-500/20",
  other: "bg-gradient-to-br from-slate-500/15 via-white/5 to-slate-700/15 border-white/10",
};

const CATEGORY_CARD_LIGHT: Record<WalletDocumentCategory, string> = {
  flight: "bg-gradient-to-br from-teal-500/10 via-white to-emerald-500/5 border-teal-500/20",
  hotel: "bg-gradient-to-br from-indigo-500/10 via-white to-violet-500/5 border-indigo-500/20",
  passport: "bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/5 border-emerald-500/20",
  insurance: "bg-gradient-to-br from-amber-500/10 via-white to-orange-500/5 border-amber-500/20",
  visa: "bg-gradient-to-br from-rose-500/10 via-white to-pink-500/5 border-rose-500/20",
  ticket: "bg-gradient-to-br from-purple-500/10 via-white to-fuchsia-500/5 border-purple-500/20",
  other: "bg-gradient-to-br from-slate-500/10 via-white to-slate-500/5 border-slate-200",
};


const CATEGORY_OPTIONS: { value: WalletDocumentCategory; label: string }[] = [
  { value: "flight", label: "Biglietto aereo" },
  { value: "hotel", label: "Voucher hotel" },
  { value: "passport", label: "Passaporto" },
  { value: "insurance", label: "Assicurazione" },
  { value: "visa", label: "Visto" },
  { value: "ticket", label: "Biglietto" },
  { value: "other", label: "Altro" },
];

interface TripWalletStripProps {
  tripId: string;
  variant?: "standalone" | "embedded";
}

export function TripWalletStrip({ tripId, variant = "standalone" }: TripWalletStripProps) {
  const { isPro } = useSubscription();
  const { data: documents = [], isLoading, updateDocument } = useTripDocuments(tripId, isPro);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const pinnedDocuments = useMemo(
    () => documents.filter((doc) => doc.is_pinned),
    [documents],
  );

  const handlePinToggle = (docId: string, isPinned: boolean) => {
    updateDocument.mutate({ id: docId, is_pinned: !isPinned });
  };


  const content = (
    <div className={cn("relative z-10 space-y-6", variant === "embedded" ? "p-0" : "p-6")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Travel Wallet</p>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Documenti rapidi</h3>
                {!isPro && <Badge className="bg-amber-400/20 text-amber-200">PRO</Badge>}
              </div>
              <p className="text-sm text-white/70">
                Biglietti, voucher e passaporti sempre a portata di tap.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => (isPro ? setShowUploadDialog(true) : setShowSubscriptionDialog(true))}
            disabled={!isPro}
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi
          </Button>
          <Button
            variant="ghost"
            className="border border-white/20 text-white hover:bg-white/10"
            onClick={() => (isPro ? setShowManageDialog(true) : setShowSubscriptionDialog(true))}
            disabled={!isPro}
          >
            Gestisci
          </Button>
        </div>
      </div>

      {!isPro ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col items-start gap-3 text-white/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">Wallet disponibile solo per PRO</p>
              <p className="text-sm text-white/70">
                Sblocca il Travel Wallet per avere accesso rapido ai documenti essenziali.
              </p>
            </div>
            <Button
              className="mt-2 bg-white text-slate-900 hover:bg-slate-100"
              onClick={() => setShowSubscriptionDialog(true)}
            >
              Passa a PRO
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-white/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              Caricamento documenti...
            </div>
          ) : pinnedDocuments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Nessun documento pinnato. Aggiungi i file essenziali per un accesso immediato.
              </div>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide touch-pan-x overscroll-x-contain snap-x snap-mandatory scroll-smooth">
                {pinnedDocuments.map((doc) => {
                  const meta = CATEGORY_META[(doc.category as WalletDocumentCategory) || "other"] || CATEGORY_META.other;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={doc.id}
                      className={cn(
                        "relative min-w-[220px] max-w-[260px] shrink-0 overflow-hidden rounded-2xl border p-4 backdrop-blur snap-start",
                        CATEGORY_CARD_DARK[(doc.category as WalletDocumentCategory) || "other"],
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", meta.color)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <Badge className={cn("text-[10px]", CATEGORY_BADGE[(doc.category as WalletDocumentCategory) || "other"])}>
                            {meta.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white"
                          onClick={() => handlePinToggle(doc.id, doc.is_pinned)}
                        >
                          {doc.is_pinned ? (
                            <BookmarkCheck className="h-4 w-4" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold text-white line-clamp-2">{doc.title}</p>
                      </div>
                      <Button
                        variant="ghost"
                        className="mt-4 w-full border border-white/10 text-white hover:bg-white/10"
                        onClick={() => window.open(doc.document_url, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Apri
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {variant === "standalone" ? (
        <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 text-white shadow-2xl">
          <div className="absolute -right-10 -top-10 opacity-[0.08]">
            <Wallet className="h-40 w-40" />
          </div>
          <div className="absolute inset-0 opacity-70">
            <div className="absolute -top-24 -right-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
          </div>
          {content}
        </Card>
      ) : (
        content
      )}

      <TripWalletUploadDialog
        tripId={tripId}
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />

      <TripWalletManageDialog
        tripId={tripId}
        open={showManageDialog}
        onOpenChange={setShowManageDialog}
      />

      <SubscriptionDialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog} />
    </>
  );
}

interface TripWalletDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TripWalletUploadDialog({ tripId, open, onOpenChange }: TripWalletDialogProps) {
  const { toast } = useToast();
  const { createDocument } = useTripDocuments(tripId, true);
  const { analyze, isAnalyzing, result, clearResult } = useDocumentAnalysis();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WalletDocumentCategory>("flight");
  const [isPinned, setIsPinned] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSmartDialog, setShowSmartDialog] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  // Effect to open smart dialog when analysis result is ready
  useEffect(() => {
    if (result) setShowSmartDialog(true);
  }, [result]);

  const handleFileSelected = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "Il file deve essere inferiore a 8MB",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    setUploading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) throw new Error("Non autenticato");

      const fileExt = file.name.split(".").pop() || "bin";
      const filePath = `${authData.user.id}/${tripId}/wallet/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("trip-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("trip-documents")
        .getPublicUrl(filePath);

      await createDocument.mutateAsync({
        trip_id: tripId,
        title: title.trim() || file.name,
        category,
        document_url: urlData.publicUrl,
        storage_path: filePath,
        is_pinned: isPinned,
      });

      // Start AI Analysis
      toast({ title: "Documento salvato", description: "Analisi intelligente in corso..." });
      await analyze(file);
      
      // We don't close the dialog immediately if analyzing, 
      // but we reset fields for next upload
      setTitle("");
      setCategory("flight");
      setIsPinned(true);
      
      // Close the upload dialog so the smart dialog can take focus if result is found
      onOpenChange(false);

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Errore",
        description: error?.message || "Impossibile caricare il documento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      if (scanRef.current) scanRef.current.value = "";
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileSelected(file);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-6 pt-8 pb-10 text-white">
            <div className="absolute -right-6 -top-6 opacity-[0.08]">
              <Wallet className="h-28 w-28" />
            </div>
            <DialogHeader className="relative z-10 text-left">
              <DialogTitle className="text-2xl">Nuovo documento</DialogTitle>
              <DialogDescription className="text-white/70">
                Carica biglietti, voucher e documenti essenziali nel Wallet rapido.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 bg-background px-6 py-6">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Titolo documento"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as WalletDocumentCategory)}
              className="h-11 w-full rounded-xl border border-input/70 bg-card/80 px-3 text-sm text-foreground"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(event) => setIsPinned(event.target.checked)}
                className="h-4 w-4 rounded border border-input"
              />
              Pinnalo nel Wallet rapido
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileInput}
              />
              <input
                ref={scanRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileInput}
              />
              <Button
                type="button"
                variant="default"
                className="flex-1"
                onClick={() => inputRef.current?.click()}
                disabled={uploading || isAnalyzing}
              >
                {uploading || isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {isAnalyzing ? "Analisi..." : "Carica file"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => scanRef.current?.click()}
                disabled={uploading || isAnalyzing}
              >
                <Scan className="mr-2 h-4 w-4" />
                Scansiona
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SmartDocumentDialog 
        open={showSmartDialog}
        onOpenChange={(val) => {
          setShowSmartDialog(val);
          if (!val) clearResult();
        }}
        data={result}
        tripId={tripId}
        onConfirm={() => {
          toast({ title: "Elemento aggiunto con successo!" });
        }}
      />
    </>
  );
}

function TripWalletManageDialog({ tripId, open, onOpenChange }: TripWalletDialogProps) {
  const { data: documents = [], deleteDocument, updateDocument } = useTripDocuments(tripId, true);

  const handlePinToggle = (docId: string, pinned: boolean) => {
    updateDocument.mutate({ id: docId, is_pinned: !pinned });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-6 pt-8 pb-10 text-white">
          <div className="absolute -right-8 -top-6 opacity-[0.08]">
            <Wallet className="h-32 w-32" />
          </div>
          <DialogHeader className="relative z-10 text-left">
            <DialogTitle className="text-2xl">Gestisci documenti</DialogTitle>
            <DialogDescription className="text-white/70">
              Organizza, pinna e apri rapidamente i documenti del tuo viaggio.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 bg-background px-6 py-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Documenti salvati</h4>
            <span className="text-xs text-muted-foreground">{documents.length} file</span>
          </div>
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <div className="h-full max-h-[380px] space-y-3 overflow-y-auto overscroll-y-contain scroll-smooth pr-2">
              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nessun documento salvato. Inizia caricando un file.
                </div>
              ) : (
                documents.map((doc) => {
                  const meta = CATEGORY_META[(doc.category as WalletDocumentCategory) || "other"] || CATEGORY_META.other;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={doc.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3",
                        CATEGORY_CARD_LIGHT[(doc.category as WalletDocumentCategory) || "other"],
                      )}
                    >
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", meta.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                        <Badge className={cn("mt-1 text-[10px]", CATEGORY_BADGE[(doc.category as WalletDocumentCategory) || "other"])}>
                          {meta.label}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handlePinToggle(doc.id, doc.is_pinned)}>
                        {doc.is_pinned ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(doc.document_url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteDocument.mutate(doc)}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
