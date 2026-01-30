
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface GeocodingResult {
  features: Array<{
    center: [number, number]; // [lng, lat]
    place_name: string;
  }>;
}

export const searchPlace = async (query: string): Promise<{ lat: number; lng: number; countryCode?: string } | null> => {
  if (!query) return null;

  try {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const response = await fetch(endpoint);
    const data: GeocodingResult & { features: Array<{ context?: Array<{ id: string, short_code?: string }> }> } = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [lng, lat] = feature.center;
      
      let countryCode: string | undefined;
      if (feature.context) {
        const countryContext = feature.context.find(c => c.id.startsWith('country.'));
        if (countryContext && countryContext.short_code) {
          countryCode = countryContext.short_code.toUpperCase();
        }
      }

      return { lat, lng, countryCode };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding place:", error);
    return null;
  }
};

export const getMapboxToken = () => MAPBOX_TOKEN;
