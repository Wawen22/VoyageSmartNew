import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  Eye,
  EyeOff,
  Chrome,
  Loader2,
  MapPin,
  Wallet,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn, user, loading: authLoading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/trips");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account esistente",
              description: "Questa email è già registrata. Per favore accedi.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Registrazione fallita",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Benvenuto a bordo! 🎉",
            description: "Il tuo account è stato creato con successo.",
          });
          navigate("/trips");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Accesso fallito",
            description: "Email o password non validi. Riprova.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Bentornato! ✈️",
            description: "Accesso effettuato con successo.",
          });
          navigate("/trips");
        }
      }
    } catch (err) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore inaspettato. Riprova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <img 
          src="/animated_logo-voyage_smart.gif" 
          alt="Loading..." 
          className="w-32 h-32 object-contain relative z-10"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-0 flex items-center justify-center relative z-10 h-full min-h-screen">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          
          {/* Left Panel - Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-[480px] mx-auto lg:mx-0"
          >
            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
              <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border border-white/20 shadow-sm group-hover:scale-105 transition-transform">
                  <img 
                    src="/logo-voyage_smart.png" 
                    alt="Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <span className="text-2xl font-sans font-bold italic tracking-tight text-3d-modern text-[#735324]">
                  VoyageSmart
                </span>
              </Link>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                {isSignUp ? (
                  <>
                    Inizia il tuo <br />
                    <span className="text-gradient-sunset">Viaggio</span>
                  </>
                ) : (
                  <>
                    Bentornato <br />
                    <span className="text-gradient-sunset">a Bordo</span>
                  </>
                )}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {isSignUp 
                  ? "Crea un account per pianificare, condividere e vivere esperienze uniche con i tuoi amici." 
                  : "Accedi al tuo itinerario, gestisci le spese e collabora in tempo reale con il tuo gruppo."}
              </p>
            </div>

            {/* Form Container */}
            <div className="relative">
              <Button variant="outline" className="w-full mb-8 h-14 rounded-2xl border-border/40 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-primary/20 text-foreground transition-all duration-300" size="lg" disabled>
                <Chrome className="w-5 h-5 mr-3" />
                Continua con Google
              </Button>

              <div className="relative flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">oppure</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                      animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          placeholder="Nome Completo"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full h-14 pl-14 pr-4 rounded-2xl border border-border/40 bg-black/5 dark:bg-white/5 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 hover:bg-black/10 dark:hover:bg-white/10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    placeholder="Indirizzo Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-14 pl-14 pr-4 rounded-2xl border border-border/40 bg-black/5 dark:bg-white/5 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 hover:bg-black/10 dark:hover:bg-white/10"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-14 pl-14 pr-14 rounded-2xl border border-border/40 bg-black/5 dark:bg-white/5 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 hover:bg-black/10 dark:hover:bg-white/10"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {!isSignUp && (
                  <div className="text-right">
                    <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                      Password dimenticata?
                    </a>
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant="sunset" 
                  size="xl" 
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-orange-500/20 mt-4" 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? "Crea Account Gratuito" : "Accedi al tuo Viaggio"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center mt-8">
                <p className="text-muted-foreground">
                  {isSignUp ? "Hai già un account?" : "Non hai ancora un account?"}{" "}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-foreground font-bold hover:text-primary transition-colors underline decoration-2 decoration-primary/30 hover:decoration-primary underline-offset-4"
                    disabled={loading}
                  >
                    {isSignUp ? "Accedi ora" : "Registrati gratis"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Feature Showcase (Desktop Only) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="relative h-[600px] overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/70 shadow-2xl backdrop-blur-md">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
              <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-[120px]" />
              <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-amber-400/15 blur-[140px]" />
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:40px_40px]" />

              <div className="relative z-10 flex h-full flex-col justify-between p-10">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
                    <Sparkles className="h-3 w-3" />
                    Il viaggio diventa smart
                  </div>
                  <h2 className="mt-6 text-3xl font-black tracking-tight text-foreground">
                    Tutto il tuo viaggio <br /> in una sola app.
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Itinerario, spese e collaborazione si muovono insieme. Un'unica dashboard
                    che ti aiuta a decidere più velocemente e a viaggiare senza stress.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-5 shadow-card backdrop-blur-sm">
                    <div className="absolute -right-6 -top-6 text-emerald-500/10">
                      <MapPin className="h-20 w-20" />
                    </div>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Itinerario</p>
                        <p className="text-sm font-semibold text-foreground">Tappe, mappe e note condivise in tempo reale.</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-5 shadow-card backdrop-blur-sm">
                    <div className="absolute -right-6 -top-6 text-indigo-500/10">
                      <Wallet className="h-20 w-20" />
                    </div>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Wallet</p>
                        <p className="text-sm font-semibold text-foreground">Spese divise, documenti protetti, zero caos.</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-5 shadow-card backdrop-blur-sm">
                    <div className="absolute -right-6 -top-6 text-amber-500/10">
                      <Sparkles className="h-20 w-20" />
                    </div>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Voyage AI</p>
                        <p className="text-sm font-semibold text-foreground">Suggerimenti smart per hotel, attività e logistica.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Dati Protetti
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <User className="h-3.5 w-3.5" />
                    Collaborazione real-time
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
