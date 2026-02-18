import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export type UnsupportedReason = "https_required" | "browser_unsupported" | "sw_failed" | null;

export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [unsupportedReason, setUnsupportedReason] = useState<UnsupportedReason>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Check support and current status
  useEffect(() => {
    const checkSupport = async () => {
      // 1. Check for secure context first (HTTPS or localhost)
      const isSecureContext = window.isSecureContext;
      const hasServiceWorker = "serviceWorker" in navigator;
      const hasPushManager = "PushManager" in window;
      const hasNotification = "Notification" in window;

      console.log("[VoyageSmart Push] Support check:", {
        isSecureContext,
        hasServiceWorker,
        hasPushManager,
        hasNotification,
        protocol: location.protocol,
        hostname: location.hostname,
      });

      // Non-secure context (HTTP on non-localhost) — APIs won't be available
      if (!isSecureContext) {
        console.warn("[VoyageSmart Push] Not a secure context. Push requires HTTPS or localhost.");
        setUnsupportedReason("https_required");
        setIsSupported(false);
        setLoading(false);
        return;
      }

      // Browser doesn't support required APIs
      if (!hasServiceWorker || !hasPushManager || !hasNotification) {
        console.warn("[VoyageSmart Push] Browser missing APIs:", {
          hasServiceWorker,
          hasPushManager,
          hasNotification,
        });
        setUnsupportedReason("browser_unsupported");
        setIsSupported(false);
        setLoading(false);
        return;
      }

      // 2. Ensure service worker is registered
      try {
        let registration = await navigator.serviceWorker.getRegistration("/");
        if (!registration) {
          console.log("[VoyageSmart Push] Registering service worker...");
          registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          console.log("[VoyageSmart Push] SW registered:", registration);
        }
      } catch (error) {
        console.error("[VoyageSmart Push] SW registration failed:", error);
        setUnsupportedReason("sw_failed");
        setIsSupported(false);
        setLoading(false);
        return;
      }

      // 3. Wait for SW to be ready (with timeout to avoid hanging forever)
      try {
        const readyPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 8000)
        );
        const readyRegistration = await Promise.race([readyPromise, timeoutPromise]);

        if (!readyRegistration) {
          console.warn("[VoyageSmart Push] SW ready timed out after 8s");
          // Still mark as supported — SW might activate later
        }

        setIsSupported(true);
        setPermission(Notification.permission);

        if (readyRegistration) {
          const sub = await (readyRegistration as ServiceWorkerRegistration).pushManager.getSubscription();
          setSubscription(sub);
        }
      } catch (error) {
        console.error("[VoyageSmart Push] Error checking push subscription:", error);
        // APIs exist, so still mark as supported
        setIsSupported(true);
        setPermission(Notification.permission);
      }

      setLoading(false);
    };

    checkSupport();
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!isSupported || !user) return;

    try {
      setLoading(true);
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        throw new Error("Permesso notifiche negato");
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Save to Supabase
      const { error } = await supabase
        .from("user_push_subscriptions")
        .upsert({
          user_id: user.id,
          subscription_json: JSON.parse(JSON.stringify(pushSubscription)),
          platform: "web",
        }, {
          onConflict: "user_id, subscription_json"
        });

      if (error) throw error;

      setSubscription(pushSubscription);
      toast({
        title: "Notifiche attivate",
        description: "Riceverai aggiornamenti in tempo reale sui tuoi viaggi.",
      });
    } catch (error: any) {
      console.error("Push subscription error:", error);
      toast({
        title: "Errore attivazione",
        description: error.message || "Impossibile attivare le notifiche push.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription || !user) return;

    try {
      setLoading(true);
      
      const subData = JSON.parse(JSON.stringify(subscription));
      
      // Remove from Supabase first - using containment operator for JSONB
      const { error } = await supabase
        .from("user_push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .filter("subscription_json->>endpoint", "eq", subData.endpoint);

      if (error) throw error;

      // Unsubscribe from Push Manager
      await subscription.unsubscribe();
      setSubscription(null);
      
      toast({
        title: "Notifiche disattivate",
        description: "Non riceverai più notifiche push su questo dispositivo.",
      });
    } catch (error: any) {
      console.error("Push unsubscription error:", error);
      toast({
        title: "Errore disattivazione",
        description: error.message || "Impossibile disattivare le notifiche push.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    unsupportedReason,
    permission,
    subscription,
    loading,
    subscribe,
    unsubscribe,
  };
}
