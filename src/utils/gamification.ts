import { differenceInDays, parseISO } from "date-fns";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  color: string; // Tailwind class for text color
  bgGradient: string; // Tailwind class for background
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface UserStats {
  totalTrips: number;
  totalCountries: number;
  totalKm: number;
  visitedCountries: string[]; // List of country codes
}

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

export const getFlagUrl = (countryCode: string): string => {
  if (!countryCode) return "";
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

export const calculateUserStats = (trips: any[], userLocation?: { lat: number, lng: number }): UserStats => {
  // Default home location (e.g., Rome) if not provided, just for demo purposes if user has no location
  // ideally we don't calculate KM if we don't know where they started.
  // But to show *something*, let's assume a central point or just sum trip distances if they have multiple stops (not supported yet).
  // Let's use the userLocation if provided, otherwise 0 km.
  
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
      id: "globetrotter",
      name: "Globetrotter",
      description: "Visita 5 paesi diversi.",
      icon: "Globe",
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      unlocked: stats.totalCountries >= 5,
      progress: stats.totalCountries,
      maxProgress: 5
    },
    {
      id: "explorer",
      name: "Esploratore",
      description: "Percorri più di 5.000 km.",
      icon: "Compass",
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-orange-500/20",
      unlocked: stats.totalKm >= 5000,
      progress: stats.totalKm,
      maxProgress: 5000
    },
    {
      id: "weekend_warrior",
      name: "Weekend Warrior",
      description: "Completa 3 viaggi brevi (< 4 giorni).",
      icon: "Zap",
      color: "text-green-500",
      bgGradient: "from-green-500/20 to-emerald-500/20",
      unlocked: false, // Calculated below
      progress: 0,
      maxProgress: 3
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

  // Calculate Weekend Warrior
  const shortTrips = trips.filter(t => {
    if (!t.start_date || !t.end_date) return false;
    const duration = differenceInDays(parseISO(t.end_date), parseISO(t.start_date)) + 1;
    return duration < 4;
  }).length;

  const wwBadge = badges.find(b => b.id === "weekend_warrior");
  if (wwBadge) {
    wwBadge.unlocked = shortTrips >= 3;
    wwBadge.progress = shortTrips;
  }

  return badges;
};
