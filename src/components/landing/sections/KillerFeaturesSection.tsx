import { motion } from "framer-motion";
import { MessageSquareText, ShieldCheck, Bot, ArrowUpRight } from "lucide-react";

const features = [
  {
    id: "chat-to-plan",
    title: "Chat-to-Plan",
    description:
      "Trasforma messaggi e vocali in tappe, attività o spese con un tap. Addio caos in chat.",
    icon: MessageSquareText,
    accent: "text-indigo-600",
    gradient: "from-indigo-500/10 via-slate-900/5 to-indigo-500/5",
    placeholder: "Anteprima Chat → Itinerario",
  },
  {
    id: "wallet-vault",
    title: "Wallet + Cassaforte",
    description:
      "Biglietti, voucher e documenti sensibili sempre con te, protetti da crittografia e passphrase.",
    icon: ShieldCheck,
    accent: "text-emerald-600",
    gradient: "from-emerald-500/10 via-slate-900/5 to-sky-500/5",
    placeholder: "Wallet & Vault UI",
  },
  {
    id: "voyage-ai",
    title: "Voyage AI",
    description:
      "Un agente contestuale che conosce il tuo viaggio e agisce: spese, suggerimenti, conversioni.",
    icon: Bot,
    accent: "text-amber-600",
    gradient: "from-amber-500/10 via-slate-900/5 to-rose-500/5",
    placeholder: "Assistente AI",
  },
];

export function KillerFeaturesSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Premium Experience
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Killer Features: <span className="text-gradient-sunset">Tre Pilastri</span> del Tuo Viaggio
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Abbiamo progettato le funzionalità più impattanti per i gruppi: dalla trasformazione della chat in piani concreti alla sicurezza totale dei tuoi dati.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br ${feature.gradient} p-6 shadow-card`}
            >
              <div className="absolute -right-10 -top-10 opacity-[0.08]">
                <feature.icon className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 ${feature.accent}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>

                <div className="mt-5 rounded-2xl border border-dashed border-white/50 bg-white/40 p-4 text-xs text-muted-foreground">
                  {feature.placeholder}
                </div>

                <a
                  href={`#${feature.id}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
                >
                  Scopri di piu
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
