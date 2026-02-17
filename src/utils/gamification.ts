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
  totalExpenses?: number;
  totalActivities?: number;
}

export const getFlagUrl = (countryCode: string): string => {
  if (!countryCode) return "";
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

/**
 * Haversine formula to calculate distance in km between two points
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
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

/**
 * Calculates total traveled distance for a list of trips.
 * For each trip, if it has multiple destinations, it calculates the distance between them.
 * If a home location is provided, it also adds the distance from home to the first destination.
 */
export const calculateUserStats = (
  trips: any[], 
  options?: { 
    homeLocation?: { lat: number, lng: number },
    activities?: any[],
    expenses?: any[]
  }
): UserStats => {
  const uniqueCountries = new Set<string>();
  let totalKm = 0;
  
  trips.forEach(trip => {
    if (trip.country_code) {
      uniqueCountries.add(trip.country_code);
    }
    
    // Logic for internal trip distance (multi-destination)
    if (trip.destinations && trip.destinations.length > 1) {
      for (let i = 0; i < trip.destinations.length - 1; i++) {
        const d1 = trip.destinations[i];
        const d2 = trip.destinations[i+1];
        if (d1.latitude && d1.longitude && d2.latitude && d2.longitude) {
          totalKm += calculateDistance(d1.latitude, d1.longitude, d2.latitude, d2.longitude);
        }
      }
    }

    // Distance from home to trip if provided
    if (options?.homeLocation && trip.latitude && trip.longitude) {
      totalKm += calculateDistance(
        options.homeLocation.lat, 
        options.homeLocation.lng, 
        trip.latitude, 
        trip.longitude
      );
    }
  });

  return {
    totalTrips: trips.length,
    totalCountries: uniqueCountries.size,
    totalKm: totalKm,
    visitedCountries: Array.from(uniqueCountries),
    totalActivities: options?.activities?.length || 0,
    totalExpenses: options?.expenses?.length || 0
  };
};

export const getBadges = (stats: UserStats, trips: any[]): Badge[] => {
  const longestTrip = trips.reduce((max, trip) => {
    const duration = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;
    return Math.max(max, duration);
  }, 0);

  const badges: Badge[] = [
    {
      id: "first_steps",
      name: "Primi Passi",
      description: "Crea il tuo primo viaggio.",
      icon: "MapPin",
      color: "text-blue-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
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
      bgGradient: "from-green-500/10 to-emerald-500/10",
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
      bgGradient: "from-purple-500/10 to-pink-500/10",
      unlocked: stats.totalCountries >= 3,
      progress: stats.totalCountries,
      maxProgress: 3
    },
    {
      id: "mileage_hero",
      name: "Eroe dei Chilometri",
      description: "Percorri i tuoi primi 1000km.",
      icon: "Compass",
      color: "text-orange-500",
      bgGradient: "from-orange-500/10 to-amber-500/10",
      unlocked: stats.totalKm >= 1000,
      progress: stats.totalKm,
      maxProgress: 1000
    },
    {
      id: "long_stay",
      name: "Lunga Permanenza",
      description: "Fai un viaggio di almeno 10 giorni.",
      icon: "Calendar",
      color: "text-pink-500",
      bgGradient: "from-pink-500/10 to-rose-500/10",
      unlocked: longestTrip >= 10,
      progress: longestTrip,
      maxProgress: 10
    },
    {
      id: "explorer",
      name: "Esploratore",
      description: "Completa 5 viaggi.",
      icon: "Map",
      color: "text-amber-500",
      bgGradient: "from-amber-500/10 to-orange-500/10",
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
      bgGradient: "from-indigo-500/10 to-violet-500/10",
      unlocked: stats.totalCountries >= 10,
      progress: stats.totalCountries,
      maxProgress: 10
    }
  ];

  return badges;
};
