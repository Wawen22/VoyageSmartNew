import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, UserStats, getFlagUrl } from "@/utils/gamification";
import { Globe, MapPin, Navigation, Trophy, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as Icons from "lucide-react";

interface DigitalPassportProps {
  stats: UserStats;
  badges: Badge[];
  loading?: boolean;
}

export function DigitalPassport({ stats, badges, loading }: DigitalPassportProps) {
  if (loading) {
    return <div className="h-64 animate-pulse bg-muted rounded-xl" />;
  }

  // Helper to get dynamic icon
  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Trophy;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe className="w-24 h-24" />
          </div>
          <CardContent className="p-6">
            <p className="text-blue-100 text-sm font-medium">Paesi Visitati</p>
            <h3 className="text-4xl font-bold mt-2">{stats.totalCountries}</h3>
            <div className="mt-4 flex -space-x-2 overflow-hidden">
               {stats.visitedCountries.slice(0, 5).map((code) => (
                 <img 
                   key={code}
                   src={getFlagUrl(code)} 
                   alt={code}
                   className="inline-block h-8 w-8 rounded-full ring-2 ring-blue-900 object-cover"
                 />
               ))}
               {stats.visitedCountries.length > 5 && (
                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 ring-2 ring-blue-900 text-xs font-medium">
                   +{stats.visitedCountries.length - 5}
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Navigation className="w-24 h-24" />
          </div>
          <CardContent className="p-6">
            <p className="text-emerald-100 text-sm font-medium">Chilometri Percorsi</p>
            <h3 className="text-4xl font-bold mt-2">
              {stats.totalKm.toLocaleString()} <span className="text-lg font-normal opacity-80">km</span>
            </h3>
            <p className="mt-4 text-xs text-emerald-100 opacity-80">
              Circa {Math.round(stats.totalKm / 40075 * 10) / 10} giri della Terra
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MapPin className="w-24 h-24" />
          </div>
          <CardContent className="p-6">
            <p className="text-purple-100 text-sm font-medium">Viaggi Totali</p>
            <h3 className="text-4xl font-bold mt-2">{stats.totalTrips}</h3>
            <p className="mt-4 text-xs text-purple-100 opacity-80">
              Prossimo traguardo: {badges.find(b => !b.unlocked && b.id === 'first_class')?.maxProgress || 'Top'} viaggi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Badges & Traguardi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <TooltipProvider key={badge.id}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div 
                      className={`
                        relative group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300
                        ${badge.unlocked 
                          ? `bg-gradient-to-br ${badge.bgGradient} border-transparent shadow-sm hover:shadow-md hover:scale-105` 
                          : 'bg-muted/50 border-muted text-muted-foreground opacity-70 grayscale'
                        }
                      `}
                    >
                      <div className={`
                        p-3 rounded-full mb-3 
                        ${badge.unlocked ? 'bg-white shadow-sm' : 'bg-muted'}
                      `}>
                         <div className={badge.unlocked ? badge.color : "text-muted-foreground"}>
                           {getIcon(badge.icon)}
                         </div>
                      </div>
                      
                      <h4 className="font-semibold text-sm text-center mb-1 line-clamp-1">
                        {badge.name}
                      </h4>
                      
                      {!badge.unlocked && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}

                      {/* Progress bar for locked badges */}
                      {!badge.unlocked && badge.maxProgress && (
                        <div className="w-full mt-2 h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary/50" 
                            style={{ width: `${Math.min(100, ((badge.progress || 0) / badge.maxProgress) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px] text-center">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {!badge.unlocked && badge.maxProgress && (
                      <p className="text-xs mt-1 font-mono">
                        {badge.progress} / {badge.maxProgress}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Passport Stamps / Flags */}
      <Card className="border-border/60 bg-[#fdfdfd] dark:bg-[#1a1a1a] relative overflow-hidden">
        {/* Decorative passport pattern overlay could go here */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }} 
        />
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Passaporto Digitale
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.visitedCountries.length > 0 ? (
            <div className="flex flex-wrap gap-6 p-4">
              {stats.visitedCountries.map((code) => (
                <div key={code} className="flex flex-col items-center gap-2 group">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative shadow-md rounded-md overflow-hidden w-16 h-12 border border-black/10"
                  >
                    <img 
                      src={getFlagUrl(code)} 
                      alt={code}
                      className="w-full h-full object-cover"
                    />
                    {/* Stamp Effect Overlay */}
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none" />
                  </motion.div>
                  <span className="text-xs font-mono font-medium text-muted-foreground tracking-widest">
                    {code}
                  </span>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
               <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
               <p>Nessun timbro sul passaporto... ancora!</p>
               <p className="text-sm">Aggiungi un viaggio per iniziare a collezionare bandiere.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
