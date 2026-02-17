import { motion } from "framer-motion";
import { MapPin, Bot, Users, Plane, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Inizia il Viaggio",
    description: "Crea un viaggio, imposta le date e invita i tuoi amici. L'avventura inizia qui.",
    color: "rose",
    gradient: "from-rose-500/10 via-pink-500/5 to-red-500/10",
    accent: "text-rose-500",
    border: "border-rose-500/20"
  },
  {
    number: "02",
    icon: Bot,
    title: "Chatta con Voyage AI",
    description: "Chiedi al tuo assistente personale di suggerire attività, trovare hotel o gestire il tuo budget istantaneamente.",
    color: "indigo",
    gradient: "from-indigo-500/10 via-violet-500/5 to-purple-500/10",
    accent: "text-indigo-500",
    border: "border-indigo-500/20"
  },
  {
    number: "03",
    icon: Users,
    title: "Collabora in Tempo Reale",
    description: "Vota le idee, dividi le spese automaticamente e costruisci l'itinerario perfetto insieme.",
    color: "emerald",
    gradient: "from-emerald-500/10 via-teal-500/5 to-green-500/10",
    accent: "text-emerald-500",
    border: "border-emerald-500/20"
  },
  {
    number: "04",
    icon: Plane,
    title: "Viaggia Senza Stress",
    description: "Accedi a tutti i tuoi documenti, biglietti e piani offline. Concentrati sull'esperienza, non sulla logistica.",
    color: "sky",
    gradient: "from-sky-500/10 via-blue-500/5 to-cyan-500/10",
    accent: "text-sky-500",
    border: "border-sky-500/20"
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Step by Step
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Il Tuo Viaggio, <span className="text-gradient-sunset">Semplificato</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Dall'ispirazione iniziale alla destinazione finale, Voyage Smart ti accompagna in ogni fase con tecnologia all'avanguardia.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className={`h-full relative overflow-hidden rounded-[2.5rem] border ${step.border} bg-gradient-to-br ${step.gradient} p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5`}>
                {/* Background Watermark */}
                <div className="absolute -right-8 -top-8 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                  <step.icon className={`w-40 h-40 opacity-[0.05] ${step.accent}`} />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-8 flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-card dark:bg-zinc-900 flex items-center justify-center shadow-sm border ${step.border}`}>
                      <step.icon className={`w-7 h-7 ${step.accent}`} />
                    </div>
                    <span className={`text-4xl font-black opacity-10 ${step.accent}`}>
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                    {step.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className={step.accent}>Scopri di più</span>
                    <ArrowRight className={`w-4 h-4 ${step.accent}`} />
                  </div>
                </div>
              </div>

              {/* Connector for Desktop (Optional, visually subtle) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 translate-y-[-50%] z-20">
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}