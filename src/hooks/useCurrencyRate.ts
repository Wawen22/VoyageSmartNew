import { useQuery } from "@tanstack/react-query";

export const useCurrencyRate = (from: string, to: string) => {
  return useQuery({
    queryKey: ["exchange-rate", from, to],
    queryFn: async () => {
      if (from === to) return 1;
      
      // Using frankfurter.app (Free, no key, reliable for major currencies)
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${from}&to=${to}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch rate");
      }
      
      const data = await response.json();
      return data.rates[to];
    },
    enabled: !!from && !!to && from !== to,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};
