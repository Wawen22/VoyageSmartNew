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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Feature Suite
          </p>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Tutto cio che ti serve per viaggiare bene
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Un set completo di strumenti per organizzare, condividere e vivere ogni viaggio senza caos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br ${feature.gradient} p-6 shadow-card`}
            >
              <div className="absolute -right-8 -top-8 opacity-[0.08]">
                <feature.icon className="h-28 w-28" />
              </div>
              <div className="relative z-10">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 ${feature.iconColor}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
