import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Globe, Shield, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 px-8 py-16 md:px-16 md:py-24 text-center">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>
            
            {/* Animated Glows */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-white/90 text-sm font-medium">Ready to start?</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight"
              >
                The future of travel is <br />
                <span className="text-gradient-sunset italic">already here.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed"
              >
                Experience the first travel companion that combines contextual AI intelligence 
                with real-time collaboration. Start planning your next trip for free.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link to="/auth?signup=true" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 rounded-2xl group text-lg px-10 h-16">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/trips" className="w-full sm:w-auto">
                  <Button variant="ghost" size="xl" className="w-full sm:w-auto text-white border border-white/10 hover:bg-white/5 rounded-2xl text-lg px-10 h-16">
                    Browse Trips
                  </Button>
                </Link>
              </motion.div>

              {/* Feature Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-slate-500 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Available Worldwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>No Card Required</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}