importScripts('https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey: 'AIzaSyDLNoIRcizSIMSJCxc4uvHSkNr3ikpEQj4',
  authDomain: 'uplife-notification-fbase.firebaseapp.com',
  projectId: 'uplife-notification-fbase',
  storageBucket: 'uplife-notification-fbase.firebasestorage.app',
  messagingSenderId: '104298671348',
  appId: '1:104298671348:web:0200eac006a321066702a1',
  measurementId: 'G-JK41XXYER4'
});
const messaging = firebase.messaging();
