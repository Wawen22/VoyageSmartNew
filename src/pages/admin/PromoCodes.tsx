import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin, AdminPromoCode, AdminPromoRedemption, CreatePromoCodeInput, UpdatePromoCodeInput } from "@/hooks/useAdmin";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Search, 
  TicketPercent, 
  Users, 
  TrendingUp,
  Calendar,
  Shield,
  Crown,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Eye,
  Loader2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type PromoCodeType = Database["public"]["Enums"]["promo_code_type"];

const promoCodeTypes: { value: PromoCodeType; label: string; icon: React.ReactNode }[] = [
  { value: "trial", label: "Prova Gratuita", icon: <Calendar className="w-4 h-4" /> },
  { value: "subscription", label: "Abbonamento", icon: <Crown className="w-4 h-4" /> },
  { value: "lifetime", label: "Lifetime PRO", icon: <Shield className="w-4 h-4" /> },
  { value: "discount", label: "Sconto", icon: <TicketPercent className="w-4 h-4" /> },
];

const getTypeLabel = (type: PromoCodeType) => {
  return promoCodeTypes.find(t => t.value === type)?.label || type;
};

const getTypeBadgeColor = (type: PromoCodeType) => {
  switch (type) {
    case "trial": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "subscription": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    case "lifetime": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "discount": return "bg-green-500/10 text-green-600 border-green-500/20";
    default: return "";
  }
};

