import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PendingInvitation {
  id: string;
  trip_id: string;
  invited_email: string;
  invited_by: string;
  status: string;
  created_at: string;
  trip?: {
    title: string;
    destination: string;
  };
}

export function usePendingInvitations() {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvitations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setLoading(false);
        return;
      }

      const normalizedEmail = user.email.trim().toLowerCase();

      const { data, error } = await supabase
        .from("trip_invitations")
        .select("*, trips:trip_id(title, destination)")
        .eq("invited_email", normalizedEmail)
        .eq("status", "pending");

      if (error) throw error;

      const formattedInvitations = (data || []).map((inv: any) => ({
        ...inv,
        trip: inv.trips,
      }));

      setInvitations(formattedInvitations);
    } catch (error: any) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("pending-invitations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_invitations" },
        () => {
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInvitations]);

  const acceptInvitation = async (invitationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");

      const invitation = invitations.find((i) => i.id === invitationId);
      if (!invitation) throw new Error("Invito non trovato");

      // Update invitation status
      const { error: updateError } = await supabase
        .from("trip_invitations")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      // Add user as member
      const { error: memberError } = await supabase
        .from("trip_members")
        .insert({
          trip_id: invitation.trip_id,
          user_id: user.id,
          role: "member",
        });

      if (memberError) throw memberError;

      toast({
        title: "Invito accettato!",
        description: `Sei stato aggiunto al viaggio "${invitation.trip?.title}"`,
      });

      await fetchInvitations();
      return { success: true };
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Errore",
        description: "Impossibile accettare l'invito",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("trip_invitations")
        .update({ status: "declined", responded_at: new Date().toISOString() })
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Invito rifiutato",
        description: "L'invito è stato rifiutato",
      });

      await fetchInvitations();
      return { success: true };
    } catch (error: any) {
      console.error("Error declining invitation:", error);
      toast({
        title: "Errore",
        description: "Impossibile rifiutare l'invito",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return {
    invitations,
    loading,
    acceptInvitation,
    declineInvitation,
    refetch: fetchInvitations,
  };
}
