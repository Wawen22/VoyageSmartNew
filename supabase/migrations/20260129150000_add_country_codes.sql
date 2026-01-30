-- Add country_code to trip_destinations
ALTER TABLE public.trip_destinations
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);

-- Add country_code to trips (for primary destination)
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);
