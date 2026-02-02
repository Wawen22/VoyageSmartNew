import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function DashboardWelcome({ userName }: { userName?: string }) {
    if (!userName) return null;
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-r from-primary/10 to-transparent rounded-xl md:rounded-2xl border border-primary/10"
        >
            <div className="flex items-center md:items-start gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-primary/20 rounded-full text-primary shrink-0">
                    <Sparkles className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div>
                    <h2 className="text-lg md:text-2xl font-bold text-foreground">Bentornato, {userName}!</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Pronto per la prossima avventura?</p>
                </div>
            </div>
        </motion.div>
    )
}