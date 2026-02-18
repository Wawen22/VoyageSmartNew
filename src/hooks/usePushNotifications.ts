import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Check support and current status
  useEffect(() => {
    const checkSupport = async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        
        try {
          const registration = await navigator.serviceWorker.ready;
          const sub = await registration.pushManager.getSubscription();
          setSubscription(sub);
        } catch (error) {
          console.error("Error checking push subscription:", error);
        }
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
    permission,
    subscription,
    loading,
    subscribe,
    unsubscribe,
  };
}
