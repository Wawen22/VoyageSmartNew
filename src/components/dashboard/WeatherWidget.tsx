import { useState, useEffect } from "react";
import { getCurrentWeather, getWeatherForecast, WeatherData } from "@/lib/weather";
import { Card } from "@/components/ui/card";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  CloudDrizzle, 
  CloudFog, 
  Moon,
  Droplets,
  Wind,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

interface WeatherWidgetProps {
  lat: number | null;
  lon: number | null;
  locationName: string;
}

export function WeatherWidget({ lat, lon, locationName }: WeatherWidgetProps) {
  const [current, setCurrent] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!lat || !lon) return;
      setLoading(true);
      try {
        const currentData = await getCurrentWeather(lat, lon);
        const forecastData = await getWeatherForecast(lat, lon);
        
        if (currentData) setCurrent(currentData);
        
        // Filter forecast to get one reading per day (e.g., noon)
        if (forecastData?.list) {
          const daily = forecastData.list.filter((reading) => 
            reading.dt_txt.includes("12:00:00")
          ).slice(0, 3); // Next 3 days
          setForecast(daily);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lat, lon]);

  if (!lat || !lon) return null;

  const getWeatherIcon = (id: number, isNight = false) => {
    if (id >= 200 && id < 300) return <CloudLightning className="w-8 h-8 text-yellow-400" />;
    if (id >= 300 && id < 500) return <CloudDrizzle className="w-8 h-8 text-blue-400" />;
    if (id >= 500 && id < 600) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (id >= 600 && id < 700) return <Snowflake className="w-8 h-8 text-cyan-200" />;
    if (id >= 700 && id < 800) return <CloudFog className="w-8 h-8 text-slate-400" />;
    if (id === 800) return isNight ? <Moon className="w-8 h-8 text-indigo-200" /> : <Sun className="w-8 h-8 text-amber-400" />;
    if (id > 800) return <Cloud className="w-8 h-8 text-slate-300" />;
    return <Sun className="w-8 h-8 text-amber-400" />;
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 h-[200px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </Card>
    );
  }

  if (!current) return null;

  const isNight = current.weather[0].icon.includes('n');

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500/80 to-purple-600/80 text-white">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      
      {/* Decorative Orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/30 rounded-full blur-3xl" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-semibold text-lg">{locationName}</h3>
            <p className="text-white/70 text-sm capitalize">
              {current.weather[0].description}
            </p>
          </div>
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shadow-sm">
            {getWeatherIcon(current.weather[0].id, isNight)}
          </div>
        </div>

        {/* Current Temp */}
        <div className="flex items-end gap-2 mb-6">
          <span className="text-5xl font-bold tracking-tighter">
            {Math.round(current.main.temp)}°
          </span>
          <div className="flex flex-col text-sm text-white/80 mb-1.5">
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3" />
              {Math.round(current.wind.speed * 3.6)} km/h
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              {current.main.humidity}%
            </span>
          </div>
        </div>

        {/* Forecast */}
        {forecast.length > 0 && (
          <div className="grid grid-cols-3 gap-2 border-t border-white/20 pt-4">
            {forecast.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-xs text-white/60">
                  {new Date(day.dt * 1000).toLocaleDateString('it-IT', { weekday: 'short' })}
                </span>
                <div className="scale-75 origin-center">
                  {getWeatherIcon(day.weather[0].id)}
                </div>
                <span className="text-sm font-medium">
                  {Math.round(day.main.temp)}°
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
