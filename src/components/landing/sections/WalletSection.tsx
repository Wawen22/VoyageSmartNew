import { ShieldCheck, Lock, FileCheck, Key } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    title: "Travel Wallet",
    desc: "Biglietti aerei, voucher hotel e prenotazioni sempre a portata di mano, anche offline.",
    icon: FileCheck,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Cassaforte Cifrata",
    desc: "Passaporti e documenti sensibili protetti da passphrase. Nemmeno noi possiamo leggerli.",
    icon: Lock,
    color: "bg-rose-100 text-rose-600",
  },
  {
    title: "Accesso Condiviso",
    desc: "Decidi cosa condividere con il gruppo e cosa mantenere privato in un tap.",
    icon: Key,
    color: "bg-sky-100 text-sky-600",
  },
];

export function WalletSection() {
  return (
    <section id="wallet-vault" className="py-32 relative overflow-hidden bg-background">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[30%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Security First
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              I tuoi documenti, <span className="text-gradient-sunset">al sicuro</span>.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
              Non rischiare di perdere passaporti o prenotazioni. Il Travel Wallet di VoyageSmart
              usa crittografia avanzata per proteggere ciò che conta di più.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {items.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 dark:from-white/5 dark:to-white/[0.02] p-6 shadow-sm backdrop-blur-sm"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-4 shadow-sm border border-white/20 bg-white dark:bg-black/20 ${item.color.split(' ')[1]}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Main Video Container with Glassmorphism */}
            <div className="relative rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-emerald-500/10 via-white/5 to-sky-500/10 p-4 shadow-2xl backdrop-blur-sm">
              <div className="relative rounded-[2rem] overflow-hidden border border-white/20 bg-slate-950 shadow-inner">
                {/* Pro Badge - Refined */}
                <div className="absolute right-6 top-6 z-20 rounded-full border border-amber-400/30 bg-amber-400/10 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-500 shadow-lg">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                    Pro Feature
                  </span>
                </div>

                <video
                  className="hidden lg:block h-full w-full object-cover"
                  src="/video_wallet_desktop.mp4"
                  muted
                  playsInline
                  autoPlay
                  loop
                  preload="metadata"
                />
                <video
                  className="lg:hidden h-full w-full object-cover"
                  src="/video_wallet_mobile.mp4"
                  muted
                  playsInline
                  autoPlay
                  loop
                  preload="metadata"
                />
              </div>
              
              {/* Decorative elements around video */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
