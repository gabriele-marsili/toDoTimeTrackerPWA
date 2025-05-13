import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyD0iZyzMT-SZC1KPmJxIQjBXg5kjWOKhME",
    authDomain: "ttt-webapp-unipi.firebaseapp.com",
    projectId: "ttt-webapp-unipi",
    storageBucket: "ttt-webapp-unipi.firebasestorage.app",
    messagingSenderId: "395315852092",
    appId: "1:395315852092:web:e4dbb16746b56816f7e439",
    measurementId: "G-F7V5FT5TC8"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const messaging = getMessaging(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting firebase persistence:\n", error);
});

const db = initializeFirestore(app, { //uso di persistenza multi tab
    localCache : persistentLocalCache(
        {tabManager : persistentMultipleTabManager()}
    )
});

let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== 'undefined') {

  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { auth, db, analytics, messaging };
