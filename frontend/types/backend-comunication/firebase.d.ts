import { getAnalytics } from "firebase/analytics";
declare const auth: import("@firebase/auth").Auth;
declare const db: import("@firebase/firestore").Firestore;
declare let analytics: ReturnType<typeof getAnalytics> | null;
export { auth, db, analytics };
