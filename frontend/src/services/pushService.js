import API from "./api";

/**
 * Convert a base64 VAPID public key to a Uint8Array
 * (required by the browser's pushManager.subscribe)
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * Register the service worker (must be called once on app load)
 */
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers not supported in this browser.");
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("✅ Service Worker registered");
    return registration;
  } catch (err) {
    console.error("❌ Service Worker registration failed:", err);
    return null;
  }
}

/**
 * Subscribe the browser to push notifications
 * Sends the subscription to the backend to be stored
 */
export async function subscribeToPush() {
  if (!("Notification" in window)) {
    throw new Error("This browser does not support notifications.");
  }

  // Ask for permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied.");
  }

  // Get the VAPID public key from backend
  const { data } = await API.get("/notifications/vapid-key");
  const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;

  // Subscribe via browser PushManager
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  // Save subscription to backend
  await API.post("/notifications/subscribe", { subscription });

  return subscription;
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return;

  // Tell backend to remove it
  await API.delete("/notifications/unsubscribe", {
    data: { endpoint: subscription.endpoint },
  });

  // Unsubscribe in browser
  await subscription.unsubscribe();
}

/**
 * Check if the current browser is already subscribed
 */
export async function isSubscribed() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const registration  = await navigator.serviceWorker.ready;
  const subscription  = await registration.pushManager.getSubscription();
  return !!subscription;
}