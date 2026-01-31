import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export interface RedemptionResult {
  success: boolean;
  error?: string;
  message: string;
  type?: "trial" | "subscription" | "lifetime" | "discount";
  benefit?: string;
  trial_ends_at?: string;
  discount_percent?: number;
  retryAfter?: number;
}

export interface UserRedemption {
  id: string;
  code_name: string;
  code_type: "trial" | "subscription" | "lifetime" | "discount";
  redeemed_at: string;
  trial_ends_at: string | null;
  discount_applied: number | null;
  benefit: string;
}

export const usePromoCode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshProfile } = useProfile();

  /**
   * Redeem a promo code
   * Uses the secure database function with server-side validation
   */
  const redeemCode = async (code: string): Promise<RedemptionResult> => {
    if (!code.trim()) {
      return { success: false, error: "EMPTY_CODE", message: "Inserisci un codice." };
    }

    setLoading(true);
    setError(null);

    try {
      // Call the database function directly via RPC
      const { data, error: rpcError } = await supabase.rpc("redeem_promo_code", {
        p_code: code.trim(),
        p_ip_address: null,
        p_user_agent: navigator.userAgent || null,
      });

      if (rpcError) {
        // Handle RPC errors
        const errorMessage = rpcError.message || "Errore durante la redenzione del codice.";
        setError(errorMessage);
        return { success: false, error: "RPC_ERROR", message: errorMessage };
      }

      // Parse the JSON result from the function
      const result = data as unknown as RedemptionResult;

      if (result?.success) {
        // Refresh profile to get updated subscription status
        await refreshProfile();
      }

      if (!result?.success && result?.error) {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore imprevisto.";
      setError(errorMessage);
      return { success: false, error: "UNKNOWN_ERROR", message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user's redemption history
   * Uses the secure database function
   */
  const getRedemptionHistory = async (): Promise<UserRedemption[]> => {
    try {
      const { data, error: rpcError } = await supabase.rpc("get_user_redemptions");

      if (rpcError) {
        console.error("Error fetching redemption history:", rpcError);
        return [];
      }

      return (data || []) as UserRedemption[];
    } catch (err) {
      console.error("Error fetching redemption history:", err);
      return [];
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => setError(null);

  return {
    redeemCode,
    getRedemptionHistory,
    loading,
    error,
    clearError,
  };
};
