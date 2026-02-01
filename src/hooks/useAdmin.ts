import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PromoCodeType = Database["public"]["Enums"]["promo_code_type"];

export interface AdminPromoCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: PromoCodeType;
  trial_days: number | null;
  discount_percent: number | null;
  lifetime_pro: boolean;
  max_total_uses: number | null;
  current_uses: number;
  max_uses_per_user: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  notes: string | null;
  usage_percentage: number | null;
}

export interface AdminPromoRedemption {
  id: string;
  user_id: string;
  user_email: string;
  user_fullname: string | null;
  promo_code: string;
  promo_code_name: string;
  redeemed_at: string;
  ip_address: string | null;
  trial_ends_at: string | null;
  discount_applied: number | null;
}

export interface PromoCodesStats {
  total_codes: number;
  active_codes: number;
  total_redemptions: number;
  redemptions_last_7_days: number;
  redemptions_last_30_days: number;
  top_codes: Array<{
    code: string;
    name: string;
    current_uses: number;
  }>;
}

export interface CreatePromoCodeInput {
  code: string;
  name: string;
  type: PromoCodeType;
  trial_days?: number | null;
  discount_percent?: number | null;
  lifetime_pro?: boolean;
  max_total_uses?: number | null;
  max_uses_per_user?: number;
  expires_at?: string | null;
  description?: string | null;
  notes?: string | null;
}

export interface UpdatePromoCodeInput {
  id: string;
  name?: string | null;
  description?: string | null;
  max_total_uses?: number | null;
  expires_at?: string | null;
  is_active?: boolean | null;
  notes?: string | null;
}

