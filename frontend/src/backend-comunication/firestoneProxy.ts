import {
    Firestore,
    getDoc,
    getDocFromCache,
    getDocs,
    getDocsFromCache,
    setDoc,
    updateDoc,
    DocumentReference,
    Query,
    QuerySnapshot,
    DocumentData,
    DocumentSnapshot
} from "firebase/firestore";

export class FirestoreProxy {
    private static instance: FirestoreProxy;
    private constructor() { }

    /**
     * singleton method to get the instance
     * @returns the instance of the Firestore proxy
     */
    public static getInstance(): FirestoreProxy {
        if (FirestoreProxy.instance == null) {
            FirestoreProxy.instance = new FirestoreProxy()
        }

        return FirestoreProxy.instance
    }

    async getDocWithNetworkFirst<T>(ref: DocumentReference): Promise<DocumentSnapshot<DocumentData, DocumentData>> {
        try {
            const snapshot = await getDoc(ref);            
            return snapshot;
        } catch (err) {
            const cacheSnapshot = await getDocFromCache(ref);
            return cacheSnapshot
        }
    }

    async getDocsWithNetworkFirst<T>(queryRef: Query): Promise<QuerySnapshot<DocumentData, DocumentData>> {
        try {
            const snapshot = await getDocs(queryRef);
            return snapshot
        } catch (err) {
            //console.warn("getDocs failed, trying cache...", err);
            const cacheSnapshot = await getDocsFromCache(queryRef);
            return cacheSnapshot
        }
    }
}
