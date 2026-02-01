
import { motion } from "framer-motion";
import { Bot, Mic, Zap, Check, MessageSquare } from "lucide-react";

export function AIShowcase() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-6 text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>Il Futuro dei Viaggi</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight text-foreground">
              Scopri Voyage AI. <br />
              <span className="text-indigo-600 dark:text-indigo-400">Il Tuo Agente Personale.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Non solo un chatbot, ma un compagno di viaggio proattivo. 
              Voyage AI comprende l'intero contesto del tuo viaggio ed esegue azioni per te.
            </p>

            <ul className="space-y-4">
              {[
                "Aggiungi spese semplicemente parlando",
                "Ottieni consigli contestuali sull'itinerario",
                "Calcoli istantanei tra valute multiple",
                "Integrazione Modalità Vocale hands-free"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground/80">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* The Mockup stays dark for contrast/device look, even in light mode */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative z-10 max-w-md mx-auto text-white">
              {/* Mock Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Voyage AI</div>
                  <div className="text-[10px] text-indigo-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    Online
                  </div>
                </div>
              </div>

              {/* Mock Messages */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-end">
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2 text-sm shadow-sm">
                    "Aggiungi 15€ per il pranzo"
                  </div>
                </div>
                <div className="flex justify-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-slate-700 w-full text-slate-300">
                    <div className="font-medium text-xs text-indigo-400 mb-2 uppercase tracking-wider">Azione Proposta</div>
                    <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-700/50">
                       <div>
                         <div className="font-bold text-white">€15.00</div>
                         <div className="text-[10px] text-slate-500 italic">Pranzo</div>
                       </div>
                       <div className="flex gap-1">
                         <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                           <Check className="w-3 h-3 text-emerald-500" />
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Input */}
              <div className="flex items-center gap-2 bg-slate-900 rounded-full px-4 py-2 border border-slate-800">
                <Mic className="w-4 h-4 text-slate-500" />
                <div className="text-xs text-slate-600 flex-1">Ask me anything...</div>
                <Zap className="w-4 h-4 text-indigo-500" />
              </div>
            </div>

            {/* Floating UI Badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-indigo-600 p-4 rounded-2xl shadow-xl z-20 hidden sm:block"
            >
              <Mic className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl z-20 hidden sm:block"
            >
              <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
