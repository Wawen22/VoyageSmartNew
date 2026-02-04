import { useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  Lock,
  ScanLine,
  FileText,
  UploadCloud,
  EyeOff,
  Download,
  Trash2,
  Loader2,
  FolderKey,
  KeyRound,
  Eye,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTripVaultDocuments, VaultDocumentCategory, TripVaultDocument } from "@/hooks/useTripVaultDocuments";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { decryptBlob } from "@/utils/vaultCrypto";
import { SubscriptionDialog } from "@/components/subscription/SubscriptionDialog";
import { cn } from "@/lib/utils";

const VAULT_CATEGORIES: { value: VaultDocumentCategory; label: string }[] = [
  { value: "passport", label: "Passaporto" },
  { value: "insurance", label: "Assicurazione" },
  { value: "visa", label: "Visto" },
  { value: "id", label: "Documento" },
  { value: "medical", label: "Sanitario" },
  { value: "other", label: "Altro" },
];

const CATEGORY_BADGE: Record<VaultDocumentCategory, string> = {
  passport: "bg-emerald-500/20 text-emerald-100",
  insurance: "bg-amber-500/20 text-amber-100",
  visa: "bg-purple-500/20 text-purple-100",
  id: "bg-slate-500/20 text-slate-100",
  medical: "bg-rose-500/20 text-rose-100",
  other: "bg-slate-500/20 text-slate-100",
};

type VaultPendingAction =
  | { type: "upload"; file: File; title: string; category: VaultDocumentCategory }
  | { type: "open"; doc: TripVaultDocument }
  | { type: "download"; doc: TripVaultDocument }
  | null;

interface TripVaultPanelProps {
  tripId: string;
  variant?: "standalone" | "embedded";
}

