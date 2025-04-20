import { User, UserCredential } from "firebase/auth";
import { baseResponse } from "../types/utilityTypes.js";
import { userDBentry } from "../types/userTypes.js";
import { ToDoAction, ToDoObj } from "../engine/toDoEngine.js";
import { CalendarEvent, CalendarObj } from "../engine/calendarEvent.js";
import { TimeTrackerRule, TimeTrackerRuleObj } from "../engine/timeTracker.js";
import { TTT_Notification } from "../engine/notification.js";
/**
 * singleton class to interact with the backend via API
 */
export declare class API_gestor {
    private static instance;
    private API_BASE_URL;
    private JWT_KEY_USERS;
    private JWT_KEY;
    private machineID;
    private keyPair;
    private serverPubKey;
    private keyFilePath;
    private clientECDH;
    private sharedKey;
    private initialized;
    private accessInvalid;
    private auth;
    private db;
    private analytics;
    private user;
    private userCredentials;
    private licenseKey;
    private userEmail;
    private userByDB;
    private firestoreProxy;
    private constructor();
    /**
     * singleton method to get the instance
     * @returns the instance of the API gestor
     */
    static getInstance(): API_gestor;
    private init;
    private checkInit;
    private generateECDHKeyPair;
    /**
     * Load / generate keyPair (pub & private key)
     */
    private loadOrGenerateKeyPair;
    private initDH;
    private encryptKey;
    private encryptMessage;
    private decryptKey;
    private AES_encrypt;
    private arrayBufferToHex;
    private hexToArrayBuffer_2;
    private getMachineID;
    private decryptMessage;
    private decryptMessageToString;
    private base64ToUint8Array;
    private unitArrToBase64;
    private uint8ArrayToUtf8;
    private hexToArrayBuffer;
    private setServerPubKey;
    sendEmail(type: "registration" | "license key reminder" | "delete acc confirmation" | "reset license key", licenseKey: string, username: string, userEmail: string): Promise<baseResponse>;
    registerFCMToken(): Promise<string>;
    /**
     * Add / update a notification in firestore db
     * @param notification TTT notification to add/update
     * @returns
     */
    scheduleNotification(notification: TTT_Notification): Promise<baseResponse>;
    deleteNotification(notification_id: string): Promise<{
        success: boolean;
        errorMessage: any;
    }>;
    checkUniqueEmailAndUsername(email: string, username: string): Promise<baseResponse>;
    updateUserInfo(uInfo: userDBentry): Promise<baseResponse>;
    registerUser(userForm: userDBentry): Promise<baseResponse>;
    loginWithLicenseKey(licenseKey: string): Promise<baseResponse>;
    getUserInfo(): Promise<{
        userInfo: {
            licenseKey: string;
            user: User | null;
            userCredentials: UserCredential | null;
            userEmail: string;
        };
        userInfo_DB: userDBentry;
    }>;
    logOut(): Promise<baseResponse>;
    private checkIfUserExist;
    getUserByEmail(email: string): Promise<{
        success: boolean;
        errorMessage: string;
        data: userDBentry | null;
    }>;
    private resetLKbyServer;
    resetLicenseKey(email: string, lk: string): Promise<{
        success: boolean;
        errorMessage: string;
        newLicenseKey: string;
    }>;
    private getHeader;
    private base64urlEncode;
    private generateJwtToken;
    /**
     * Aggiunge una nuova ToDoAction alla collezione "toDoActions" in Firestore.
     * Se il documento per la licenseKey non esiste, lo crea con un array contenente l'azione.
     * Se esiste, aggiunge l'azione all'array usando arrayUnion.
     *
     * @param licenseKey Identificativo univoco per il documento.
     * @param action L'istanza di ToDoAction da aggiungere.
    */
    addOrUpdateToDoAction(licenseKey: string, action: ToDoAction): Promise<baseResponse>;
    /**
     * Elimina una ToDoAction data la licenseKey e l'id dell'azione.
     * Utilizza arrayRemove per rimuovere l'azione specifica cercando la stringa corrispondente.
     *
     * @param licenseKey Identificativo univoco per il documento.
     * @param actionId Id dell'azione da eliminare.
     */
    removeToDoAction(licenseKey: string, actionId: string): Promise<baseResponse>;
    /**
     * Recupera tutte le ToDoActions relative a una determinata licenseKey.
     * Ritorna un array di oggetti deserializzati.
     *
     * @param licenseKey Identificativo univoco per il documento.
     * @returns Array di oggetti ToDoAction serializzati come JSON.
     */
    getToDoActions(licenseKey: string): Promise<{
        success: boolean;
        errorMessage: string;
        toDoObjects: ToDoObj[];
    }>;
    addOrUpdateCalendarEvent(licenseKey: string, event: CalendarEvent): Promise<baseResponse>;
    removeCalendarEvent(licenseKey: string, eventId: string): Promise<baseResponse>;
    getCalendarEvents(licenseKey: string): Promise<{
        success: boolean;
        errorMessage: string;
        eventObjects: CalendarObj[];
    }>;
    addOrUpdateTimeTrackerRule(licenseKey: string, rule: TimeTrackerRule): Promise<baseResponse>;
    removeTimeTrackerRule(licenseKey: string, ruleId: string): Promise<baseResponse>;
    getTimeTrackerRules(licenseKey: string): Promise<{
        success: boolean;
        errorMessage: string;
        rules: TimeTrackerRuleObj[];
    }>;
}
