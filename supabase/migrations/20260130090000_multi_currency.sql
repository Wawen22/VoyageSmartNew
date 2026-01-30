-- Multi-currency support for expenses
-- 1. Add columns to expenses table to track original currency and amount
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS original_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS original_currency VARCHAR(3) DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10,6) DEFAULT 1.0;

-- 2. Migrate existing data: set original values equal to current amount (assuming EUR)
UPDATE public.expenses
SET original_amount = amount,
    original_currency = 'EUR',
    exchange_rate = 1.0
WHERE original_amount IS NULL;

-- 3. Add base currency column to trips table
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS base_currency VARCHAR(3) DEFAULT 'EUR';

-- 4. Add comments for clarity
COMMENT ON COLUMN public.expenses.original_amount IS 'The amount in the original currency input by the user';
COMMENT ON COLUMN public.expenses.original_currency IS 'ISO code of the original currency (e.g., USD)';
COMMENT ON COLUMN public.expenses.exchange_rate IS 'Exchange rate applied to convert to base currency at the time of expense';
