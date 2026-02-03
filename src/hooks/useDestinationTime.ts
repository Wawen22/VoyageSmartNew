import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface TimeData {
  dateTime: string;
  timeZone: string;
  utcOffset: string;
}

export const useDestinationTime = (lat?: number | null, lng?: number | null) => {
  const { data: timeZoneData, isLoading } = useQuery({
    queryKey: ["timezone", lat, lng],
    queryFn: async () => {
      if (!lat || !lng) return null;

      // Using TimeAPI.io (Free, supports coordinates)
      const response = await fetch(
        `https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lng}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch timezone");
      }

      const data = await response.json();
      return data as TimeData;
    },
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 60 * 24, // Cache heavily (timezone doesn't change)
  });

  // Internal clock to keep the time ticking without refetching API
  const [localTime, setLocalTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!timeZoneData) return;

    // Parse the initial time from API
    // The API returns ISO string like "2023-10-05T14:30:00.1234567"
    const serverTime = new Date(timeZoneData.dateTime);
    const now = new Date();
    
    // Calculate offset between "now" (system time) and "serverTime"
    // This allows us to tick the clock using system interval
    const offset = serverTime.getTime() - now.getTime();

    const tick = () => {
      setLocalTime(new Date(Date.now() + offset));
    };

    tick(); // Init
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [timeZoneData]);

  return { 
    time: localTime, 
    timezone: timeZoneData?.timeZone, 
    offset: timeZoneData?.utcOffset,
    isLoading 
  };
};
