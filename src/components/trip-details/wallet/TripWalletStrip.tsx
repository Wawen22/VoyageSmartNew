import { useMemo, useRef, useState, type ComponentType } from "react";
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
}

export function TripWalletStrip({ tripId }: TripWalletStripProps) {
  const { isPro } = useSubscription();
  const { data: documents = [], isLoading, updateDocument } = useTripDocuments(tripId, isPro);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const pinnedDocuments = useMemo(
    () => documents.filter((doc) => doc.is_pinned),
    [documents],
  );

  const handlePinToggle = (docId: string, isPinned: boolean) => {
    updateDocument.mutate({ id: docId, is_pinned: !isPinned });
  };

  const handleOpenDialog = () => {
    if (!isPro) {
      setShowSubscriptionDialog(true);
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 text-white shadow-2xl">
        <div className="absolute -right-10 -top-10 opacity-[0.08]">
          <Wallet className="h-40 w-40" />
        </div>
        <div className="absolute inset-0 opacity-70">
          <div className="absolute -top-24 -right-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 space-y-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Travel Wallet di gruppo</p>
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
                onClick={handleOpenDialog}
              >
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi
              </Button>
              <Button
                variant="ghost"
                className="border border-white/20 text-white hover:bg-white/10"
                onClick={handleOpenDialog}
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
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {pinnedDocuments.map((doc) => {
                    const meta = CATEGORY_META[(doc.category as WalletDocumentCategory) || "other"] || CATEGORY_META.other;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={doc.id}
                        className="min-w-[220px] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                      >
                        <div className="flex items-start justify-between">
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", meta.color)}>
                            <Icon className="h-5 w-5" />
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
                          <Badge className="bg-white/10 text-white/80">{meta.label}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          className="mt-4 w-full border border-white/10 text-white hover:bg-white/10"
                          onClick={() => window.open(doc.document_url, "_blank")}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Apri documento
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <TripWalletDialog tripId={tripId} open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <SubscriptionDialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog} />
    </>
  );
}

interface TripWalletDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TripWalletDialog({ tripId, open, onOpenChange }: TripWalletDialogProps) {
  const { toast } = useToast();
  const { data: documents = [], createDocument, deleteDocument, updateDocument } = useTripDocuments(tripId, true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WalletDocumentCategory>("flight");
  const [isPinned, setIsPinned] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "Il file deve essere inferiore a 10MB",
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

      setTitle("");
      setCategory("flight");
      setIsPinned(true);
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

  const handlePinToggle = (docId: string, pinned: boolean) => {
    updateDocument.mutate({ id: docId, is_pinned: !pinned });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-6 pt-8 pb-10 text-white">
          <div className="absolute -right-8 -top-6 opacity-[0.08]">
            <Wallet className="h-32 w-32" />
          </div>
          <DialogHeader className="relative z-10 text-left">
            <DialogTitle className="text-2xl">Travel Wallet</DialogTitle>
            <DialogDescription className="text-white/70">
              Aggiungi e organizza i documenti essenziali per il viaggio.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-6 bg-background px-6 py-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4 rounded-2xl border bg-muted/20 p-4">
            <h4 className="text-sm font-semibold text-foreground">Nuovo documento</h4>
            <div className="space-y-3">
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
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Carica file
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => scanRef.current?.click()}
                  disabled={uploading}
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Scansiona
                </Button>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(event) => setIsPinned(event.target.checked)}
                  className="h-4 w-4 rounded border border-input"
                />
                Pinnalo nel Wallet rapido
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Documenti salvati</h4>
              <span className="text-xs text-muted-foreground">{documents.length} file</span>
            </div>
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2">
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
                      className="flex items-center gap-3 rounded-xl border bg-background p-3"
                    >
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", meta.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{meta.label}</p>
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
