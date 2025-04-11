import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
const firebaseConfig = {
    apiKey: "AIzaSyD0iZyzMT-SZC1KPmJxIQjBXg5kjWOKhME",
    authDomain: "ttt-webapp-unipi.firebaseapp.com",
    projectId: "ttt-webapp-unipi",
    storageBucket: "ttt-webapp-unipi.firebasestorage.app",
    messagingSenderId: "395315852092",
    appId: "1:395315852092:web:e4dbb16746b56816f7e439",
    measurementId: "G-F7V5FT5TC8"
};
// Per testare la modalità offline manualmente (da usare solo per test)
// disableNetwork(db)
// Per riabilitare la rete dopo il test
// enableNetwork(db)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
let analytics = null;
if (typeof window !== 'undefined') {
    // siamo nel browser
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}
export { auth, db, analytics };
