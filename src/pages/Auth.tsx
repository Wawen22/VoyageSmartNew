import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Loader2
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
      <div className="app-theme app-shell min-h-screen flex items-center justify-center relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="app-grid absolute inset-0" />
          <div className="app-orb app-orb-1" />
          <div className="app-orb app-orb-2" />
          <div className="app-orb app-orb-3" />
        </div>
        <img 
          src="/animated_logo-voyage_smart.gif" 
          alt="Loading..." 
          className="w-32 h-32 object-contain relative z-10"
        />
      </div>
    );
  }

  return (
    <div className="app-theme app-shell min-h-screen relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="app-grid absolute inset-0" />
        <div className="app-orb app-orb-1" />
        <div className="app-orb app-orb-2" />
        <div className="app-orb app-orb-3" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
          {/* Left Panel - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            <Link to="/" className="flex items-center gap-3 mb-10">
              <img 
                src="/logo-voyage_smart.png" 
                alt="Logo" 
                className="w-16 h-16 object-contain"
              />
              <span className="text-3xl font-bold font-serif text-[#735324]">VoyageSmart</span>
            </Link>

            <div className="app-surface-strong p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  {isSignUp ? "Crea il tuo account" : "Bentornato"}
                </h1>
                <p className="text-muted-foreground">
                  {isSignUp 
                    ? "Inizia a pianificare la tua prossima avventura" 
                    : "Accedi per continuare il tuo viaggio"}
                </p>
              </div>

              <Button variant="outline" className="w-full mb-6" size="lg" disabled>
                <Chrome className="w-5 h-5 mr-2" />
                Continua con Google
              </Button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">o</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Mario Rossi"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border/60 bg-card/85 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border/60 bg-card/85 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full h-12 pl-12 pr-12 rounded-2xl border border-border/60 bg-card/85 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="text-right">
                    <a href="#" className="text-sm text-primary hover:underline">
                      Password dimenticata?
                    </a>
                  </div>
                )}

                <Button type="submit" variant="default" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? "Crea Account" : "Accedi"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center mt-6 text-muted-foreground">
                {isSignUp ? "Hai già un account?" : "Non hai un account?"}{" "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary font-medium hover:underline"
                  disabled={loading}
                >
                  {isSignUp ? "Accedi" : "Registrati"}
                </button>
              </p>
            </div>

            <p className="text-center mt-6 text-sm text-muted-foreground">
              Continuando, accetti i nostri{" "}
              <a href="#" className="underline hover:text-foreground">Termini</a> e{" "}
              <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="app-section p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Plane className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Pianifica in modo intelligente
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Un'unica dashboard per ogni viaggio.
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="app-section p-4">
                  Organizza itinerari, alloggi, trasporti e spese con un flusso chiaro e professionale.
                </div>
                <div className="app-section p-4">
                  Collabora con il gruppo, condividi il viaggio e resta allineato con tutti.
                </div>
                <div className="app-section p-4">
                  Tutto ottimizzato per mobile: informazioni essenziali sempre a portata di mano.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