export default function AdminPromoCodes() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    isAdmin,
    isAdminLoading,
    promoCodes,
    promoCodesLoading,
    promoRedemptions,
    promoRedemptionsLoading,
    promoStats,
    promoStatsLoading,
    refetchPromoCodes,
    refetchRedemptions,
    refetchStats,
    getRedemptionsForCode,
    createPromoCode,
    isCreatingPromoCode,
    updatePromoCode,
    isUpdatingPromoCode,
    deletePromoCode,
    isDeletingPromoCode,
  } = useAdmin();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | PromoCodeType>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [redemptionsDialogOpen, setRedemptionsDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<AdminPromoCode | null>(null);
  const [selectedCodeRedemptions, setSelectedCodeRedemptions] = useState<AdminPromoRedemption[]>([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);

  // Form state for creating
  const [createForm, setCreateForm] = useState<CreatePromoCodeInput>({
    code: "",
    name: "",
    type: "trial",
    trial_days: 7,
    discount_percent: null,
    lifetime_pro: false,
    max_total_uses: null,
    max_uses_per_user: 1,
    expires_at: null,
    description: null,
    notes: null,
  });

  // Form state for editing
  const [editForm, setEditForm] = useState<UpdatePromoCodeInput>({
    id: "",
    name: null,
    description: null,
    max_total_uses: null,
    expires_at: null,
    is_active: null,
    notes: null,
  });

  // Loading state
  if (authLoading || isAdminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <Navbar />
        <main className="container mx-auto px-4 py-28">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifica accesso admin...</p>
          </div>
        </main>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <Navbar />
        <main className="container mx-auto px-4 py-28">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle>Accesso Negato</CardTitle>
              <CardDescription>
                Non hai i permessi per accedere a questa pagina.
                Questa area è riservata agli amministratori.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate("/")}>
                Torna alla Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Filter codes
  const filteredCodes = promoCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && code.is_active && (!code.expires_at || new Date(code.expires_at) > new Date())) ||
      (statusFilter === "inactive" && !code.is_active) ||
      (statusFilter === "expired" && code.expires_at && new Date(code.expires_at) <= new Date());
    
    const matchesType = typeFilter === "all" || code.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle create
  const handleCreate = () => {
    if (!createForm.code.trim() || !createForm.name.trim()) {
      toast.error("Codice e nome sono obbligatori");
      return;
    }

    createPromoCode(createForm, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        setCreateForm({
          code: "",
          name: "",
          type: "trial",
          trial_days: 7,
          discount_percent: null,
          lifetime_pro: false,
          max_total_uses: null,
          max_uses_per_user: 1,
          expires_at: null,
          description: null,
          notes: null,
        });
      },
    });
  };

  // Handle edit
  const handleEdit = () => {
    if (!editForm.id) return;

    updatePromoCode(editForm, {
      onSuccess: () => {
        setEditDialogOpen(false);
        setSelectedCode(null);
      },
    });
  };

  // Handle delete
  const handleDelete = () => {
    if (!selectedCode) return;

    deletePromoCode(selectedCode.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedCode(null);
      },
    });
  };

  // Open edit dialog
  const openEditDialog = (code: AdminPromoCode) => {
    setSelectedCode(code);
    setEditForm({
      id: code.id,
      name: code.name,
      description: code.description,
      max_total_uses: code.max_total_uses,
      expires_at: code.expires_at,
      is_active: code.is_active,
      notes: code.notes,
    });
    setEditDialogOpen(true);
  };

  // Open redemptions dialog - fetch redemptions directly for this specific code
  const openRedemptionsDialog = async (code: AdminPromoCode) => {
    setSelectedCode(code);
    setRedemptionsDialogOpen(true);
    setLoadingRedemptions(true);
    
    try {
      // Fetch redemptions directly from the database for this specific code
      const redemptions = await getRedemptionsForCode(code.id);
      console.log(`Fetched redemptions for code ${code.code}:`, redemptions);
      setSelectedCodeRedemptions(redemptions);
    } catch (error) {
      console.error("Error fetching redemptions:", error);
      // Fallback: try to filter from already loaded redemptions
      const fallbackRedemptions = promoRedemptions.filter(r => 
        r.promo_code?.toUpperCase() === code.code?.toUpperCase()
      );
      console.log(`Fallback filtering for code ${code.code}:`, fallbackRedemptions);
      setSelectedCodeRedemptions(fallbackRedemptions);
    } finally {
      setLoadingRedemptions(false);
    }
  };

  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Codice copiato negli appunti");
  };

  // Generate random code
  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm(prev => ({ ...prev, code }));
  };

  // Refresh all data
  const refreshAll = () => {
    refetchPromoCodes();
    refetchRedemptions();
    refetchStats();
    toast.success("Dati aggiornati");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <main className="container mx-auto px-4 py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Gestione Codici Promozionali</h1>
              <p className="text-muted-foreground mt-1">
                Crea, modifica ed elimina i codici promozionali
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshAll}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Aggiorna
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Codice
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Codici Totali</p>
                    {promoStatsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold">{promoStats?.total_codes || 0}</p>
                    )}
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <TicketPercent className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Codici Attivi</p>
                    {promoStatsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-green-600">{promoStats?.active_codes || 0}</p>
                    )}
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Riscatti Totali</p>
                    {promoStatsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold">{promoStats?.total_redemptions || 0}</p>
                    )}
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ultimi 7 Giorni</p>
                    {promoStatsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-purple-600">{promoStats?.redemptions_last_7_days || 0}</p>
                    )}
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-full">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="codes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="codes">Codici</TabsTrigger>
              <TabsTrigger value="redemptions">Riscatti</TabsTrigger>
            </TabsList>

            {/* Codes Tab */}
            <TabsContent value="codes">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle>Lista Codici</CardTitle>
                    <div className="flex flex-col md:flex-row gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Cerca codice..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-full md:w-64"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                        <SelectTrigger className="w-full md:w-36">
                          <SelectValue placeholder="Stato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tutti</SelectItem>
                          <SelectItem value="active">Attivi</SelectItem>
                          <SelectItem value="inactive">Inattivi</SelectItem>
                          <SelectItem value="expired">Scaduti</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                        <SelectTrigger className="w-full md:w-36">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tutti i tipi</SelectItem>
                          {promoCodeTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {promoCodesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredCodes.length === 0 ? (
                    <div className="text-center py-12">
                      <TicketPercent className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Nessun codice trovato</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Codice</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Utilizzi</TableHead>
                            <TableHead>Stato</TableHead>
                            <TableHead>Scadenza</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCodes.map((code) => {
                            const isExpired = code.expires_at && new Date(code.expires_at) <= new Date();
                            const isExhausted = code.max_total_uses !== null && code.current_uses >= code.max_total_uses;
                            
                            return (
                              <TableRow key={code.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                      {code.code}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => copyCode(code.code)}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{code.name}</p>
                                    {code.description && (
                                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {code.description}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getTypeBadgeColor(code.type)}>
                                    {getTypeLabel(code.type)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{code.current_uses}</span>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="text-muted-foreground">
                                      {code.max_total_uses || "∞"}
                                    </span>
                                    {code.usage_percentage !== null && (
                                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-primary transition-all"
                                          style={{ width: `${Math.min(code.usage_percentage, 100)}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {!code.is_active ? (
                                    <Badge variant="secondary" className="bg-slate-500/10 text-slate-600">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Inattivo
                                    </Badge>
                                  ) : isExpired ? (
                                    <Badge variant="secondary" className="bg-red-500/10 text-red-600">
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      Scaduto
                                    </Badge>
                                  ) : isExhausted ? (
                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      Esaurito
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Attivo
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {code.expires_at ? (
                                    <div className="text-sm">
                                      <p>{format(new Date(code.expires_at), "dd/MM/yyyy", { locale: it })}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(code.expires_at), { addSuffix: true, locale: it })}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">Mai</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => openRedemptionsDialog(code)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => openEditDialog(code)}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => {
                                        setSelectedCode(code);
                                        setDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Redemptions Tab */}
            <TabsContent value="redemptions">
              <Card>
                <CardHeader>
                  <CardTitle>Storico Riscatti</CardTitle>
                  <CardDescription>
                    Tutti i riscatti effettuati dagli utenti
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {promoRedemptionsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : promoRedemptions.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Nessun riscatto trovato</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Utente</TableHead>
                            <TableHead>Codice</TableHead>
                            <TableHead>Beneficio</TableHead>
                            <TableHead>Data Riscatto</TableHead>
                            <TableHead>IP</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {promoRedemptions.map((redemption) => (
                            <TableRow key={redemption.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{redemption.user_fullname || "Utente"}</p>
                                  <p className="text-xs text-muted-foreground">{redemption.user_email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                    {redemption.promo_code}
                                  </code>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {redemption.promo_code_name}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {redemption.trial_ends_at && (
                                  <span className="text-sm">
                                    Prova fino al {format(new Date(redemption.trial_ends_at), "dd/MM/yyyy", { locale: it })}
                                  </span>
                                )}
                                {redemption.discount_applied && (
                                  <span className="text-sm">
                                    Sconto {redemption.discount_applied}%
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p>{format(new Date(redemption.redeemed_at), "dd/MM/yyyy HH:mm", { locale: it })}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(redemption.redeemed_at), { addSuffix: true, locale: it })}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground font-mono">
                                  {redemption.ip_address || "-"}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crea Nuovo Codice Promozionale</DialogTitle>
              <DialogDescription>
                Configura un nuovo codice promozionale per i tuoi utenti
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Code */}
              <div className="grid gap-2">
                <Label htmlFor="code">Codice *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="es. WELCOME2024"
                    value={createForm.code}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={generateRandomCode}>
                    Genera
                  </Button>
                </div>
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="es. Codice Benvenuto 2024"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Type */}
              <div className="grid gap-2">
                <Label>Tipo di Codice *</Label>
                <Select
                  value={createForm.type}
                  onValueChange={(v) => {
                    const type = v as PromoCodeType;
                    setCreateForm(prev => ({
                      ...prev,
                      type,
                      trial_days: type === "trial" ? 7 : null,
                      discount_percent: type === "discount" ? 10 : null,
                      lifetime_pro: type === "lifetime",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {promoCodeTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type-specific fields */}
              {createForm.type === "trial" && (
                <div className="grid gap-2">
                  <Label htmlFor="trial_days">Giorni di Prova</Label>
                  <Input
                    id="trial_days"
                    type="number"
                    min={1}
                    max={365}
                    value={createForm.trial_days || ""}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, trial_days: parseInt(e.target.value) || null }))}
                  />
                </div>
              )}

              {createForm.type === "discount" && (
                <div className="grid gap-2">
                  <Label htmlFor="discount_percent">Percentuale Sconto</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    min={1}
                    max={100}
                    value={createForm.discount_percent || ""}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, discount_percent: parseInt(e.target.value) || null }))}
                  />
                </div>
              )}

              {/* Usage limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="max_total_uses">Utilizzi Massimi Totali</Label>
                  <Input
                    id="max_total_uses"
                    type="number"
                    min={1}
                    placeholder="Illimitato"
                    value={createForm.max_total_uses || ""}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, max_total_uses: parseInt(e.target.value) || null }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_uses_per_user">Utilizzi per Utente</Label>
                  <Input
                    id="max_uses_per_user"
                    type="number"
                    min={1}
                    value={createForm.max_uses_per_user || 1}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, max_uses_per_user: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              {/* Expiration */}
              <div className="grid gap-2">
                <Label htmlFor="expires_at">Data Scadenza</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={createForm.expires_at || ""}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, expires_at: e.target.value || null }))}
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  placeholder="Descrizione visibile agli utenti"
                  value={createForm.description || ""}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value || null }))}
                />
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Note Interne</Label>
                <Textarea
                  id="notes"
                  placeholder="Note visibili solo agli admin"
                  value={createForm.notes || ""}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value || null }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleCreate} disabled={isCreatingPromoCode}>
                {isCreatingPromoCode && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Crea Codice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Modifica Codice</DialogTitle>
              <DialogDescription>
                Modifica le proprietà del codice "{selectedCode?.code}"
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="edit_name">Nome</Label>
                <Input
                  id="edit_name"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value || null }))}
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="edit_description">Descrizione</Label>
                <Textarea
                  id="edit_description"
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value || null }))}
                />
              </div>

              {/* Max uses */}
              <div className="grid gap-2">
                <Label htmlFor="edit_max_uses">Utilizzi Massimi Totali</Label>
                <Input
                  id="edit_max_uses"
                  type="number"
                  min={1}
                  placeholder="Illimitato"
                  value={editForm.max_total_uses || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, max_total_uses: parseInt(e.target.value) || null }))}
                />
              </div>

              {/* Expiration */}
              <div className="grid gap-2">
                <Label htmlFor="edit_expires_at">Data Scadenza</Label>
                <Input
                  id="edit_expires_at"
                  type="datetime-local"
                  value={editForm.expires_at ? format(new Date(editForm.expires_at), "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, expires_at: e.target.value || null }))}
                />
              </div>

              {/* Active */}
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_active">Codice Attivo</Label>
                <Switch
                  id="edit_active"
                  checked={editForm.is_active ?? false}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="edit_notes">Note Interne</Label>
                <Textarea
                  id="edit_notes"
                  value={editForm.notes || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value || null }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleEdit} disabled={isUpdatingPromoCode}>
                {isUpdatingPromoCode && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salva Modifiche
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Elimina Codice Promozionale</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare il codice "{selectedCode?.code}"?
                {selectedCode && selectedCode.current_uses > 0 && (
                  <span className="block mt-2 text-amber-600">
                    Attenzione: questo codice è già stato utilizzato {selectedCode.current_uses} volte.
                    Eliminarlo non annullerà i benefici già concessi agli utenti.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeletingPromoCode}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingPromoCode && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Redemptions Dialog */}
        <Dialog open={redemptionsDialogOpen} onOpenChange={setRedemptionsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Riscatti per "{selectedCode?.code}"</DialogTitle>
              <DialogDescription>
                {loadingRedemptions ? "Caricamento..." : `${selectedCodeRedemptions.length} utenti hanno riscattato questo codice`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {loadingRedemptions ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Caricamento riscatti...</p>
                </div>
              ) : selectedCodeRedemptions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nessun riscatto per questo codice</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCodeRedemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{redemption.user_fullname || "Utente"}</p>
                        <p className="text-sm text-muted-foreground">{redemption.user_email}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{format(new Date(redemption.redeemed_at), "dd/MM/yyyy HH:mm", { locale: it })}</p>
                        <p className="text-muted-foreground font-mono">{redemption.ip_address || "-"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