export function TripVaultPanel({ tripId, variant = "standalone" }: TripVaultPanelProps) {
  const { isPro } = useSubscription();
  const { toast } = useToast();
  const {
    data: vaultDocs = [],
    createVaultDocument,
    deleteVaultDocument,
    isLoading,
  } = useTripVaultDocuments(tripId, isPro);

  const [passphrase, setPassphrase] = useState("");
  const [passphraseInput, setPassphraseInput] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showPassphraseDialog, setShowPassphraseDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<VaultPendingAction>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<VaultDocumentCategory>("passport");
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const sortedDocs = useMemo(
    () => [...vaultDocs].sort((a, b) => (a.created_at > b.created_at ? -1 : 1)),
    [vaultDocs],
  );

  const resetPassphraseDialog = () => {
    setShowPassphrase(false);
    setPassphraseInput("");
  };

  const requirePassphrase = (action: VaultPendingAction) => {
    setPendingAction(action);
    setShowPassphraseDialog(true);
  };

  const performUpload = async (
    file: File,
    passphraseValue: string,
    payloadTitle: string,
    payloadCategory: VaultDocumentCategory,
  ) => {
    await createVaultDocument.mutateAsync({
      trip_id: tripId,
      title: payloadTitle.trim() || file.name,
      category: payloadCategory,
      file,
      passphrase: passphraseValue,
    });
    setTitle("");
    setShowUploadDialog(false);
  };

  const performOpen = async (doc: TripVaultDocument, passphraseValue: string) => {
    setLoadingPreviewId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("vault-documents")
        .download(doc.file_path);

      if (error || !data) throw error || new Error("Download fallito");

      const decryptedBlob = await decryptBlob(
        data,
        passphraseValue,
        doc.encryption_iv,
        doc.encryption_salt,
        doc.mime_type,
      );

      const url = URL.createObjectURL(decryptedBlob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Errore",
        description: "Passphrase errata o documento non decifrabile.",
        variant: "destructive",
      });
    } finally {
      setLoadingPreviewId(null);
    }
  };

  const performDownload = async (doc: TripVaultDocument, passphraseValue: string) => {
    setLoadingPreviewId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("vault-documents")
        .download(doc.file_path);

      if (error || !data) throw error || new Error("Download fallito");

      const decryptedBlob = await decryptBlob(
        data,
        passphraseValue,
        doc.encryption_iv,
        doc.encryption_salt,
        doc.mime_type,
      );

      const url = URL.createObjectURL(decryptedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Errore",
        description: "Passphrase errata o documento non decifrabile.",
        variant: "destructive",
      });
    } finally {
      setLoadingPreviewId(null);
    }
  };

  const handlePassphraseConfirm = async () => {
    if (!passphraseInput.trim()) {
      toast({
        title: "Inserisci la passphrase",
        description: "Serve una passphrase per sbloccare la Cassaforte.",
        variant: "destructive",
      });
      return;
    }

    const resolvedPassphrase = passphraseInput.trim();
    setPassphrase(resolvedPassphrase);
    setShowPassphraseDialog(false);
    resetPassphraseDialog();

    if (pendingAction?.type === "upload") {
      await performUpload(
        pendingAction.file,
        resolvedPassphrase,
        pendingAction.title,
        pendingAction.category,
      );
    }

    if (pendingAction?.type === "open") {
      await performOpen(pendingAction.doc, resolvedPassphrase);
    }

    if (pendingAction?.type === "download") {
      await performDownload(pendingAction.doc, resolvedPassphrase);
    }

    setPendingAction(null);
  };

  const handleFileSelected = async (file: File) => {
    if (!isPro) {
      setShowSubscriptionDialog(true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "Il file deve essere inferiore a 10MB",
        variant: "destructive",
      });
      return;
    }

    const payloadTitle = title.trim() || file.name;

    if (!passphrase) {
      requirePassphrase({ type: "upload", file, title: payloadTitle, category });
      return;
    }

    await performUpload(file, passphrase, payloadTitle, category);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileSelected(file);
  };

  const handleOpen = async (doc: TripVaultDocument) => {
    if (!passphrase) {
      requirePassphrase({ type: "open", doc });
      return;
    }
    await performOpen(doc, passphrase);
  };

  const handleDownload = async (doc: TripVaultDocument) => {
    if (!passphrase) {
      requirePassphrase({ type: "download", doc });
      return;
    }
    await performDownload(doc, passphrase);
  };

  const lockedView = !isPro ? (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-3 text-white/80">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">Cassaforte disponibile solo per PRO</p>
          <p className="text-sm text-white/70">
            Archivia passaporti, assicurazioni e visti in una sezione cifrata e accessibile offline.
          </p>
        </div>
        <Button className="w-fit bg-white text-slate-900 hover:bg-slate-100" onClick={() => setShowSubscriptionDialog(true)}>
          Passa a PRO
        </Button>
      </div>
    </div>
  ) : null;

  const content = (
    <div className={cn("space-y-6", variant === "embedded" ? "p-0" : "p-6")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Scanner & Cassaforte</p>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Documenti cifrati</h3>
                {!isPro && <Badge className="bg-amber-400/20 text-amber-200">PRO</Badge>}
              </div>
              <p className="text-sm text-white/70">
                Copie critiche protette da passphrase, accessibili solo da te.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isPro && (
            <Badge className={cn("border border-white/20 bg-white/10", passphrase ? "text-emerald-200" : "text-amber-200")}>
              {passphrase ? "Cassaforte sbloccata" : "Cassaforte bloccata"}
            </Badge>
          )}
          <Button
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => setShowUploadDialog(true)}
            disabled={!isPro}
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi
          </Button>
          <Button
            variant="ghost"
            className="border border-white/20 text-white hover:bg-white/10"
            onClick={() => {
              setPendingAction(null);
              setShowPassphraseDialog(true);
            }}
            disabled={!isPro}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            {passphrase ? "Cambia passphrase" : "Inserisci passphrase"}
          </Button>
        </div>
      </div>

      {lockedView ? (
        lockedView
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Documenti cifrati</h4>
            <span className="text-xs text-white/60">{sortedDocs.length} file</span>
          </div>
          {!passphrase && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100 shadow-[0_0_20px_-12px_rgba(251,191,36,0.6)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">Cassaforte bloccata</p>
                <p className="text-xs text-amber-100/80">
                  Inserisci la passphrase per aprire o scaricare i documenti cifrati.
                </p>
              </div>
            </div>
          )}
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                Caricamento Cassaforte...
              </div>
            ) : sortedDocs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/70">
                Nessun documento salvato in Cassaforte.
              </div>
            ) : (
              sortedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all",
                    !passphrase && "ring-1 ring-amber-400/30",
                  )}
                >
                  {!passphrase && (
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.14] text-amber-200">
                        <Lock className="h-28 w-28" />
                      </div>
                    </div>
                  )}
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <Badge className={cn("text-[10px]", CATEGORY_BADGE[(doc.category as VaultDocumentCategory) || "other"])}>
                      {VAULT_CATEGORIES.find((item) => item.value === doc.category)?.label || "Altro"}
                    </Badge>
                    {!passphrase && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/40 bg-amber-400/15 text-amber-100">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                      {passphrase ? (
                        <FileText className="h-5 w-5 text-white/70" />
                      ) : (
                        <Lock className="h-5 w-5 text-amber-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{doc.title}</p>
                      <p className="text-xs text-white/60">{doc.file_name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/10 text-white hover:bg-white/20"
                      onClick={() => handleOpen(doc)}
                      disabled={loadingPreviewId === doc.id}
                    >
                      {loadingPreviewId === doc.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FolderKey className="mr-2 h-4 w-4" />
                      )}
                      Apri
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border border-white/20 text-white hover:bg-white/10"
                      onClick={() => handleDownload(doc)}
                      disabled={loadingPreviewId === doc.id}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Scarica
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVaultDocument.mutate(doc)}
                      disabled={deleteVaultDocument.isPending}
                      className="border border-white/20 text-red-200 hover:text-red-100 hover:bg-white/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Elimina
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {variant === "standalone" ? (
        <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 text-white shadow-2xl">
          <div className="absolute -right-10 -top-10 opacity-[0.08]">
            <ShieldCheck className="h-40 w-40" />
          </div>
          <div className="absolute inset-0 opacity-70">
            <div className="absolute -top-24 -right-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl" />
          </div>
          {content}
        </Card>
      ) : (
        content
      )}

      <Dialog
        open={showUploadDialog}
        onOpenChange={(open) => {
          if (!open) {
            setTitle("");
            setCategory("passport");
          }
          setShowUploadDialog(open);
        }}
      >
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-6 pt-8 pb-10 text-white">
            <div className="absolute -right-6 -top-6 opacity-[0.08]">
              <UploadCloud className="h-28 w-28" />
            </div>
            <DialogHeader className="relative z-10 text-left">
              <DialogTitle className="text-2xl">Nuovo documento cifrato</DialogTitle>
              <DialogDescription className="text-white/70">
                Carica passaporti, assicurazioni o visti nella Cassaforte protetta.
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
              onChange={(event) => setCategory(event.target.value as VaultDocumentCategory)}
              className="h-11 w-full rounded-xl border border-input/70 bg-card/80 px-3 text-sm text-foreground"
            >
              {VAULT_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              La passphrase viene richiesta quando apri o scarichi un documento.
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleInputChange}
              />
              <input
                ref={scanInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleInputChange}
              />
              <Button
                type="button"
                variant="default"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={createVaultDocument.isPending}
              >
                {createVaultDocument.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                Carica file
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => scanInputRef.current?.click()}
                disabled={createVaultDocument.isPending}
              >
                <ScanLine className="mr-2 h-4 w-4" />
                Scansiona
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showPassphraseDialog}
        onOpenChange={(open) => {
          if (!open) {
            resetPassphraseDialog();
            setPendingAction(null);
          }
          setShowPassphraseDialog(open);
        }}
      >
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-6 pt-8 pb-10 text-white">
            <div className="absolute -right-6 -top-6 opacity-[0.08]">
              <ShieldCheck className="h-28 w-28" />
            </div>
            <DialogHeader className="relative z-10 text-left">
              <DialogTitle className="text-2xl">Inserisci passphrase</DialogTitle>
              <DialogDescription className="text-white/70">
                Serve per cifrare e decifrare i documenti della Cassaforte. Non viene mai salvata.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-4 bg-background px-6 py-6">
            <div className="relative">
              <Input
                type={showPassphrase ? "text" : "password"}
                value={passphraseInput}
                onChange={(event) => setPassphraseInput(event.target.value)}
                placeholder="Passphrase privata"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassphrase((prev) => !prev)}
              >
                {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Usa una passphrase che ricordi bene. Se la perdi, non potrai recuperare i documenti.
            </p>
            <Button className="w-full" onClick={handlePassphraseConfirm}>
              Sblocca Cassaforte
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SubscriptionDialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog} />
    </>
  );
}
