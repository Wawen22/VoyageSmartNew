import { motion } from "framer-motion";
import { 
  Sparkles, 
  Users, 
  Wallet, 
  Map, 
  Calendar, 
  Shield,
  Bot,
  MessageSquareText,
  Zap,
  Lightbulb,
  PocketKnife,
  Languages,
  Coins,
  ShieldCheck,
  FileScan,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Features() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Funzionalità Potenti</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Tutto Ciò che Ti Serve per il
            <br />
            <span className="text-gradient-ocean">Viaggio Perfetto</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            VoyageSmart combina una potente assistenza IA con strumenti di pianificazione intuitivi.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto"
        >
          {/* Main Feature: AI Assistant (Span 2 cols on md) */}
          <motion.div 
            variants={itemVariants}
            className="order-1 md:order-1 md:col-span-2 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500/20 transition-all"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bot className="w-40 h-40 text-indigo-500" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-600">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Assistente Voyage AI</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Il tuo agente di viaggio personale in tasca. Chiedi raccomandazioni, 
                aggiungi spese ("Aggiungi pranzo 20€"), o crea attività semplicemente chattando. 
                Conosce il tuo itinerario e budget alla perfezione.
              </p>
              
              <div className="flex gap-3 flex-wrap">
                <div className="px-3 py-1 rounded-full bg-background border text-xs font-medium flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5 text-indigo-500" />
                  Contestuale
                </div>
                <div className="px-3 py-1 rounded-full bg-background border text-xs font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Scan & Plan
                </div>
                <div className="px-3 py-1 rounded-full bg-background border text-xs font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  Packing List AI
                </div>
                <div className="px-3 py-1 rounded-full bg-background border text-xs font-medium flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                  Tracciamento Spese
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature: Travel Tools (NEW) */}
          <motion.div 
            variants={itemVariants}
            className="order-2 md:order-2 bg-card border rounded-3xl p-8 hover:shadow-lg transition-all group relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-slate-500">
              <PocketKnife className="w-32 h-32" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center mb-6 text-slate-600 group-hover:scale-110 transition-transform">
              <PocketKnife className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Strumenti & Utility</h3>
            <p className="text-muted-foreground mb-4">
              Toolkit completo con Traduttore AI, Convertitore Valuta live e Generatore Liste Valigia intelligente.
            </p>
            <div className="flex gap-2">
               <div className="p-1.5 rounded-md bg-muted/50 text-muted-foreground"><Languages className="w-4 h-4"/></div>
               <div className="p-1.5 rounded-md bg-muted/50 text-muted-foreground"><Coins className="w-4 h-4"/></div>
               <div className="p-1.5 rounded-md bg-muted/50 text-muted-foreground"><Sparkles className="w-4 h-4"/></div>
            </div>
          </motion.div>

          {/* Feature: Smart Finance */}
          <motion.div 
            variants={itemVariants}
            className="order-4 md:order-3 bg-card border rounded-3xl p-8 hover:shadow-lg transition-all group relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
              <Wallet className="w-32 h-32" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Divisione Spese</h3>
            <p className="text-muted-foreground">
              Traccia chi ha pagato cosa e lascia che l'AI analizzi i tuoi scontrini per aggiungere spese in un lampo.
            </p>
          </motion.div>

          {/* Feature: Trip Ideas (NEW - Span 2) */}
          <motion.div 
            variants={itemVariants}
            className="order-3 md:order-4 md:col-span-2 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/20 transition-all"
          >
            <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Lightbulb className="w-40 h-40 text-amber-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-600">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Bacheca Idee & Ispirazioni</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Salva link, note e foto. Voyage AI può analizzare i tuoi appunti per trasformarli in tappe concrete dell'itinerario.
              </p>
            </div>
          </motion.div>

          {/* Feature: Travel Wallet & Vault (NEW) */}
          <motion.div 
            variants={itemVariants}
            className="order-5 md:order-5 md:col-span-2 bg-gradient-to-br from-slate-900/5 to-indigo-900/5 border border-slate-500/10 rounded-3xl p-8 relative overflow-hidden group hover:border-slate-500/20 transition-all"
          >
            <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileScan className="w-40 h-40 text-slate-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-900/10 flex items-center justify-center mb-6 text-slate-700">
                <FileScan className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Magic Vault & Cassaforte</h3>
              <div className="absolute right-0 top-0">
                <div className="px-2.5 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-[10px] font-semibold uppercase tracking-widest text-amber-600">
                  PRO
                </div>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                L'AI estrae automaticamente i dati dai tuoi PDF (voli, hotel) e li aggiunge al tuo viaggio. Massima sicurezza con crittografia end-to-end.
              </p>
              <div className="flex gap-2">
                <div className="px-3 py-1 rounded-full bg-background border text-xs font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  Analisi AI
                </div>
                <div className="px-3 py-1 rounded-full bg-background border text-xs font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Vault PRO
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature: Interactive Maps */}
          <motion.div 
            variants={itemVariants}
            className="order-6 md:order-6 bg-card border rounded-3xl p-8 hover:shadow-lg transition-all group relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
              <Map className="w-32 h-32" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Mappe Interattive</h3>
            <p className="text-muted-foreground">
              Visualizza il tuo percorso su una mappa dinamica. 
              Vedi i pin giornalieri, i tempi di percorrenza ed esplora le attrazioni.
            </p>
          </motion.div>

          {/* Feature: Collaboration (Span 2) */}
          <motion.div 
            variants={itemVariants}
            className="order-7 md:order-7 md:col-span-2 bg-gradient-to-br from-pink-500/5 to-rose-500/5 border border-pink-500/10 rounded-3xl p-8 relative overflow-hidden group hover:border-pink-500/20 transition-all"
          >
             <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-40 h-40 text-pink-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6 text-pink-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Collaborazione in Tempo Reale</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Pianificate insieme senza caos. Vota le idee, chatta con il gruppo, 
                commenta le attività e vedi i cambiamenti istantaneamente sui dispositivi di tutti.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
