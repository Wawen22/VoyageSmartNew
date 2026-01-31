import { motion } from "framer-motion";
import { MapPin, Bot, Users, Plane } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Start Your Journey",
    description: "Create a trip, set your dates, and invite your friends. The adventure begins here.",
  },
  {
    number: "02",
    icon: Bot,
    title: "Chat with Voyage AI",
    description: "Ask your personal assistant to suggest activities, find hotels, or manage your budget instantly.",
  },
  {
    number: "03",
    icon: Users,
    title: "Collaborate in Real-Time",
    description: "Vote on ideas, split expenses automatically, and build the perfect itinerary together.",
  },
  {
    number: "04",
    icon: Plane,
    title: "Travel Stress-Free",
    description: "Access all your docs, tickets, and plans offline. Focus on the experience, not the logistics.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
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
            Your journey from idea to reality in four simple steps
          </p>
        </motion.div>

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
              <div className="flex-shrink-0 relative">
                <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg transform rotate-3">
                  <step.icon className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {step.number}
                </div>
              </div>

              <div className={`flex-1 text-center md:text-left ${index % 2 === 1 ? "md:text-right" : ""}`}>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-1/2 w-0.5 h-16 bg-gradient-to-b from-primary/20 to-transparent" style={{ top: "100%" }} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}