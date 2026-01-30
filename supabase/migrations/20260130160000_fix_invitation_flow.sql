-- Normalize existing invitation emails to avoid case-sensitive mismatches
WITH ranked AS (
  SELECT
    id,
    trip_id,
    lower(trim(invited_email)) AS norm_email,
    ROW_NUMBER() OVER (
      PARTITION BY trip_id, lower(trim(invited_email))
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM public.trip_invitations
)
DELETE FROM public.trip_invitations ti
USING ranked r
WHERE ti.id = r.id
  AND r.rn > 1;

UPDATE public.trip_invitations
SET invited_email = lower(trim(invited_email))
WHERE invited_email <> lower(trim(invited_email));

-- Ensure invited_email is always normalized
CREATE OR REPLACE FUNCTION public.normalize_invited_email()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.invited_email := lower(trim(NEW.invited_email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_invited_email ON public.trip_invitations;
CREATE TRIGGER normalize_invited_email
BEFORE INSERT OR UPDATE OF invited_email ON public.trip_invitations
FOR EACH ROW EXECUTE FUNCTION public.normalize_invited_email();

-- Update invitation policies to compare emails case-insensitively
ALTER POLICY "Members can view invitations" ON public.trip_invitations
USING (
  public.is_trip_member(auth.uid(), trip_id)
  OR lower(invited_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
);

ALTER POLICY "Admins can update invitations" ON public.trip_invitations
USING (
  public.is_trip_admin(auth.uid(), trip_id)
  OR lower(invited_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Allow invited users to join a trip when they accept an invitation
CREATE POLICY "Invited users can join trip"
ON public.trip_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'member'
  AND EXISTS (
    SELECT 1
    FROM public.trip_invitations ti
    WHERE ti.trip_id = trip_members.trip_id
      AND lower(ti.invited_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
      AND ti.status IN ('pending', 'accepted')
  )
);

-- Update invitation notification trigger to be case-insensitive
CREATE OR REPLACE FUNCTION public.on_invitation_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trip_title TEXT;
  inviter_name TEXT;
  invited_user_id UUID;
BEGIN
  SELECT title INTO trip_title FROM public.trips WHERE id = NEW.trip_id;
  SELECT COALESCE(full_name, 'Un utente') INTO inviter_name
  FROM public.profiles WHERE user_id = NEW.invited_by;

  SELECT id INTO invited_user_id
  FROM auth.users
  WHERE lower(email) = lower(NEW.invited_email);

  IF invited_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, trip_id, type, title, message, link)
    VALUES (
      invited_user_id,
      NEW.trip_id,
      'invitation',
      'Nuovo invito al viaggio',
      format('%s ti ha invitato al viaggio "%s"', inviter_name, trip_title),
      '/trips'
    );
  END IF;

  RETURN NEW;
END;
$$;
