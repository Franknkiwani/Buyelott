// Give this file the exact name: firebase-messaging-sw.js
// Place it in the root of your web server

importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDFHskUWiyHhZke3KT9kkOtFI_gPsKfiGo",
  authDomain: "itzhoyoo-f9f7e.firebaseapp.com",
  projectId: "itzhoyoo-f9f7e",
  messagingSenderId: "1094792075584",
  appId: "1:1094792075584:web:d49e9c3f899d3cd31082a5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Background Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192x192.png' // or just use a direct icon URL
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});