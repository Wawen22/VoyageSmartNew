import { useState, useEffect } from "react";
import { getCurrentWeather, WeatherData } from "@/lib/weather";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  CloudDrizzle, 
  CloudFog, 
  Moon,
  Wind,
  Droplets,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TripHeroWeatherProps {
  lat?: number | null;
  lon?: number | null;
  className?: string;
}

export function TripHeroWeather({ lat, lon, className }: TripHeroWeatherProps) {
  const [current, setCurrent] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!lat || !lon) {
        setLoading(false);
        return;
      }
      try {
        const data = await getCurrentWeather(lat, lon);
        if (data) setCurrent(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lat, lon]);

  if (!lat || !lon || loading || !current) return null;

  const getWeatherIcon = (id: number, isNight = false) => {
    const iconClass = "w-7 h-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]";
    if (id >= 200 && id < 300) return <CloudLightning className={`${iconClass} text-yellow-300`} />;
    if (id >= 300 && id < 500) return <CloudDrizzle className={`${iconClass} text-blue-300`} />;
    if (id >= 500 && id < 600) return <CloudRain className={`${iconClass} text-blue-400`} />;
    if (id >= 600 && id < 700) return <Snowflake className={`${iconClass} text-cyan-100`} />;
    if (id >= 700 && id < 800) return <CloudFog className={`${iconClass} text-slate-200`} />;
    if (id === 800) return isNight ? <Moon className={`${iconClass} text-indigo-100`} /> : <Sun className={`${iconClass} text-yellow-400`} />;
    if (id > 800) return <Cloud className={`${iconClass} text-white`} />;
    return <Sun className={`${iconClass} text-yellow-400`} />;
  };

  const isNight = current.weather[0].icon.includes('n');

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className={`group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-white cursor-help transition-all duration-300 ${className}`}
          >
            <div className="relative">
              {getWeatherIcon(current.weather[0].id, isNight)}
              {/* Optional: pulsing glow behind icon */}
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex flex-col items-start leading-none">
              <span className="text-2xl font-bold tracking-tight">
                {Math.round(current.main.temp)}°
              </span>
              <span className="text-[10px] font-medium text-white/60 uppercase tracking-widest mt-0.5">
                {current.weather[0].main}
              </span>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="end"
          className="bg-black/90 backdrop-blur-2xl border-white/10 text-white p-4 shadow-2xl rounded-2xl min-w-[180px]"
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold capitalize text-white/90">{current.weather[0].description}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Condizioni attuali</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Wind className="w-3.5 h-3.5 text-blue-300" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">{Math.round(current.wind.speed * 3.6)} <span className="text-[10px] font-normal opacity-60">km/h</span></p>
                  <p className="text-[9px] opacity-40 uppercase">Vento</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Droplets className="w-3.5 h-3.5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">{current.main.humidity}<span className="text-[10px] font-normal opacity-60">%</span></p>
                  <p className="text-[9px] opacity-40 uppercase">Umidità</p>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-white/40 italic">Percepita: {Math.round(current.main.feels_like)}°</span>
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-blue-400/50 animate-pulse delay-75" />
                <span className="w-1 h-1 rounded-full bg-blue-400/20 animate-pulse delay-150" />
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}