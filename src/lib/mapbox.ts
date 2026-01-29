
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface GeocodingResult {
  features: Array<{
    center: [number, number]; // [lng, lat]
    place_name: string;
  }>;
}

export const searchPlace = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  if (!query) return null;

  try {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const response = await fetch(endpoint);
    const data: GeocodingResult = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding place:", error);
    return null;
  }
};

export const getMapboxToken = () => MAPBOX_TOKEN;
