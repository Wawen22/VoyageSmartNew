// Currency types and utilities

export const CURRENCIES = [
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', label: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', label: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', label: 'New Zealand Dollar', symbol: 'NZ$' },
];

export interface ExchangeRateResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

/**
 * Fetches the exchange rate from a base currency to a target currency.
 * Uses the frankfurter.app API (free, open source).
 * 
 * @param from Base currency code (e.g. 'USD')
 * @param to Target currency code (e.g. 'EUR')
 * @param date Optional date in YYYY-MM-DD format. Defaults to latest.
 * @returns The exchange rate (1 unit of 'from' = X units of 'to')
 */
export async function getExchangeRate(from: string, to: string, date?: string): Promise<number | null> {
  if (from === to) return 1;

  try {
    const baseUrl = 'https://api.frankfurter.app';
    const endpoint = date ? `/${date}` : '/latest';
    const url = `${baseUrl}${endpoint}?from=${from}&to=${to}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
    }

    const data: ExchangeRateResponse = await response.json();
    return data.rates[to] || null;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return null;
  }
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
