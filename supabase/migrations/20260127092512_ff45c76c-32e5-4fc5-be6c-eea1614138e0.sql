-- Create enum for member roles
CREATE TYPE public.trip_member_role AS ENUM ('owner', 'admin', 'member');

-- Create enum for invitation status
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined');

-- Create trip_members table for collaborators
CREATE TABLE public.trip_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role trip_member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- Create trip_invitations table
CREATE TABLE public.trip_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(trip_id, invited_email)
);

-- Enable RLS
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_invitations ENABLE ROW LEVEL SECURITY;

-- Function to check if user is a trip member
CREATE OR REPLACE FUNCTION public.is_trip_member(_user_id UUID, _trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE user_id = _user_id AND trip_id = _trip_id
  )
$$;

-- Function to check if user is trip owner or admin
CREATE OR REPLACE FUNCTION public.is_trip_admin(_user_id UUID, _trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE user_id = _user_id 
    AND trip_id = _trip_id 
    AND role IN ('owner', 'admin')
  )
$$;

-- RLS policies for trip_members
CREATE POLICY "Members can view trip members"
ON public.trip_members
FOR SELECT
TO authenticated
USING (public.is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Admins can add members"
ON public.trip_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_trip_admin(auth.uid(), trip_id));

CREATE POLICY "Admins can update members"
ON public.trip_members
FOR UPDATE
TO authenticated
USING (public.is_trip_admin(auth.uid(), trip_id));

CREATE POLICY "Admins can remove members"
ON public.trip_members
FOR DELETE
TO authenticated
USING (public.is_trip_admin(auth.uid(), trip_id));

-- RLS policies for trip_invitations
CREATE POLICY "Members can view invitations"
ON public.trip_invitations
FOR SELECT
TO authenticated
USING (
  public.is_trip_member(auth.uid(), trip_id) 
  OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins can create invitations"
ON public.trip_invitations
FOR INSERT
TO authenticated
WITH CHECK (public.is_trip_admin(auth.uid(), trip_id));

CREATE POLICY "Admins can update invitations"
ON public.trip_invitations
FOR UPDATE
TO authenticated
USING (
  public.is_trip_admin(auth.uid(), trip_id)
  OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins can delete invitations"
ON public.trip_invitations
FOR DELETE
TO authenticated
USING (public.is_trip_admin(auth.uid(), trip_id));

-- Update trips RLS to allow members to view
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;

CREATE POLICY "Users can view trips they own or are members of"
ON public.trips
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.is_trip_member(auth.uid(), id)
);

-- Trigger to add owner as first member when trip is created
CREATE OR REPLACE FUNCTION public.add_trip_owner_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trip_members (trip_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_trip_created
AFTER INSERT ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.add_trip_owner_as_member();

-- Enable realtime for members and invitations
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_invitations;