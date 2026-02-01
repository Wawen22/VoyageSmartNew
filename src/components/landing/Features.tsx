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
  Zap
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
            className="md:col-span-2 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500/20 transition-all"
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
                  Modalità Azione
                </div>
                <div className="px-3 py-1 rounded-full bg-background border text-xs font-medium flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                  Tracciamento Spese
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature: Smart Finance */}
          <motion.div 
            variants={itemVariants}
            className="bg-card border rounded-3xl p-8 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Divisione Intelligente</h3>
            <p className="text-muted-foreground">
              Traccia chi ha pagato cosa e lascia che calcoliamo chi deve a chi. 
              Supporta valute multiple con conversione automatica.
            </p>
          </motion.div>

          {/* Feature: Interactive Maps */}
          <motion.div 
            variants={itemVariants}
            className="bg-card border rounded-3xl p-8 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Mappe Interattive</h3>
            <p className="text-muted-foreground">
              Visualizza il tuo percorso su una mappa dinamica. 
              Vedi i pin giornalieri, i tempi di percorrenza ed esplora le attrazioni vicine.
            </p>
          </motion.div>

          {/* Feature: Collaboration */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 bg-gradient-to-br from-orange-500/5 to-pink-500/5 border border-orange-500/10 rounded-3xl p-8 relative overflow-hidden group hover:border-orange-500/20 transition-all"
          >
             <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-40 h-40 text-orange-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 text-orange-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Collaborazione in Tempo Reale</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Pianificate insieme senza caos. Vota le idee, commenta le attività 
                e vedi i cambiamenti istantaneamente mentre i tuoi amici li fanno.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}