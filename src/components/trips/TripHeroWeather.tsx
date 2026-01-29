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
    const className = "w-5 h-5";
    if (id >= 200 && id < 300) return <CloudLightning className={`${className} text-yellow-300`} />;
    if (id >= 300 && id < 500) return <CloudDrizzle className={`${className} text-blue-300`} />;
    if (id >= 500 && id < 600) return <CloudRain className={`${className} text-blue-400`} />;
    if (id >= 600 && id < 700) return <Snowflake className={`${className} text-cyan-200`} />;
    if (id >= 700 && id < 800) return <CloudFog className={`${className} text-slate-300`} />;
    if (id === 800) return isNight ? <Moon className={`${className} text-indigo-200`} /> : <Sun className={`${className} text-yellow-400`} />;
    if (id > 800) return <Cloud className={`${className} text-slate-300`} />;
    return <Sun className={`${className} text-yellow-400`} />;
  };

  const isNight = current.weather[0].icon.includes('n');

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 shadow-lg text-white cursor-help hover:bg-black/40 transition-colors ${className}`}
          >
            {getWeatherIcon(current.weather[0].id, isNight)}
            <span className="font-semibold text-sm">
              {Math.round(current.main.temp)}°
            </span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-black/80 backdrop-blur-xl border-white/10 text-white p-3 shadow-xl">
          <div className="space-y-1 text-xs">
            <p className="font-semibold capitalize text-base mb-1">{current.weather[0].description}</p>
            <div className="flex items-center gap-3 text-white/70">
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                {Math.round(current.wind.speed * 3.6)} km/h
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                {current.main.humidity}%
              </span>
            </div>
            <p className="pt-1 text-[10px] opacity-50">Percepita: {Math.round(current.main.feels_like)}°</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
