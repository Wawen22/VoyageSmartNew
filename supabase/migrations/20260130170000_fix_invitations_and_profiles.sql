-- 1. Make profiles viewable by everyone (essential for social features)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
-- We use a new policy name to ensure we replace the restrictive one
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- 2. Fix trip_invitations policies to use auth.jwt() instead of accessing auth.users table
-- Accessing auth.users in RLS policies causes "permission denied" errors for normal users
DROP POLICY IF EXISTS "Members can view invitations" ON public.trip_invitations;

CREATE POLICY "Members can view invitations"
ON public.trip_invitations
FOR SELECT
TO authenticated
USING (
  public.is_trip_member(auth.uid(), trip_id) 
  OR lower(invited_email) = lower(auth.jwt() ->> 'email')
);

DROP POLICY IF EXISTS "Admins can update invitations" ON public.trip_invitations;

CREATE POLICY "Admins can update invitations"
ON public.trip_invitations
FOR UPDATE
TO authenticated
USING (
  public.is_trip_admin(auth.uid(), trip_id)
  OR lower(invited_email) = lower(auth.jwt() ->> 'email')
);

-- 3. Auto-add user to trip if they exist when invited
CREATE OR REPLACE FUNCTION public.handle_invitation_created()
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
  -- Get trip info
  SELECT title INTO trip_title FROM public.trips WHERE id = NEW.trip_id;
  
  -- Get inviter info
  SELECT COALESCE(full_name, 'Un utente') INTO inviter_name
  FROM public.profiles WHERE user_id = NEW.invited_by;

  -- Find invited user by email (safe in SECURITY DEFINER function)
  SELECT id INTO invited_user_id
  FROM auth.users
  WHERE lower(email) = lower(NEW.invited_email);

  IF invited_user_id IS NOT NULL THEN
    -- Check if already a member
    IF NOT EXISTS (
        SELECT 1 FROM public.trip_members 
        WHERE trip_id = NEW.trip_id AND user_id = invited_user_id
    ) THEN
        -- Add to trip members
        INSERT INTO public.trip_members (trip_id, user_id, role)
        VALUES (NEW.trip_id, invited_user_id, 'member');
        
        -- Mark invitation as accepted
        UPDATE public.trip_invitations 
        SET status = 'accepted', responded_at = now()
        WHERE id = NEW.id;

        -- Send notification (if notifications table exists)
        -- We wrap in a block to ignore error if table doesn't exist, though it should
        BEGIN
          INSERT INTO public.notifications (user_id, trip_id, type, title, message, link)
          VALUES (
            invited_user_id,
            NEW.trip_id,
            'invitation',
            'Sei stato aggiunto a un viaggio!',
            format('%s ti ha aggiunto al viaggio "%s".', inviter_name, trip_title),
            '/trips/' || NEW.trip_id
          );
        EXCEPTION WHEN undefined_table THEN
          -- Ignore if notifications table missing
          NULL;
        END;
    ELSE
         -- Already a member, just mark accepted
         UPDATE public.trip_invitations 
         SET status = 'accepted', responded_at = now()
         WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Replace the trigger
DROP TRIGGER IF EXISTS on_invitation_created ON public.trip_invitations;
DROP TRIGGER IF EXISTS invitation_created ON public.trip_invitations;

CREATE TRIGGER invitation_created
AFTER INSERT ON public.trip_invitations
FOR EACH ROW
EXECUTE FUNCTION public.handle_invitation_created();
