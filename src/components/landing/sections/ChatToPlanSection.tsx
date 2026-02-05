import { motion } from "framer-motion";
import { MessageSquare, ArrowRight, Calendar, Sparkles } from "lucide-react";

export function ChatToPlanSection() {
  return (
    <section
      id="chat-to-plan"
      className="py-24 bg-gradient-to-br from-indigo-50/70 via-background to-amber-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/40 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Text Content */}
          <div className="lg:w-1/2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" />
              Killer Feature
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
              Dal caos della chat <br />
              al <span className="text-indigo-500">piano perfetto</span>.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Basta scorrere centinaia di messaggi per ritrovare quell'indirizzo. 
              Con <strong>Chat-to-Plan™</strong>, trasformi qualsiasi messaggio in un'attività 
              dell'itinerario o in una spesa con un solo click.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Discuti</h3>
                  <p className="text-muted-foreground text-sm">"Ragazzi, prenotiamo da Mario alle 20:30?"</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Clicca</h3>
                  <p className="text-muted-foreground text-sm">Tieni premuto il messaggio e scegli "Crea Attività".</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Pianificato!</h3>
                  <p className="text-muted-foreground text-sm">Aggiunto all'itinerario di tutti automaticamente.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="lg:w-1/2 w-full relative">
            {/* Background Blob */}
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
            
            <div className="relative grid grid-cols-2 gap-4">
              {/* Chat Side */}
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-background rounded-2xl shadow-xl border p-4 flex flex-col gap-3 relative z-10 rotate-[-2deg] mt-10"
              >
                <div className="flex items-center gap-2 border-b pb-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-muted-foreground ml-auto">Chat Gruppo</span>
                </div>
                <div className="bg-muted/50 rounded-xl rounded-tl-none p-3 text-sm self-start max-w-[90%]">
                  Andiamo a mangiare la pizza da Gino? 🍕
                </div>
                <div className="bg-indigo-500 text-white rounded-xl rounded-br-none p-3 text-sm self-end max-w-[90%] shadow-lg shadow-indigo-500/30">
                  <p>Ottima idea! Prenoto per le 20:00.</p>
                  <div className="mt-2 pt-2 border-t border-white/20 flex justify-between items-center">
                    <span className="text-[10px] opacity-80">Tap to plan...</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>

              {/* Plan Side */}
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-background rounded-2xl shadow-xl border p-4 flex flex-col gap-3 relative z-20 rotate-[2deg] -ml-10 mb-10"
              >
                <div className="flex items-center gap-2 border-b pb-2 mb-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold">Itinerario</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-muted-foreground">20:00</span>
                    <div className="w-0.5 h-full bg-emerald-200 mt-1" />
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-3 rounded-lg flex-1">
                    <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100">Cena da Gino</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">🍕 Pizzeria Gino, Centro</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Connecting Arrow */}
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-indigo-500 z-30 hidden md:block" viewBox="0 0 100 100">
              <path d="M10,50 Q50,10 90,50" fill="none" stroke="currentColor" strokeWidth="3" markerEnd="url(#arrowhead)" />
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
