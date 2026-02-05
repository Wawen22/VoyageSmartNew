import { motion } from "framer-motion";

const logos = [
  "Club Viaggiatori",
  "Nomadi Urbani",
  "Travel Crew",
  "Expedition Lab",
  "SmartTrip",
];

const stats = [
  {
    value: "120k+",
    label: "itinerari creati",
  },
  {
    value: "4.9/5",
    label: "valutazione media",
  },
  {
    value: "1.3M",
    label: "spese divise",
  },
];

export function SocialProofSection() {
  return (
    <section className="py-14">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.9fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Social Proof
            </p>
            <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
              Team di viaggio e creator scelgono
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-500">
                {" "}VoyageSmart
              </span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Dati dimostrativi in attesa delle metriche reali.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {logos.map((logo) => (
              <div
                key={logo}
                className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/5 via-background to-emerald-500/5 p-6 shadow-card"
            >
              <div className="text-3xl font-bold text-foreground sm:text-4xl">
                {stat.value}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
