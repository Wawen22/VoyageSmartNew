import { motion } from "framer-motion";
import { 
  Sparkles, 
  Users, 
  Wallet, 
  Map, 
  Calendar, 
  Shield,
  Plane,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Planning",
    description: "Let AI generate personalized itineraries based on your preferences, budget, and travel style.",
    color: "from-primary to-accent",
  },
  {
    icon: Users,
    title: "Collaborative Trips",
    description: "Plan together in real-time. Vote on activities, share ideas, and keep everyone in sync.",
    color: "from-secondary to-sunset-warm",
  },
  {
    icon: Wallet,
    title: "Smart Expense Splitting",
    description: "Track expenses, split costs fairly, and settle debts easily. Like Splitwise, but better.",
    color: "from-forest to-accent",
  },
  {
    icon: Map,
    title: "Interactive Maps",
    description: "Visualize your entire trip with beautiful maps. Plan routes and discover hidden gems.",
    color: "from-primary to-ocean-light",
  },
  {
    icon: Calendar,
    title: "Day-by-Day Itineraries",
    description: "Organize activities by day with smart scheduling. Never miss a reservation again.",
    color: "from-sunset-warm to-sunset-glow",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your travel data is encrypted and protected. Share trips only with people you trust.",
    color: "from-ocean-deep to-primary",
  },
];

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
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">Everything You Need</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            One Platform,{" "}
            <span className="text-gradient-ocean">Endless Possibilities</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From AI-powered itinerary generation to expense splitting, 
            VoyageSmart has everything you need for the perfect trip.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative bg-card rounded-2xl p-6 lg:p-8 shadow-card hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/20"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { value: "50K+", label: "Trips Planned" },
            { value: "120+", label: "Countries" },
            { value: "$2M+", label: "Expenses Tracked" },
            { value: "4.9★", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gradient-ocean mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
