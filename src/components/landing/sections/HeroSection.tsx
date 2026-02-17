import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Play,
  MessageSquareText,
  Wallet,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const floatingBadges = [
  {
    label: "Chat-to-Plan",
    desc: "Da messaggio a itinerario",
    icon: MessageSquareText,
    className: "bg-primary/10 text-primary",
  },
  {
    label: "Wallet + Cassaforte",
    desc: "Documenti protetti",
    icon: ShieldCheck,
    className: "bg-emerald-500/10 text-emerald-700",
  },
  {
    label: "Voyage AI",
    desc: "Agente smart per il viaggio",
    icon: Bot,
    className: "bg-amber-500/10 text-amber-700",
  },
];

export function HeroSection() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoTab, setDemoTab] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const syncTab = () => setDemoTab(mediaQuery.matches ? "mobile" : "desktop");
    syncTab();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncTab);
      return () => mediaQuery.removeEventListener("change", syncTab);
    }

    mediaQuery.addListener(syncTab);
    return () => mediaQuery.removeListener(syncTab);
  }, []);

  return (
    <section className="relative overflow-hidden pt-28 pb-16">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200/40 via-background to-background" />
      <div className="absolute top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/30 blur-[120px]" />
      <div className="absolute bottom-10 -right-24 h-80 w-80 rounded-full bg-amber-400/20 blur-[140px]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary"
            >
              <Sparkles className="h-3 w-3" />
              Il viaggio diventa smart
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Pianifica Meglio.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600">
                Viaggia Meglio.
              </span>
              <br />
              Vivi di Più.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed"
            >
              Il compagno di viaggio tutto in uno che combina pianificazione intelligente dell'itinerario,
              divisione delle spese e collaborazione in tempo reale per viaggi indimenticabili. Tutto
              sincronizzato, tutto semplice.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <Button size="xl" variant="hero" asChild>
                <Link to="/auth?signup=true">
                  Inizia Gratis
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="rounded-2xl"
                type="button"
                onClick={() => setDemoOpen(true)}
              >
                <Play className="h-4 w-4" />
                Guarda la Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 grid gap-4 sm:grid-cols-3"
            >
              {floatingBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-card backdrop-blur-sm"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${badge.className}`}>
                    <badge.icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-[2rem] border border-border/40 bg-card/70 p-4 shadow-2xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="relative h-[72vh] w-full overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-left sm:h-[78vh] lg:h-auto lg:aspect-[4/3]"
              >
                <video
                  className="hidden h-full w-full object-cover lg:block"
                  src="/presentazione_app_desktop.mp4"
                  muted
                  playsInline
                  autoPlay
                  loop
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                  <Play className="h-3.5 w-3.5" />
                  Apri demo completa
                </div>
              </button>
            </div>

            <div className="absolute -right-8 top-10 hidden w-36 rounded-[1.25rem] border border-border/50 bg-card/80 p-2 shadow-card backdrop-blur-sm lg:block">
              <div className="aspect-[9/16] overflow-hidden rounded-[1rem] bg-slate-900">
                <video
                  className="h-full w-full object-cover"
                  src="/presentazione_app_mobile.mp4"
                  muted
                  playsInline
                  autoPlay
                  loop
                  preload="metadata"
                />
              </div>
              <p className="mt-2 text-center text-[10px] font-semibold text-muted-foreground">
                Preview mobile
              </p>
            </div>

            <div className="absolute -left-10 top-8 hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-card backdrop-blur-sm lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nuovo documento</p>
                  <p className="text-sm font-semibold text-foreground">Passaporto caricato</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 bottom-10 hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-card backdrop-blur-sm lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chat-to-Plan</p>
                  <p className="text-sm font-semibold text-foreground">Cena alle 20:30 aggiunta</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="w-[95vw] max-w-5xl rounded-[2rem] border border-white/10 bg-background/95 p-0 shadow-2xl backdrop-blur-2xl">
          <div className="grid gap-6 p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Demo prodotto</DialogTitle>
              <DialogDescription className="text-base">
                Video desktop e mobile della presentazione VoyageSmart.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={demoTab} onValueChange={(value) => setDemoTab(value as "desktop" | "mobile")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted/50 p-1">
                <TabsTrigger value="mobile" className="rounded-full text-sm font-semibold">
                  Mobile
                </TabsTrigger>
                <TabsTrigger value="desktop" className="rounded-full text-sm font-semibold">
                  Desktop
                </TabsTrigger>
              </TabsList>
              <TabsContent value="mobile" className="mt-4">
                <div className="mx-auto max-w-sm aspect-[9/16] overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
                  <video
                    className="h-full w-full object-cover"
                    src="/presentazione_app_mobile.mp4"
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>
              </TabsContent>
              <TabsContent value="desktop" className="mt-4">
                <div className="aspect-video overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
                  <video
                    className="h-full w-full object-cover"
                    src="/presentazione_app_desktop.mp4"
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
