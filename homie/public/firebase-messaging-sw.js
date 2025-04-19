importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "homie-f0700.firebaseapp.com",
    projectId: "homie-f0700",
    storageBucket: "homie-f0700.firebasestorage.app",
    messagingSenderId: "909447294038",
    appId: "1:909447294038:web:027a44892fc40146dadff7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Homie SW Message:", payload);

  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: "/Homie-2.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
