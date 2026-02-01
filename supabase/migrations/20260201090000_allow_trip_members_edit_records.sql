-- Allow all trip members to update/delete collaborative trip data

-- Accommodations
DROP POLICY IF EXISTS "Creator can update accommodations" ON public.accommodations;
DROP POLICY IF EXISTS "Creator or admin can delete accommodations" ON public.accommodations;

CREATE POLICY "Trip members can update accommodations"
  ON public.accommodations FOR UPDATE
  USING (is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can delete accommodations"
  ON public.accommodations FOR DELETE
  USING (is_trip_member(auth.uid(), trip_id));

-- Transports
DROP POLICY IF EXISTS "Creator can update transports" ON public.transports;
DROP POLICY IF EXISTS "Creator or admin can delete transports" ON public.transports;

CREATE POLICY "Trip members can update transports"
  ON public.transports FOR UPDATE
  USING (is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can delete transports"
  ON public.transports FOR DELETE
  USING (is_trip_member(auth.uid(), trip_id));

-- Itinerary activities
DROP POLICY IF EXISTS "Creator can update activities" ON public.itinerary_activities;
DROP POLICY IF EXISTS "Creator or admin can delete activities" ON public.itinerary_activities;

CREATE POLICY "Trip members can update activities"
  ON public.itinerary_activities FOR UPDATE
  USING (is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can delete activities"
  ON public.itinerary_activities FOR DELETE
  USING (is_trip_member(auth.uid(), trip_id));

-- Expenses
DROP POLICY IF EXISTS "Creator can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Creator or admin can delete expenses" ON public.expenses;

CREATE POLICY "Trip members can update expenses"
  ON public.expenses FOR UPDATE
  USING (is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can delete expenses"
  ON public.expenses FOR DELETE
  USING (is_trip_member(auth.uid(), trip_id));

-- Expense splits (allow any trip member to manage splits tied to an expense)
DROP POLICY IF EXISTS "Expense creator can manage splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Expense creator can update splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Expense creator can delete splits" ON public.expense_splits;

CREATE POLICY "Trip members can create splits"
  ON public.expense_splits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_id AND is_trip_member(auth.uid(), e.trip_id)
    )
  );

CREATE POLICY "Trip members can update splits"
  ON public.expense_splits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_id AND is_trip_member(auth.uid(), e.trip_id)
    )
  );

CREATE POLICY "Trip members can delete splits"
  ON public.expense_splits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_id AND is_trip_member(auth.uid(), e.trip_id)
    )
  );
