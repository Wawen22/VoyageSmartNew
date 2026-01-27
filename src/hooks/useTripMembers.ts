import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type TripMemberRole = "owner" | "admin" | "member";
export type InvitationStatus = "pending" | "accepted" | "declined";

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripMemberRole;
  joined_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface TripInvitation {
  id: string;
  trip_id: string;
  invited_email: string;
  invited_by: string;
  status: InvitationStatus;
  created_at: string;
  responded_at: string | null;
}

export function useTripMembers(tripId: string | undefined) {
  const [members, setMembers] = useState<TripMember[]>([]);
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    if (!tripId) return;
    
    try {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from("trip_members")
        .select("*")
        .eq("trip_id", tripId);

      if (membersError) throw membersError;

      // Fetch profiles for each member
      const membersWithProfiles = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", member.user_id)
            .maybeSingle();

          return {
            ...member,
            role: member.role as TripMemberRole,
            profile: profileData || { full_name: null, avatar_url: null },
          };
        })
      );

      setMembers(membersWithProfiles);

      // Check if current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const currentMember = membersWithProfiles.find(m => m.user_id === user.id);
        setIsAdmin(currentMember?.role === "owner" || currentMember?.role === "admin");
      }

      // Fetch pending invitations
      const { data: invData, error: invError } = await supabase
        .from("trip_invitations")
        .select("*")
        .eq("trip_id", tripId)
        .eq("status", "pending");

      if (invError) throw invError;
      
      setInvitations((invData || []).map(inv => ({
        ...inv,
        status: inv.status as InvitationStatus,
      })));
    } catch (error: any) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!tripId) return;

    const membersChannel = supabase
      .channel(`trip-members-${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_members", filter: `trip_id=eq.${tripId}` },
        () => {
          fetchMembers();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_invitations", filter: `trip_id=eq.${tripId}` },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(membersChannel);
    };
  }, [tripId, fetchMembers]);

  const inviteMember = async (email: string) => {
    if (!tripId) return { success: false };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");

      // Check if already invited
      const existing = invitations.find(i => i.invited_email === email);
      if (existing) {
        toast({
          title: "Già invitato",
          description: "Questo utente ha già un invito in sospeso",
          variant: "destructive",
        });
        return { success: false };
      }

      const { error } = await supabase
        .from("trip_invitations")
        .insert({
          trip_id: tripId,
          invited_email: email,
          invited_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Invito inviato",
        description: `Invito inviato a ${email}`,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error inviting member:", error);
      toast({
        title: "Errore",
        description: "Impossibile inviare l'invito",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("trip_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Invito annullato",
        description: "L'invito è stato annullato",
      });
    } catch (error: any) {
      console.error("Error canceling invitation:", error);
      toast({
        title: "Errore",
        description: "Impossibile annullare l'invito",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("trip_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Membro rimosso",
        description: "Il partecipante è stato rimosso dal viaggio",
      });
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il partecipante",
        variant: "destructive",
      });
    }
  };

  const updateMemberRole = async (memberId: string, role: TripMemberRole) => {
    try {
      const { error } = await supabase
        .from("trip_members")
        .update({ role })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Ruolo aggiornato",
        description: "Il ruolo del partecipante è stato aggiornato",
      });
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ruolo",
        variant: "destructive",
      });
    }
  };

  return {
    members,
    invitations,
    loading,
    isAdmin,
    inviteMember,
    cancelInvitation,
    removeMember,
    updateMemberRole,
    refetch: fetchMembers,
  };
}
