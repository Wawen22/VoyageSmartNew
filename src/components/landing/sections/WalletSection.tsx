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
    <section id="wallet-vault" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
              <ShieldCheck className="h-3 w-3" />
              Vault & Wallet
            </div>
            <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
              I tuoi documenti, <span className="text-emerald-500">al sicuro</span>.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Non rischiare di perdere passaporti o prenotazioni. Il Travel Wallet di VoyageSmart
              usa crittografia avanzata per proteggere ciò che conta di più.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {items.map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -5 }}
                  className="rounded-2xl border bg-card p-4 shadow-card"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-white/40 bg-gradient-to-br from-emerald-500/10 via-white/60 to-sky-500/10 p-4 shadow-2xl">
              <div className="relative rounded-[1.5rem] border border-dashed border-emerald-500/30 bg-white/70 p-4">
                <div className="absolute right-6 top-6 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                  Pro
                </div>
                <div className="relative rounded-2xl bg-slate-950">
                  <video
                    className="hidden h-full w-full rounded-2xl object-cover lg:block"
                    src="/video_wallet_desktop.mp4"
                    muted
                    playsInline
                    autoPlay
                    loop
                    preload="metadata"
                  />
                  <video
                    className="h-full w-full rounded-2xl object-cover lg:hidden"
                    src="/video_wallet_mobile.mp4"
                    muted
                    playsInline
                    autoPlay
                    loop
                    preload="metadata"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
