const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  dt_txt: string;
}

interface ForecastResponse {
  list: WeatherData[];
  city: {
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    sunrise: number;
    sunset: number;
  };
}

export const getWeatherForecast = async (lat: number, lon: number): Promise<ForecastResponse | null> => {
  if (!lat || !lon) return null;

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=it&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};

export const getCurrentWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  if (!lat || !lon) return null;

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&lang=it&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Current weather fetch failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
};
