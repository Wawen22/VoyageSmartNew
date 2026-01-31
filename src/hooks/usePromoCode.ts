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
   * Uses the secure Edge Function with rate limiting
   */
  const redeemCode = async (code: string): Promise<RedemptionResult> => {
    if (!code.trim()) {
      return { success: false, error: "EMPTY_CODE", message: "Inserisci un codice." };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("redeem-promo-code", {
        body: { code: code.trim() },
      });

      if (fnError) {
        // Handle HTTP errors
        const errorMessage = fnError.message || "Errore durante la redenzione del codice.";
        setError(errorMessage);
        return { success: false, error: "FUNCTION_ERROR", message: errorMessage };
      }

      if (data?.success) {
        // Refresh profile to get updated subscription status
        await refreshProfile();
      }

      if (!data?.success && data?.error) {
        setError(data.message);
      }

      return data as RedemptionResult;
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
