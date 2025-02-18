import { initializeApp } from "firebase/app";
const firebaseConfig = {
    apiKey: "TUA_API_KEY",
    authDomain: "TUO_PROGETTO.firebaseapp.com",
    projectId: "TUO_PROJECT_ID",
    storageBucket: "TUO_STORAGE_BUCKET",
    messagingSenderId: "TUO_MESSAGING_SENDER_ID",
    appId: "TUO_APP_ID"
};
const app = initializeApp(firebaseConfig);
export default app;
