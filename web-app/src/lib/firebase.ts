import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig } from "@/config/firebase-config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize messaging on the client side
let messaging: any = null;

if (typeof window !== "undefined") {
  try {
    // Check if the browser supports the required APIs
    if ("serviceWorker" in navigator && "PushManager" in window) {
      messaging = getMessaging(app);
    } else {
      console.warn(
        "Firebase messaging not supported: Service Worker or Push Manager not available"
      );
    }
  } catch (error) {
    console.warn("Firebase messaging initialization failed:", error);
  }
}

export { messaging, getToken, onMessage };
