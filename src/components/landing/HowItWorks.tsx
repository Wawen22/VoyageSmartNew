import { motion } from "framer-motion";
import { MapPin, Sparkles, Users, Plane } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Choose Your Destination",
    description: "Tell us where you want to go, when, and who's joining. We'll handle the rest.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Generates Your Itinerary",
    description: "Our AI creates a personalized day-by-day plan with activities, restaurants, and hidden gems.",
  },
  {
    number: "03",
    icon: Users,
    title: "Collaborate & Customize",
    description: "Invite travel buddies to vote on activities, add ideas, and fine-tune the plan together.",
  },
  {
    number: "04",
    icon: Plane,
    title: "Travel & Track",
    description: "Access your itinerary offline, track expenses, and create memories that last forever.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 lg:py-32 bg-muted/50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How It <span className="text-gradient-sunset">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From inspiration to destination in four simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`flex flex-col md:flex-row items-center gap-8 mb-12 last:mb-0 ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Number & Icon */}
              <div className="flex-shrink-0 relative">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-ocean">
                  <step.icon className="w-10 h-10 lg:w-14 lg:h-14 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm shadow-sunset">
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 text-center md:text-left ${index % 2 === 1 ? "md:text-right" : ""}`}>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                  {step.description}
                </p>
              </div>

              {/* Connector Line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-1/2 w-0.5 h-16 bg-gradient-to-b from-primary/30 to-transparent" style={{ top: "100%" }} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
