// Firebase messaging service worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "undefined",
  authDomain: "undefined",
  projectId: "undefined",
  storageBucket: "undefined",
  messagingSenderId: "undefined",
  appId: "undefined",
  measurementId: "",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title || "New Notification";
  const notificationOptions = {
    body: payload.notification.body || "",
    icon: "/icons/home_service.svg",
    badge: "/icons/home_service.svg",
    data: payload.data || {},
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icons/home_service.svg",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received.");

  event.notification.close();

  if (event.action === "view") {
    // Handle view action
    if (event.notification.data?.action) {
      // Navigate based on action
      const url = new URL("/", self.location.origin);
      url.searchParams.set("action", event.notification.data.action);

      event.waitUntil(clients.openWindow(url));
    } else {
      // Default: open the app
      event.waitUntil(clients.openWindow("/"));
    }
  }
  // Dismiss action - just close the notification (already done above)
});
