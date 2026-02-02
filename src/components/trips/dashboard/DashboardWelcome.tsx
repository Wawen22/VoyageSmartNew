import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function DashboardWelcome({ userName }: { userName?: string }) {
    if (!userName) return null;
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/10"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-full text-primary">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Bentornato, {userName}!</h2>
                    <p className="text-muted-foreground mt-1">Pronto per la prossima avventura? Hai 2 viaggi in programma questo mese.</p>
                </div>
            </div>
        </motion.div>
    )
}