import { differenceInDays, parseISO } from "date-fns";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface UserStats {
  totalTrips: number;
  totalCountries: number;
  totalKm: number;
  visitedCountries: string[];
}

export const getFlagUrl = (countryCode: string): string => {
  if (!countryCode) return "";
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

// Haversine formula to calculate distance in km
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d);
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const calculateUserStats = (trips: any[], userLocation?: { lat: number, lng: number }): UserStats => {
  const uniqueCountries = new Set<string>();
  let totalKm = 0;
  
  trips.forEach(trip => {
    if (trip.country_code) {
      uniqueCountries.add(trip.country_code);
    }
    
    if (userLocation && trip.latitude && trip.longitude) {
      totalKm += calculateDistance(userLocation.lat, userLocation.lng, trip.latitude, trip.longitude);
    }
  });

  return {
    totalTrips: trips.length,
    totalCountries: uniqueCountries.size,
    totalKm: totalKm,
    visitedCountries: Array.from(uniqueCountries)
  };
};

export const getBadges = (stats: UserStats, trips: any[]): Badge[] => {
  const badges: Badge[] = [
    {
      id: "first_steps",
      name: "Primi Passi",
      description: "Crea il tuo primo viaggio.",
      icon: "MapPin",
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
      unlocked: stats.totalTrips >= 1,
      progress: stats.totalTrips,
      maxProgress: 1
    },
    {
      id: "traveler",
      name: "Viaggiatore",
      description: "Completa 3 viaggi.",
      icon: "Zap",
      color: "text-green-500",
      bgGradient: "from-green-500/20 to-emerald-500/20",
      unlocked: stats.totalTrips >= 3,
      progress: stats.totalTrips,
      maxProgress: 3
    },
    {
      id: "globetrotter",
      name: "Globetrotter",
      description: "Visita 3 paesi diversi.",
      icon: "Globe",
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      unlocked: stats.totalCountries >= 3,
      progress: stats.totalCountries,
      maxProgress: 3
    },
    {
      id: "explorer",
      name: "Esploratore",
      description: "Completa 5 viaggi.",
      icon: "Compass",
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-orange-500/20",
      unlocked: stats.totalTrips >= 5,
      progress: stats.totalTrips,
      maxProgress: 5
    },
    {
      id: "citizen",
      name: "Cittadino del Mondo",
      description: "Visita 10 paesi diversi.",
      icon: "Crown",
      color: "text-indigo-500",
      bgGradient: "from-indigo-500/20 to-violet-500/20",
      unlocked: stats.totalCountries >= 10,
      progress: stats.totalCountries,
      maxProgress: 10
    }
  ];

  return badges;
};