export function useAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is admin
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc("is_admin");
      
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      return data === true;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get all promo codes (admin only)
  const { 
    data: promoCodes, 
    isLoading: promoCodesLoading,
    refetch: refetchPromoCodes 
  } = useQuery({
    queryKey: ["adminPromoCodes"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_promo_codes");
      
      if (error) {
        throw new Error(error.message);
      }
      
      return (data || []) as AdminPromoCode[];
    },
    enabled: isAdmin === true,
  });

  // Get promo redemptions (admin only)
  const { 
    data: promoRedemptions, 
    isLoading: promoRedemptionsLoading,
    refetch: refetchRedemptions 
  } = useQuery({
    queryKey: ["adminPromoRedemptions"],
    queryFn: async () => {
      // Pass empty object - Supabase will use the DEFAULT NULL from the function
      const { data, error } = await supabase.rpc("get_admin_promo_redemptions", {});
      
      if (error) {
        console.error("Error fetching redemptions:", error);
        throw new Error(error.message);
      }
      
      console.log("Fetched redemptions:", data);
      return (data || []) as AdminPromoRedemption[];
    },
    enabled: isAdmin === true,
  });

  // Get promo codes stats (admin only)
  const { 
    data: promoStats, 
    isLoading: promoStatsLoading,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ["adminPromoStats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_promo_codes_stats");
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as unknown as PromoCodesStats;
    },
    enabled: isAdmin === true,
  });

  // Create promo code mutation
  const createPromoCodeMutation = useMutation({
    mutationFn: async (input: CreatePromoCodeInput) => {
      const { data, error } = await supabase.rpc("create_promo_code", {
        p_code: input.code,
        p_name: input.name,
        p_type: input.type,
        p_trial_days: input.trial_days ?? null,
        p_discount_percent: input.discount_percent ?? null,
        p_lifetime_pro: input.lifetime_pro ?? false,
        p_max_total_uses: input.max_total_uses ?? null,
        p_max_uses_per_user: input.max_uses_per_user ?? 1,
        p_expires_at: input.expires_at ?? null,
        p_description: input.description ?? null,
        p_notes: input.notes ?? null,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const result = data as { success: boolean; code_id?: string; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || "Errore sconosciuto durante la creazione del codice");
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPromoCodes"] });
      queryClient.invalidateQueries({ queryKey: ["adminPromoStats"] });
      toast.success("Codice promozionale creato con successo");
    },
    onError: (error: Error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  // Update promo code mutation
  const updatePromoCodeMutation = useMutation({
    mutationFn: async (input: UpdatePromoCodeInput) => {
      const { data, error } = await supabase.rpc("update_promo_code", {
        p_id: input.id,
        p_name: input.name ?? null,
        p_description: input.description ?? null,
        p_max_total_uses: input.max_total_uses ?? null,
        p_expires_at: input.expires_at ?? null,
        p_is_active: input.is_active ?? null,
        p_notes: input.notes ?? null,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || "Errore sconosciuto durante l'aggiornamento del codice");
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPromoCodes"] });
      queryClient.invalidateQueries({ queryKey: ["adminPromoStats"] });
      toast.success("Codice promozionale aggiornato con successo");
    },
    onError: (error: Error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  // Delete promo code mutation
  const deletePromoCodeMutation = useMutation({
    mutationFn: async (codeId: string) => {
      const { data, error } = await supabase.rpc("delete_promo_code", {
        p_id: codeId,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || "Errore sconosciuto durante l'eliminazione del codice");
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPromoCodes"] });
      queryClient.invalidateQueries({ queryKey: ["adminPromoStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminPromoRedemptions"] });
      toast.success("Codice promozionale eliminato con successo");
    },
    onError: (error: Error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  // Revoke a promo redemption (admin only)
  const revokePromoRedemptionMutation = useMutation({
    mutationFn: async (redemptionId: string) => {
      const { data, error } = await supabase.rpc("revoke_promo_redemption", {
        p_redemption_id: redemptionId,
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        throw new Error(result.error || result.message || "Errore sconosciuto durante la revoca");
      }

      return result;
    },
    onSuccess: (result: { message?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["adminPromoCodes"] });
      queryClient.invalidateQueries({ queryKey: ["adminPromoStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminPromoRedemptions"] });
      toast.success(result.message || "Riscatto revocato con successo");
    },
    onError: (error: Error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  // Get redemptions for a specific code
  const getRedemptionsForCode = async (codeId: string): Promise<AdminPromoRedemption[]> => {
    console.log(`[getRedemptionsForCode] Fetching redemptions for code ID: ${codeId}`);
    
    // Try RPC function first
    const { data, error } = await supabase.rpc("get_admin_promo_redemptions", {
      p_code_id: codeId,
    });
    
    console.log(`[getRedemptionsForCode] RPC Response:`, { data, error });
    
    if (error) {
      console.error(`[getRedemptionsForCode] RPC Error:`, error);
      
      // Fallback: query the redemptions table directly
      console.log(`[getRedemptionsForCode] Trying direct query fallback...`);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("promo_code_redemptions")
        .select(`
          id,
          user_id,
          redeemed_at,
          ip_address,
          trial_ends_at,
          discount_applied,
          promo_codes!inner(code, name)
        `)
        .eq("promo_code_id", codeId)
        .order("redeemed_at", { ascending: false });
      
      console.log(`[getRedemptionsForCode] Fallback Response:`, { fallbackData, fallbackError });
      
      if (fallbackError) {
        throw new Error(fallbackError.message);
      }
      
      // Transform fallback data to match expected format
      return (fallbackData || []).map((r: { id: string; user_id: string; redeemed_at: string; ip_address: string | null; trial_ends_at: string | null; discount_applied: number | null; promo_codes: { code: string; name: string } }) => ({
        id: r.id,
        user_id: r.user_id,
        user_email: r.user_id, // Will show user_id as email in fallback
        user_fullname: null,
        promo_code: r.promo_codes?.code || '',
        promo_code_name: r.promo_codes?.name || '',
        redeemed_at: r.redeemed_at,
        ip_address: r.ip_address,
        trial_ends_at: r.trial_ends_at,
        discount_applied: r.discount_applied,
      })) as AdminPromoRedemption[];
    }
    
    const result = (data || []) as AdminPromoRedemption[];
    console.log(`[getRedemptionsForCode] Parsed result (${result.length} items):`, result);
    return result;
  };

  return {
    // Admin status
    isAdmin: isAdmin ?? false,
    isAdminLoading,
    
    // Promo codes
    promoCodes: promoCodes ?? [],
    promoCodesLoading,
    refetchPromoCodes,
    
    // Redemptions
    promoRedemptions: promoRedemptions ?? [],
    promoRedemptionsLoading,
    refetchRedemptions,
    getRedemptionsForCode,
    
    // Stats
    promoStats,
    promoStatsLoading,
    refetchStats,
    
    // Mutations
    createPromoCode: createPromoCodeMutation.mutate,
    createPromoCodeAsync: createPromoCodeMutation.mutateAsync,
    isCreatingPromoCode: createPromoCodeMutation.isPending,
    
    updatePromoCode: updatePromoCodeMutation.mutate,
    updatePromoCodeAsync: updatePromoCodeMutation.mutateAsync,
    isUpdatingPromoCode: updatePromoCodeMutation.isPending,
    
    deletePromoCode: deletePromoCodeMutation.mutate,
    deletePromoCodeAsync: deletePromoCodeMutation.mutateAsync,
    isDeletingPromoCode: deletePromoCodeMutation.isPending,

    revokePromoRedemption: revokePromoRedemptionMutation.mutate,
    revokePromoRedemptionAsync: revokePromoRedemptionMutation.mutateAsync,
    isRevokingPromoRedemption: revokePromoRedemptionMutation.isPending,
  };
}
