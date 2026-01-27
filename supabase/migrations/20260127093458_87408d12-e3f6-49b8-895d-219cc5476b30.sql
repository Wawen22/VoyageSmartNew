-- Create expense categories enum
CREATE TYPE public.expense_category AS ENUM (
  'food',
  'transport',
  'accommodation',
  'activities',
  'shopping',
  'other'
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  category expense_category NOT NULL DEFAULT 'other',
  paid_by UUID NOT NULL,
  created_by UUID NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create expense splits table (who owes what)
CREATE TABLE public.expense_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(expense_id, user_id)
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

-- RLS for expenses: only trip members can access
CREATE POLICY "Trip members can view expenses"
  ON public.expenses FOR SELECT
  USING (is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can create expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (is_trip_member(auth.uid(), trip_id) AND created_by = auth.uid());

CREATE POLICY "Creator can update expenses"
  ON public.expenses FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Creator or admin can delete expenses"
  ON public.expenses FOR DELETE
  USING (created_by = auth.uid() OR is_trip_admin(auth.uid(), trip_id));

-- RLS for expense_splits: based on parent expense access
CREATE POLICY "Users can view splits for their expenses"
  ON public.expense_splits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_id AND is_trip_member(auth.uid(), e.trip_id)
    )
  );

CREATE POLICY "Expense creator can manage splits"
  ON public.expense_splits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_id AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Expense creator can update splits"
  ON public.expense_splits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_id AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Expense creator can delete splits"
  ON public.expense_splits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_id AND e.created_by = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_splits;