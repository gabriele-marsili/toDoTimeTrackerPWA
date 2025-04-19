import { DocumentReference, Query, QuerySnapshot, DocumentData, DocumentSnapshot } from "firebase/firestore";
export declare class FirestoreProxy {
    private static instance;
    private constructor();
    /**
     * singleton method to get the instance
     * @returns the instance of the Firestore proxy
     */
    static getInstance(): FirestoreProxy;
    getDocWithNetworkFirst<T>(ref: DocumentReference): Promise<DocumentSnapshot<DocumentData, DocumentData>>;
    getDocsWithNetworkFirst<T>(queryRef: Query): Promise<QuerySnapshot<DocumentData, DocumentData>>;
}
