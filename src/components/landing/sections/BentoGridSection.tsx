import {
  BarChart2,
  Map,
  CloudSun,
  Languages,
  Split,
  Calculator,
  Lightbulb,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Sondaggi Real-time",
    desc: "Vota destinazioni e ristoranti direttamente in chat.",
    icon: BarChart2,
    gradient: "from-purple-500/10 via-fuchsia-500/5 to-pink-500/10",
    iconColor: "text-purple-600",
  },
  {
    title: "Mappe Interattive",
    desc: "Visualizza l'itinerario su mappa dinamica.",
    icon: Map,
    gradient: "from-blue-500/10 via-cyan-500/5 to-sky-500/10",
    iconColor: "text-blue-600",
  },
  {
    title: "Meteo Integrato",
    desc: "Previsioni sempre aggiornate per le tappe.",
    icon: CloudSun,
    gradient: "from-sky-500/10 via-amber-500/5 to-orange-500/10",
    iconColor: "text-sky-600",
  },
  {
    title: "Split Spese",
    desc: "Gestione debiti e crediti multi-valuta.",
    icon: Split,
    gradient: "from-emerald-500/10 via-teal-500/5 to-green-500/10",
    iconColor: "text-emerald-600",
  },
  {
    title: "Traduttore AI",
    desc: "Traduzioni istantanee e contestuali.",
    icon: Languages,
    gradient: "from-amber-500/10 via-orange-500/5 to-yellow-500/10",
    iconColor: "text-amber-600",
  },
  {
    title: "Convertitore",
    desc: "Valute e unita di misura in tempo reale.",
    icon: Calculator,
    gradient: "from-rose-500/10 via-pink-500/5 to-red-500/10",
    iconColor: "text-rose-600",
  },
  {
    title: "Bacheca Idee & Ispirazioni",
    desc: "Salva link, note e foto; promuovi le idee nell'itinerario.",
    icon: Lightbulb,
    gradient: "from-amber-500/10 via-yellow-500/5 to-lime-500/10",
    iconColor: "text-amber-600",
  },
  {
    title: "Collaborazione in Tempo Reale",
    desc: "Commenti, voti e modifiche sincronizzate per tutto il gruppo.",
    icon: Users,
    gradient: "from-pink-500/10 via-rose-500/5 to-red-500/10",
    iconColor: "text-pink-600",
  },
];

export function BentoGridSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-20 max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Feature Suite
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Tutto ciò che ti serve per <span className="text-gradient-sunset">viaggiare bene</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Un set completo di strumenti per organizzare, condividere e vivere ogni viaggio senza caos.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className={`group relative overflow-hidden rounded-[2rem] border border-white/10 dark:border-white/5 bg-gradient-to-br ${feature.gradient} p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5`}
            >
              <div className="absolute -right-8 -top-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 opacity-[0.06]">
                <feature.icon className={`h-32 w-32 ${feature.iconColor}`} />
              </div>
              <div className="relative z-10">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-black/20 shadow-sm border border-white/20 transition-transform duration-300 group-hover:scale-110 ${feature.iconColor}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-foreground tracking-tight">{feature.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
