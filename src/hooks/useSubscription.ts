
import { useProfile } from "./useProfile";
import { supabase } from "@/integrations/supabase/client";

export const useSubscription = () => {
  const { profile, loading, refreshProfile } = useProfile();

  const isPro = profile?.is_pro || false;
  const aiUsageCount = profile?.ai_usage_count || 0;
  const FREE_LIMIT = 5;
  const isLimitReached = !isPro && aiUsageCount >= FREE_LIMIT;
  const remainingMessages = Math.max(0, FREE_LIMIT - aiUsageCount);
  
  // Promo code subscription info
  const proSource = profile?.pro_source || null;
  const isPromoSubscription = proSource === 'promo_code';
  const trialEndsAt = profile?.trial_ends_at || null;

  const incrementUsage = async () => {
    if (!profile?.user_id) return;
    await supabase.rpc('increment_ai_usage', { p_user_id: profile.user_id });
    await refreshProfile();
  };

  const subscribe = async (priceId?: string) => {
    try {
      const resolvedPriceId =
        priceId || import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID;
      if (!resolvedPriceId) {
        throw new Error("Missing Stripe price id");
      }

      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            priceId: resolvedPriceId,
            successUrl: window.location.origin + "/profile?success=true",
            cancelUrl: window.location.origin + "/trips",
          },
        }
      );

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      console.error("Subscription error:", error);
      throw error;
    }
  };

  const manageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: window.location.href },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      console.error("Manage subscription error:", error);
      throw error;
    }
  };

  return {
    isPro,
    aiUsageCount,
    isLimitReached,
    remainingMessages,
    incrementUsage,
    subscribe,
    manageSubscription,
    loading,
    // Promo code info
    proSource,
    isPromoSubscription,
    trialEndsAt,
  };
};
