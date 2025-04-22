import { Analytics } from "firebase/analytics";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword, User, UserCredential, onAuthStateChanged } from "firebase/auth";
import { arrayRemove, collection, doc, Firestore, query, setDoc, updateDoc, where } from "firebase/firestore";
import { analytics, auth, db, messaging } from "./firebase.js";
import { delay, generateLicenseKey, getDeviceId, hashPassword, MAIN_LOGO_URL, parseActionDates, VAPID_PUB_KEY } from "../utils/generalUtils.js";
import { baseResponse, firestoneDate } from "../types/utilityTypes.js";
import sodium from 'libsodium-wrappers';
import { userDBentry } from "../types/userTypes.js";
import { ToDoAction, ToDoObj } from "../engine/toDoEngine.js";
import { CalendarEvent, CalendarObj } from "../engine/calendarEvent.js";
import { TimeTrackerRule, TimeTrackerRuleObj } from "../engine/timeTracker.js";
import { FirestoreProxy } from "./firestoneProxy.js";
import { getToken } from "firebase/messaging";
import { notificationDocData, requestNotifyPermission, TTT_Notification } from "../engine/notification.js";


type InitDHresponse = {
    success: boolean,
    errorMessage: string,
    publicKey?: string | undefined
}

/**
 * singleton class to interact with the backend via API
 */
export class API_gestor {
    private static instance: API_gestor;

    private API_BASE_URL!: string;
    private JWT_KEY_USERS!: string;
    private JWT_KEY!: string;
    private machineID!: string;

    private keyPair!: { publicKey: Uint8Array; privateKey: Uint8Array };
    private serverPubKey!: Uint8Array
    private keyFilePath!: string;
    private clientECDH!: CryptoKeyPair;
    private sharedKey!: string
    private initialized: boolean
    private accessInvalid: boolean = false;


    private auth: Auth
    private db: Firestore
    private analytics: Analytics | null;
    private user: User | null = null;
    private userCredentials: UserCredential | null = null;
    private licenseKey: string;
    private userEmail: string
    private userByDB!: userDBentry;
    private firestoreProxy: FirestoreProxy

    private constructor() {

        this.auth = auth;
        this.db = db;
        this.analytics = analytics;
        this.licenseKey = ""
        this.userEmail = ""
        this.initialized = false;
        this.firestoreProxy = FirestoreProxy.getInstance()

        // Iscriviti al listener di stato di autenticazione
        onAuthStateChanged(auth, async (user: User | null) => {
            this.user = user;
            console.log("auth state updated, new user:\n", user);
            //retrive user db datas by user email
            if (this.user && this.user.email) {
                const res = await this.getUserByEmail(this.user.email)
                if (res.success && res.data) {
                    this.userByDB = res.data;
                    await this.registerFCMToken()
                }
            }
        });

    }

    /**
     * singleton method to get the instance
     * @returns the instance of the API gestor
     */
    public static getInstance(): API_gestor {
        if (API_gestor.instance == null) {
            API_gestor.instance = new API_gestor()
        }

        return API_gestor.instance
    }

    // --- init methods :

    private async init() {

        this.machineID = "";
        this.API_BASE_URL = "http://localhost:3042" // to do : spostare da qui
        this.JWT_KEY_USERS = "jU(TTT-app)%8/*+-.-+*![00]"
        this.JWT_KEY = "jwtTTT-%42-=ç-%42°?!372-1092-947019-[[[]-T-È€-à>"
        console.log("API_BASE_URL = ", this.API_BASE_URL)
        console.log("JWT_KEY_USERS = ", this.JWT_KEY_USERS)
        console.log("JWT_KEY = ", this.JWT_KEY)
        this.keyFilePath = "./keyFile.json"
        this.clientECDH = await this.generateECDHKeyPair()
        console.log("ecdh creato : ", this.clientECDH)



        await sodium.ready;
        console.log("sodium ready")
        await this.loadOrGenerateKeyPair();
        await this.initDH()
        console.log("\nDH completed\n")
        await this.setServerPubKey()
        console.log("\n\nserver pubkey setted :", this.serverPubKey)
        this.initialized = true
    }

    private async checkInit() {
        if (!this.initialized) {
            await this.init()
            if (!this.initialized) {
                throw new Error("Server API not fully initialized")
            }
        }

        if (this.accessInvalid) {
            throw new Error("invalid token or license-key")
        }
    }

    private async generateECDHKeyPair() {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-256", // "prime256v1" in OpenSSL è "P-256" nel Web Crypto API
            },
            true, // Può essere esportata
            ["deriveKey", "deriveBits"]
        );

        return keyPair;
    }


    /**
     * Load / generate keyPair (pub & private key)
     */
    private async loadOrGenerateKeyPair() {
        const mId = await this.getMachineID();

        // Accedi a IndexedDB
        const dbRequest = indexedDB.open("KeyPairDB", 2);

        dbRequest.onupgradeneeded = (event) => {
            const db = (event.target as IDBRequest).result;

            if (!db.objectStoreNames.contains("keys")) {
                db.createObjectStore("keys"); // Creazione dello store se non esiste
            }
        };

        dbRequest.onerror = (e) => {
            console.error("Errore nell'aprire IndexedDB", e);
        };

        dbRequest.onsuccess = async (e) => {
            const db = dbRequest.result;

            // Crea la transazione e accedi allo store
            const transaction = db.transaction(["keys"], "readwrite");
            const store = transaction.objectStore("keys");

            // Ottieni i dati dalla IndexedDB
            const getRequest = store.get(this.keyFilePath);

            getRequest.onerror = (event) => {
                console.error("Errore nel recupero dei dati dalla IndexedDB", event);
            };

            getRequest.onsuccess = async (event) => {
                const data = getRequest.result; // I dati recuperati
                console.log("data:\n", data)
                if (data) {
                    const encryptedKeyData = data;
                    const decryptedPubKey = await this.decryptKey(encryptedKeyData.publicKey, mId);
                    const decryptedPrivateKey = await this.decryptKey(encryptedKeyData.privateKey, mId);

                    this.keyPair = {
                        privateKey: decryptedPrivateKey,
                        publicKey: decryptedPubKey
                    };
                } else {
                    // Genera la coppia di chiavi
                    const password = this.licenseKey + mId;
                    const hashedPassword = await hashPassword(password);
                    this.keyPair = sodium.crypto_box_seed_keypair(hashedPassword);

                    const encryptedPrivateKey = await this.encryptKey(this.keyPair.privateKey, mId);
                    const encryptedPublicKey = await this.encryptKey(this.keyPair.publicKey, mId);

                    const d = {
                        publicKey: encryptedPublicKey,
                        privateKey: encryptedPrivateKey,
                    };
                    console.log("key pair (encrypted):\n", d)
                    // Apri una nuova transazione per salvare i dati
                    const newTransaction = db.transaction(["keys"], "readwrite");
                    const newStore = newTransaction.objectStore("keys");
                    const putRequest = newStore.put(d, this.keyFilePath);
                    putRequest.onerror = (event) => {
                        console.error("Errore nel salvataggio dei dati nella IndexedDB", event);
                    };
                    putRequest.onsuccess = () => {
                        console.log("Coppia di chiavi salvata con successo");
                    };
                }
            };
        };
    }



    private async initDH() {
        try {
            const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", this.clientECDH.publicKey);
            //conversione in formato hex (string)
            const publicKeyHex = this.arrayBufferToHex(publicKeyBuffer);
            console.log("pub key (client) hex : ", publicKeyHex)
            const reqUrl: string = `${this.API_BASE_URL}/DH?type=user`
            const mId = await this.getMachineID()

            const options: any = {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicKey: publicKeyHex, machineId: mId })
            };

            const response = await fetch(reqUrl, options);
            console.log(`response by API init DH:\n`, response)
            const responseData = await response.json() as InitDHresponse;
            console.log(`responseData by API init dh:\n`, responseData)


            if (response.ok && responseData.success && responseData.publicKey) {
                console.log("key by server : ", responseData.publicKey)
                const serverPublicKey = await window.crypto.subtle.importKey(
                    "raw",
                    this.hexToArrayBuffer(responseData.publicKey),
                    {
                        name: "ECDH",
                        namedCurve: "P-256"
                    },
                    false,
                    []
                );

                // Deriva i 256 bit della shared secret
                const sharedSecretBits = await window.crypto.subtle.deriveBits(
                    { name: "ECDH", public: serverPublicKey },
                    this.clientECDH.privateKey,
                    256
                );

                // Calcola l'hash SHA-256 per ottenere la shared key, come fatto sul server
                const sharedKeyBuffer = await window.crypto.subtle.digest("SHA-256", sharedSecretBits);
                // Converti in hex per verificare
                const sharedKeyHex = this.arrayBufferToHex(sharedKeyBuffer);
                console.log("Shared key (client, hex):", sharedKeyHex);
                this.sharedKey = sharedKeyHex;

            } else {
                throw new Error(responseData.errorMessage)
            }
        } catch (error: any) {
            console.log("error in init DH:\n", error);
            throw new Error("an error occured in init DH")
        }
    }

    // --- security : 
    private async encryptKey(data: Uint8Array, password: string): Promise<{
        nonce: string,
        encrypted: string
    }> {
        const key = await hashPassword(password)
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES); // Genera un nonce casuale di 24 byte

        const encrypted = sodium.crypto_secretbox_easy(data, nonce, key);

        return {
            nonce: this.unitArrToBase64(nonce),
            encrypted: this.unitArrToBase64(encrypted)
        };
    }

    private encryptMessage(message: string): string {
        // Il risultato è un Uint8Array
        const sealed = sodium.crypto_box_seal(message, this.serverPubKey);
        return this.unitArrToBase64(sealed);
    }


    private async decryptKey(data: { nonce: string, encrypted: string }, password: string): Promise<Uint8Array> {
        const key = await hashPassword(password);
        const encryptedUint8 = this.base64ToUint8Array(data.encrypted);
        const nonceUint8 = this.base64ToUint8Array(data.nonce);
        return sodium.crypto_secretbox_open_easy(encryptedUint8, nonceUint8, key);
    }


    private async AES_encrypt(key: string, plaintext: string): Promise<{ iv: string; encryptedData: string; authTag: string }> {
        const KeyBuffer = this.hexToArrayBuffer_2(key);

        const CryptoKey = await window.crypto.subtle.importKey(
            "raw",
            KeyBuffer,
            { name: "AES-GCM" },
            false,  // non esportabile
            ["encrypt", "decrypt"]
        );

        // Genera un IV casuale per AES-GCM (12 bytes)
        const iv: Uint8Array = window.crypto.getRandomValues(new Uint8Array(12)); // iv è un Uint8Array, va bene per AES-GCM

        // Converti il plaintext in un ArrayBuffer
        const encoder = new TextEncoder();
        const encodedText = encoder.encode(plaintext);  // encodedText è un Uint8Array

        // Esegui la cifratura
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,  // iv è un Uint8Array
            },
            CryptoKey,
            encodedText
        );

        // Converti il risultato cifrato (ArrayBuffer) in un Uint8Array
        const encryptedArray: Uint8Array = new Uint8Array(encrypted);  // encryptedArray è un Uint8Array, non un Uint8Array<ArrayBuffer>

        // Converti i dati cifrati in formato esadecimale
        const encryptedHex = this.arrayBufferToHex(encryptedArray.buffer as ArrayBuffer);  // Forza il tipo a ArrayBuffer

        // Il tag di autenticazione è l'ultimo byte del ciphertext (AES-GCM)
        const authTag = encryptedHex.slice(-32); // Gli ultimi 16 byte (32 caratteri esadecimali)

        return {
            iv: this.arrayBufferToHex(iv.buffer as ArrayBuffer),  // Forza il tipo a ArrayBuffer
            encryptedData: encryptedHex.slice(0, -32),  // Dati cifrati (senza il tag)
            authTag: authTag,
        };
    }

    // Funzione per convertire ArrayBuffer in stringa esadecimale
    private arrayBufferToHex(buffer: ArrayBuffer): string {
        const view = new Uint8Array(buffer);  // La vista Uint8Array dell'ArrayBuffer
        return Array.from(view).map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    private hexToArrayBuffer_2(hex: string) {
        if (hex.length % 2 !== 0) {
            throw new Error("Hex string must have an even number of characters");
        }
        const buffer = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            buffer[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return buffer.buffer;
    }

    private async getMachineID(): Promise<string> {
        if (!this.machineID || this.machineID == "") {
            this.machineID = await getDeviceId();
        }
        return this.machineID
    }

    private decryptMessage(encryptedMessage: string): Uint8Array {
        const encryptedUint8 = this.base64ToUint8Array(encryptedMessage);
        return sodium.crypto_box_seal_open(encryptedUint8, this.keyPair.publicKey, this.keyPair.privateKey);
    }


    private decryptMessageToString(encryptedMessage: string): string {
        const decryptedUint8 = sodium.crypto_box_seal_open(
            this.base64ToUint8Array(encryptedMessage),
            this.keyPair.publicKey,
            this.keyPair.privateKey
        );
        if (!decryptedUint8) {
            throw new Error("Decryption failed");
        }
        return this.uint8ArrayToUtf8(decryptedUint8);
    }

    // Converte una stringa base64 in Uint8Array
    private base64ToUint8Array(base64: string): Uint8Array {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    // Converte un Uint8Array in una stringa base64
    private unitArrToBase64(uint8Array: Uint8Array): string {
        let binary = "";
        for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return window.btoa(binary);
    }

    // Converte un Uint8Array in una stringa UTF-8
    private uint8ArrayToUtf8(uint8Array: Uint8Array): string {
        return new TextDecoder().decode(uint8Array);
    }

    private hexToArrayBuffer(hex: string): ArrayBuffer {
        const buffer = new ArrayBuffer(hex.length / 2);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < hex.length; i += 2) {
            view[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return buffer;
    }

    // --- set server pubkey :
    private async setServerPubKey(): Promise<void> {
        try {
            const reqUrl: string = `${this.API_BASE_URL}/getServerPubKey?type=user`;
            const mId = await this.getMachineID()
            const base64ClientPubkey = this.unitArrToBase64(this.keyPair.publicKey);
            console.log("client pubkey length : ", base64ClientPubkey.length)
            console.log("base64ClientPubkey: ", base64ClientPubkey)
            const options: any = {
                method: 'POST',
                headers: await this.getHeader(this.licenseKey),
                body: JSON.stringify({ clientPubKey: base64ClientPubkey, machineId: mId })
            };

            const response = await fetch(`${reqUrl}`, options);
            console.log(`response by API set ServerPubKey :`, response)

            const responseData: any = await response.json();
            console.log(`responseData set ServerPubKey :`, responseData)

            if ('serverPubKey' in responseData && response.ok) {
                console.log("server pubkey str (base 64, encrypted) = ", responseData.serverPubKey)
                this.serverPubKey = this.decryptMessage(responseData.serverPubKey) //decrypt base 64 to unitArr

                console.log("this.serverPubKey = ", this.serverPubKey)

            } else {
                const e_message = 'error_message' in responseData ? responseData.error_message : ""
                if (e_message == "invalid token or license-key" && response.status == 403) {
                    this.accessInvalid = true;
                }
                throw new Error("request status : " + response.status + "\nErr msg : " + e_message)
            }


        } catch (error: any) {
            console.log("error in get server pubkey", error)

        }
    }

    // --- other methods : 

    public async sendEmail(type: "registration" | "license key reminder" | "delete acc confirmation" | "reset license key", licenseKey: string, username: string, userEmail: string): Promise<baseResponse> {
        try {
            await this.checkInit()
            if (this.licenseKey == "") {
                this.licenseKey = licenseKey;
            }
            let subject = ""
            let htmlEmailBody = ""
            switch (type) {
                case "registration":
                    subject = "Welcome to TTT app - Registration Confirmation";
                    htmlEmailBody = `
                        <h2>Hello ${username},</h2>
                        <p>Thank you for registering with TTT app. Your account has been successfully created.</p>
                        <p>Your license key is:</p>
                        <pre style="font-size:18px; background:#f4f4f4; padding:10px; border-radius:5px;">${licenseKey}</pre>
                        <p>Please use this key to access your account.</p>
                        <br/>
                        <p>Best regards,<br/>TTT app</p>
                    `;
                    break

                case "license key reminder":
                    subject = "TTT app - License Key Reminder";
                    htmlEmailBody = `
                        <h2>Hello ${username},</h2>
                        <p>This is a reminder of your current license key for TTT app:</p>
                        <pre style="font-size:18px; background:#f4f4f4; padding:10px; border-radius:5px;">${licenseKey}</pre>
                        <p>If you have any questions, please contact our support team.</p>
                        <br/>
                        <p>Best regards,<br/>TTT app</p>
                    `;
                    break

                case "delete acc confirmation":
                    subject = "TTT app - Account Deletion Confirmation";
                    htmlEmailBody = `
                        <h2>Hello ${username},</h2>
                        <p>This is to confirm that your account has been successfully deleted from TTT app.</p>
                        <p>We are sorry to see you go and hope to serve you again in the future.</p>
                        <br/>
                        <p>Best regards,<br/>TTT app</p>
                    `;

                    break

                case "reset license key":
                    subject = "TTT app - License Key Reset";
                    htmlEmailBody = `
                        <h2>Hello ${username},</h2>
                        <p>Your license key has been successfully reset.</p>
                        <p>Your new license key is:</p>
                        <pre style="font-size:18px; background:#f4f4f4; padding:10px; border-radius:5px;">${licenseKey}</pre>
                        <p>Please use this new key to access your account.</p>
                        <br/>
                        <p>Best regards,<br/>TTT app</p>
                    `;
                    break

                default:  //@unreachable
                    return {
                        success: false,
                        errorMessage: "unsopported type : " + type
                    };
            }

            const base64PubKey = this.unitArrToBase64(this.keyPair.publicKey)
            const params = { key: this.licenseKey, clientPubkey: base64PubKey, userEmail, subject, htmlEmailBody };
            const plainText = JSON.stringify(params)
            console.log("plain text: ", plainText)
            const encryptedParams = this.encryptMessage(plainText);
            console.log("encryptedParams send email = ", encryptedParams)
            const mId = await this.getMachineID();
            const b = { data: encryptedParams, machineId: mId }

            const reqUrl: string = `${this.API_BASE_URL}/sendEmail?type=user`;

            const options: any = {
                method: 'POST',
                headers: await this.getHeader(this.licenseKey),
                body: JSON.stringify(b)
            };

            const response = await fetch(reqUrl, options);
            const responseJ: any = await response.json();

            if (!response.ok) {
                console.log("bad server response for send email :\n", response)
                if (responseJ.data) {
                    let responseData = JSON.parse(this.decryptMessageToString(JSON.stringify(responseJ.data)))

                    console.log("bad server response for get x credentials - respnoseData (parsed) :\n", responseData)
                    if (responseData.errorMessage) {
                        throw new Error(`bad response by server : ${responseData.errorMessage}`)
                    }
                }
                throw new Error(`bad response by server with status : ${response.status}`)
            }

            console.log("response j (send email):\n", responseJ)

            const responseData = responseJ.data ? JSON.parse(this.decryptMessageToString(JSON.stringify(responseJ.data))) : responseJ
            console.log("responseData (parsed) j (send email):\n", responseData)

            if (responseData.success) {
                return {
                    success: true,
                    errorMessage: ""
                }
            } else {
                return {
                    success: false,
                    errorMessage: responseData.errorMessage
                }
            }

        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    // --- firestone utils :    

    private async ensureSW() {
        if (!('serviceWorker' in navigator)) return;
        return await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    public async registerFCMToken() {
        try {
            const swReg = await this.ensureSW();
            console.log("\nsw (firebase):\n",swReg);
            const licenseKey = this.licenseKey != "" ? this.licenseKey : this.userByDB.licenseKey
            if (licenseKey == "") {
                throw new Error("Invalid license key")
            }

            const permissionGranted = await requestNotifyPermission(true)
            console.log("permission granted :\n",permissionGranted);
            if (!permissionGranted) {
                throw new Error("notify permission not granted")
            }

            const token = await getToken(
                messaging, { 
                    vapidKey: VAPID_PUB_KEY
                })
            console.log("token in get tk :\n",token);
            if (token) {
                const q = query(collection(this.db, "users"), where("licenseKey", "==", licenseKey))
                const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);

                if (!snapshot.empty) {
                    const userDoc = snapshot.docs[0].ref;
                    await updateDoc(userDoc, { fcmToken: token })
                }

                return token
            }

            return ""

        } catch (error: any) {
            console.log("error in register FCMT token:\n", error)
            return "error : " + error.message
        }
    }

    /**
     * Add / update a notification in firestore db
     * @param notification TTT notification to add/update
     * @returns 
     */
    public async scheduleNotification(notification: TTT_Notification,licenseKey:string): Promise<baseResponse> {
        try {            
            if (!this.user) {
                throw new Error("User not initialized yet")
            }

            const notificationForDB : notificationDocData = {
                body : notification.body,
                fcmToken : notification.fcmToken,
                title : notification.title,
                icon : MAIN_LOGO_URL,
                when : notification.scheduleAt_timestamp,
                tag : notification.tag,
                sent : false,
                notificationID : notification.id,
                licenseKey : licenseKey,
                uId:this.user.uid
            }
            console.log("scheduling notification for timestamp: ",notification.scheduleAt_timestamp)
            const q = query(collection(this.db, "notifications"), where("licenseKey", "==", licenseKey))
            const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);
            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0].ref;
                const docData = snapshot.docs[0].data()
                console.log("doc data (schedule notifications):\n", docData);

                let updatedNotifications: notificationDocData[] = docData.notifications || []
                let index = updatedNotifications.findIndex(x => x.notificationID == notification.id)
                
                if (index != -1) {
                    updatedNotifications[index] = notificationForDB
                } else {
                    updatedNotifications.push(notificationForDB)
                }
                console.log("updated notification\n", updatedNotifications)


                await updateDoc(userDoc, { licenseKey: licenseKey, notifications: updatedNotifications });

            } else {                
                await setDoc(doc(collection(db, "notifications"), this.user.uid), {licenseKey : licenseKey, notifications : [notificationForDB]});
            }


            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    public async deleteNotification(notification_id: string, licenseKey:string) {
        try {
            if (!this.user) {
                throw new Error("user not logged")
            }
            const q = query(collection(this.db, "notifications"), where("licenseKey", "==", licenseKey))
            const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);

            if (snapshot.empty) {
                throw new Error("not found any notification with id : " + notification_id);
            }
            const docData = snapshot.docs[0].data()
            const docRef = snapshot.docs[0].ref;
            let notifications = docData.notifications as notificationDocData[] || []

            let notificationToRemove: notificationDocData | null = null;
            for (const notification of notifications) {
                try {
                    if (notification.notificationID === notification_id) {
                        notificationToRemove = notification;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            if (!notificationToRemove) {
                throw new Error(`Notification with id ${notification_id} not found for licenseKey ${licenseKey}`);
            }
            await updateDoc(docRef, {
                events: arrayRemove(notificationToRemove)
            });

            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    public async checkUniqueEmailAndUsername(email: string, username: string): Promise<baseResponse> {
        try {
            console.log("Checking email:", email, "and username:", username);

            // Verifica se l'email è già presente
            const emailQuery = query(
                collection(this.db, "users"),
                where("email", "==", email)
            );


            const emailSnapshot = await this.firestoreProxy.getDocsWithNetworkFirst(emailQuery)
            if (!emailSnapshot.empty) {
                throw new Error("Email already in use");
            }

            // Verifica se lo username è già presente
            const usernameQuery = query(
                collection(this.db, "users"),
                where("username", "==", username)
            );
            const usernameSnapshot = await this.firestoreProxy.getDocsWithNetworkFirst(usernameQuery)
            if (!usernameSnapshot.empty) {
                throw new Error("Username already in use");
            }

            return { success: true, errorMessage: "" };
        } catch (error: any) {
            return { success: false, errorMessage: error.message };
        }
    }

    public async updateUserInfo(uInfo: userDBentry): Promise<baseResponse> {
        try {
            console.log("updating uInfo with info:\n",)
            if (!this.user) {
                throw new Error("User not initialized yet")
            }

            // save user data in Firestore (local and then on db when user is online)
            await setDoc(doc(collection(db, "users"), this.user.uid), {
                licenseKey: this.licenseKey,
                email: uInfo.email,
                username: uInfo.username,
                firstName: uInfo.firstName,
                lastName: uInfo.lastName,
                permissions: uInfo.permissions,
                categories: uInfo.categories,
                timeTrackerActive: uInfo.timeTrackerActive,
                phone: uInfo.phone,
                age: uInfo.age,
                notification: uInfo.notifications,
                createdAt: uInfo.createdAt,
                licenseIsValid: uInfo.licenseIsValid,
                friends: uInfo.friends,
                karmaCoinsBalance: uInfo.karmaCoinsBalance
            });
            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            console.log("error in update user info:\n", error);
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    public async registerUser(userForm: userDBentry): Promise<baseResponse> {
        try {
            let licenseKey = generateLicenseKey()
            while (await this.checkIfUserExist(licenseKey)) { //ensures uniqueness
                licenseKey = generateLicenseKey()
            }
            console.log("chosen license key = ", licenseKey)
            const userCredential = await createUserWithEmailAndPassword(this.auth, userForm.email, licenseKey);
            const user = userCredential.user;
            this.user = user;
            this.userCredentials = userCredential;
            console.log("registered user:\n", user)
            // save user data in Firestore (local and then on db when user is online)
            await setDoc(doc(collection(db, "users"), user.uid), {
                licenseKey: licenseKey,
                email: userForm.email,
                username: userForm.username,
                firstName: userForm.firstName,
                lastName: userForm.lastName,
                permissions: userForm.permissions,
                categories: userForm.categories,
                timeTrackerActive: userForm.timeTrackerActive,
                phone: userForm.phone,
                age: userForm.age,
                notification: userForm.notifications,
                createdAt: new Date(),
                licenseIsValid: true,
                friends: [],
                karmaCoinsBalance: 0,
                fcmToken: ""
            });

            this.licenseKey = licenseKey;
            this.userEmail = userForm.email;
            this.userByDB = userForm;
            const sendRegistrationMailResponse = await this.sendEmail("registration", this.licenseKey, userForm.username, userForm.email)
            console.log("send registration mail res:\n", sendRegistrationMailResponse)
            await this.registerFCMToken()
            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            console.log("error while registering user:\n", error);
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    public async loginWithLicenseKey(licenseKey: string): Promise<baseResponse> {
        try {
            await this.checkInit()

            // Verifica se esiste un documento con la licenseKey
            const userQuery = query(
                collection(this.db, "users"),
                where("licenseKey", "==", licenseKey)
            );
            const userSnapshot = await this.firestoreProxy.getDocsWithNetworkFirst(userQuery)
            if (userSnapshot.empty) {
                throw new Error("Invalid license key");
            }

            let success = false
            let e_message = "User not found"
            for (let document of userSnapshot.docs) {
                const userData = document.data()
                console.log("user data\n", userData)
                if (userData.licenseKey == licenseKey) {
                    try {
                        this.userCredentials = await signInWithEmailAndPassword(this.auth, userData.email, userData.licenseKey)
                        this.user = this.userCredentials.user;
                        this.licenseKey = userData.licenseKey
                        this.userByDB = userData as unknown as userDBentry;
                        e_message = "";
                        success = true;
                        await this.registerFCMToken()
                    } catch (error) {
                        console.log("error during login:\n", error)
                        e_message = "Invalid license key"
                    }

                }
            }

            return {
                success,
                errorMessage: e_message
            };
        } catch (error: any) {
            console.log("Error during login:\n", error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }

    public async getUserInfo() {
        if (!this.userByDB) { //try to get data by login with lk or email : 
            if (this.licenseKey && this.licenseKey != "") {
                await this.loginWithLicenseKey(this.licenseKey)
            } else if ((this.userEmail && this.userEmail != "") || (this.user && this.user.email)) {
                const email = (this.userEmail && this.userEmail != "") ? this.userEmail : this.user && this.user.email ? this.user.email : ""
                if (email != "") {
                    const r = await this.getUserByEmail(this.userEmail)
                    if (r.success && r.data) {
                        this.userByDB = r.data
                    }
                }
            }
        }

        if (!this.userByDB) { //await to try to get data from onAuthStateChanged :
            await delay(1500)
        }

        return {
            userInfo: {
                licenseKey: this.licenseKey,
                user: this.user,
                userCredentials: this.userCredentials,
                userEmail: this.userEmail,
            },
            userInfo_DB: this.userByDB
        }
    }

    public async logOut(): Promise<baseResponse> {
        try {
            await signOut(this.auth);
            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            console.log("error during logout:\n", error);
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    private async checkIfUserExist(licenseKey: string): Promise<boolean> {
        const docRef = doc(collection(this.db, "users"), licenseKey);
        const docSnap = await this.firestoreProxy.getDocWithNetworkFirst(docRef)
        return docSnap.exists()
    }

    public async getUserByEmail(email: string): Promise<{
        success: boolean,
        errorMessage: string,
        data: userDBentry | null
    }> {
        try {
            // Verifica se l'email è già presente
            const emailQuery = query(
                collection(this.db, "users"),
                where("email", "==", email)
            );
            const emailSnapshot = await this.firestoreProxy.getDocsWithNetworkFirst(emailQuery);
            if (emailSnapshot.empty) {
                throw new Error("No users found with email " + email);
            }

            console.log("emailSnapshot:\n", emailSnapshot)

            const users = emailSnapshot.docs.map(doc => ({
                id: doc.id,  // Include anche l'ID del documento
                ...doc.data() // I dati reali dell'utente
            }));

            if (users.length > 1) {
                throw new Error("Multiple users with same email : " + email)
            }

            if (users.length == 0) {
                throw new Error("No users found with email " + email);
            }



            return { success: true, errorMessage: "", data: users[0] as unknown as userDBentry };
        } catch (error: any) {
            return { success: false, errorMessage: error.message, data: null };
        }
    }

    private async resetLKbyServer(email: string, lk: string, new_lk: string): Promise<baseResponse> {
        try {
            await this.checkInit()
            if (this.licenseKey == "") {
                this.licenseKey = lk;
            }

            const base64PubKey = this.unitArrToBase64(this.keyPair.publicKey)
            const params = { key: this.licenseKey, clientPubkey: base64PubKey, userEmail: email, new_licenseKey: new_lk };
            const plainText = JSON.stringify(params)
            const encryptedParams = this.encryptMessage(plainText);
            const mId = await this.getMachineID();
            const b = { data: encryptedParams, machineId: mId }

            const reqUrl: string = `${this.API_BASE_URL}/resetLK?type=user`;

            const options: any = {
                method: 'POST',
                headers: await this.getHeader(this.licenseKey),
                body: JSON.stringify(b)
            };

            const response = await fetch(reqUrl, options);
            const responseJ: any = await response.json();

            if (!response.ok) {
                console.log("bad server response for reset lk :\n", response)
                if (responseJ.data) {
                    let responseData = JSON.parse(this.decryptMessageToString(JSON.stringify(responseJ.data)))

                    console.log("bad server response for get x credentials - respnoseData (parsed) :\n", responseData)
                    if (responseData.errorMessage) {
                        throw new Error(`bad response by server : ${responseData.errorMessage}`)
                    }
                }
                throw new Error(`bad response by server with status : ${response.status}`)
            }

            console.log("response j (reset lk):\n", responseJ)

            const responseData = responseJ.data ? JSON.parse(this.decryptMessageToString(responseJ.data)) : responseJ
            console.log("responseData (parsed) j (reset lk):\n", responseData)

            if (responseData.success) {
                return {
                    success: true,
                    errorMessage: ""
                }
            } else {
                return {
                    success: false,
                    errorMessage: responseData.errorMessage
                }
            }


        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    public async resetLicenseKey(email: string, lk: string): Promise<{
        success: boolean,
        errorMessage: string,
        newLicenseKey: string
    }> {
        try {
            let new_licenseKey = generateLicenseKey();
            if (this.auth.currentUser) {
                await updatePassword(this.auth.currentUser, new_licenseKey)

                //update in firestone DB:
                const q = query(collection(this.db, "users"), where("email", "==", email))
                const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);

                if (snapshot.empty) {
                    throw new Error("No user found with email " + email);
                }

                const userDoc = snapshot.docs[0].ref;
                await updateDoc(userDoc, { licenseKey: new_licenseKey });

            } else {
                const serverResponse = await this.resetLKbyServer(email, lk, new_licenseKey)
                console.log("server response:\n", serverResponse)
                if (!serverResponse.success) {
                    throw new Error(serverResponse.errorMessage)
                }
            }

            // => password (= license key) resetted successfully
            this.licenseKey = new_licenseKey; //update in api gestor


            return {
                success: true,
                errorMessage: "",
                newLicenseKey: new_licenseKey
            }
        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message,
                newLicenseKey: ""
            }
        }
    }

    // ----- utils :

    private async getHeader(licenseKey: string): Promise<{
        Authorization: string,
        iv: string,
        authTag: string,
        "Content-Type": string
    }> {
        const plainToken = await this.generateJwtToken(licenseKey);
        console.log("plain tk = ", plainToken)
        const AES_res = await this.AES_encrypt(this.sharedKey, plainToken)
        console.log("aes res = ", AES_res)


        return {
            "Authorization": 'Bearer ' + AES_res.encryptedData,
            "iv": AES_res.iv,
            "authTag": AES_res.authTag,
            "Content-Type": "application/json"
        };
    }

    private base64urlEncode(str: string) {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    // Funzione per generare un token JWT
    private async generateJwtToken(licenseKey: string, uniqueKey = this.JWT_KEY_USERS) {
        console.log("lk generate jwt = ", licenseKey)
        console.log("unique k generate jwt = ", uniqueKey)
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        const payload = {
            exp: Math.floor(Date.now() / 1000) + 3600,  // Scadenza del token in 1 ora (in secondi)
            unique_key: `licenseKey:${licenseKey}@UniqueKey=${uniqueKey}`
        };

        const encodedHeader = this.base64urlEncode(JSON.stringify(header));
        const encodedPayload = this.base64urlEncode(JSON.stringify(payload));

        const dataToSign = `${encodedHeader}.${encodedPayload}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(dataToSign);

        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(this.JWT_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
        const signatureArray = Array.from(new Uint8Array(signatureBuffer));
        const signature = signatureArray.map(byte => String.fromCharCode(byte)).join('');

        const encodedSignature = this.base64urlEncode(signature);

        const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
        return token;
    }


    // ----- handle to do <--> db :

    /**
     * Aggiunge una nuova ToDoAction alla collezione "toDoActions" in Firestore.
     * Se il documento per la licenseKey non esiste, lo crea con un array contenente l'azione.
     * Se esiste, aggiunge l'azione all'array usando arrayUnion.
     *
     * @param licenseKey Identificativo univoco per il documento.
     * @param action L'istanza di ToDoAction da aggiungere.
    */
    public async addOrUpdateToDoAction(licenseKey: string, action: ToDoAction): Promise<baseResponse> {


        try {
            const q = query(collection(this.db, "toDoActions"), where("licenseKey", "==", licenseKey))
            const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);

            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0].ref;
                const docData = snapshot.docs[0].data()
                console.log("raw docData.toDo_actions :\n", docData.toDo_actions)
                let updatedActions: ToDoObj[] = docData.toDo_actions || []

                console.log("not updated actions:\n", updatedActions)

                let index = updatedActions.findIndex(x => x.id == action.id)
                console.log("index : ", index);
                if (index != -1) {
                    updatedActions[index] = action.getAsObj()
                } else {
                    updatedActions.push(action.getAsObj())
                }

                console.log("updated actions:\n", updatedActions)


                await updateDoc(userDoc, { licenseKey: licenseKey, toDo_actions: updatedActions });


            } else {
                if (!this.user) {
                    throw new Error("user not logged")
                }
                await setDoc(doc(collection(db, "toDoActions"), this.user.uid), { toDo_actions: [action.getAsObj()], licenseKey: licenseKey });
            }

            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            console.error("Error adding ToDoAction:", error);
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    /**
     * Elimina una ToDoAction data la licenseKey e l'id dell'azione.
     * Utilizza arrayRemove per rimuovere l'azione specifica cercando la stringa corrispondente.
     *
     * @param licenseKey Identificativo univoco per il documento.
     * @param actionId Id dell'azione da eliminare.
     */
    public async removeToDoAction(licenseKey: string, actionId: string): Promise<baseResponse> {

        try {
            if (!this.user) {
                throw new Error("user not logged")
            }
            console.log("this.user.uid:\n", this.user.uid)
            const q = query(collection(this.db, "toDoActions"), where("licenseKey", "==", licenseKey))
            const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);

            if (snapshot.empty) {
                throw new Error("no to do found for license key : " + licenseKey);
            }
            const docData = snapshot.docs[0].data()
            const docRef = snapshot.docs[0].ref;
            let actions: ToDoObj[] = docData.toDo_actions || [];

            console.log("actions:\n", actions)
            console.log("actionId:\n", actionId)

            let actionToRemove: ToDoObj | null = null;
            for (const actionObj of actions) {
                try {
                    if (actionObj.id === actionId) {
                        actionToRemove = actionObj;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            if (!actionToRemove) {
                throw new Error(`ToDoAction with id ${actionId} not found for licenseKey ${licenseKey}`);
            }
            await updateDoc(docRef, {
                toDo_actions: arrayRemove(actionToRemove)
            });
            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            console.error("Error removing ToDoAction:", error);
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    /**
     * Recupera tutte le ToDoActions relative a una determinata licenseKey.
     * Ritorna un array di oggetti deserializzati.
     *
     * @param licenseKey Identificativo univoco per il documento.
     * @returns Array di oggetti ToDoAction serializzati come JSON.
     */
    public async getToDoActions(licenseKey: string): Promise<{
        success: boolean,
        errorMessage: string,
        toDoObjects: ToDoObj[]
    }> {

        try {
            const q = query(collection(this.db, "toDoActions"), where("licenseKey", "==", licenseKey))
            const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);

            if (snapshot.empty) {
                throw new Error("no to do found for license key : " + licenseKey);
            }
            const docData = snapshot.docs[0].data()
            let parsedActions: ToDoObj[] = docData.toDo_actions || [];
            console.log("parsedActions (api gestor):\n", parsedActions)
            for (let action of parsedActions) {
                parseActionDates(action)
            }

            return {
                success: true,
                errorMessage: '',
                toDoObjects: parsedActions
            }
        } catch (error: any) {
            console.error("Error getting ToDoActions:", error);
            return {
                success: true,
                errorMessage: error.message,
                toDoObjects: []
            }
        }
    }

    // ----- handle calendar events <--> db :

    public async addOrUpdateCalendarEvent(licenseKey: string, event: CalendarEvent): Promise<baseResponse> {
        try {
            const q = query(collection(this.db, "calendarEvents"), where("licenseKey", "==", licenseKey))
            const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);

            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0].ref;
                const docData = snapshot.docs[0].data()
                let updatedEvents: CalendarObj[] = docData.events || []

                let index = updatedEvents.findIndex(x => x.id == event.id)
                console.log("index : ", index);
                if (index != -1) {
                    updatedEvents[index] = event.getAsObj()
                } else {
                    updatedEvents.push(event.getAsObj())
                }

                console.log("updated events:\n", updatedEvents)


                await updateDoc(userDoc, { licenseKey: licenseKey, events: updatedEvents });
            } else {
                if (!this.user) {
                    throw new Error("user not logged")
                }
                await setDoc(doc(collection(db, "calendarEvents"), this.user.uid), { events: [event.getAsObj()], licenseKey: licenseKey });
            }

            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            console.error("Error adding/updating calendar event:", error);
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    public async removeCalendarEvent(licenseKey: string, eventId: string): Promise<baseResponse> {

        try {
            if (!this.user) {
                throw new Error("user not logged")
            }
            const docRef = doc(this.db, "calendarEvents", this.user.uid);
            const docSnap = await this.firestoreProxy.getDocWithNetworkFirst(docRef);
            if (!docSnap.exists()) {
                throw new Error(`No calendar events found for licenseKey ${licenseKey}`);
            }
            const data = docSnap.data();
            const events: CalendarObj[] = data.events ?? [];

            let eventToRemove: CalendarObj | null = null;
            for (const event of events) {
                try {
                    if (event.id === eventId) {
                        eventToRemove = event;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            if (!eventToRemove) {
                throw new Error(`Calendar event with id ${eventId} not found for licenseKey ${licenseKey}`);
            }
            await updateDoc(docRef, {
                events: arrayRemove(eventToRemove)
            });
            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            console.error("Error removing calendar event:", error);
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }


    public async getCalendarEvents(licenseKey: string): Promise<{
        success: boolean,
        errorMessage: string,
        eventObjects: CalendarObj[]
    }> {

        try {
            const q = query(collection(this.db, "calendarEvents"), where("licenseKey", "==", licenseKey))
            const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);

            if (snapshot.empty) {
                throw new Error("no calendar events found for license key : " + licenseKey);
            }
            const docData = snapshot.docs[0].data()
            let parsedEvents: CalendarObj[] = docData.events || [];
            for (let event of parsedEvents) {
                let firestoneDate = event.eventDate as unknown as firestoneDate
                event.eventDate = new Date(firestoneDate.seconds * 1000 + Math.floor(firestoneDate.nanoseconds / 1_000_000));
            }

            return {
                success: true,
                errorMessage: '',
                eventObjects: parsedEvents
            }
        } catch (error: any) {
            console.error("Error getting calendar Events:", error);
            return {
                success: true,
                errorMessage: error.message,
                eventObjects: []
            }
        }
    }

    // ----- handle time tracker rules <--> db :

    public async addOrUpdateTimeTrackerRule(licenseKey: string, rule: TimeTrackerRule): Promise<baseResponse> {
        try {
            const q = query(collection(this.db, "timeTrackerRules"), where("licenseKey", "==", licenseKey));
            const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);

            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0].ref;
                const docData = snapshot.docs[0].data();
                let updatedRules: TimeTrackerRuleObj[] = docData.rules || [];

                const index = updatedRules.findIndex(r => r.id === rule.id);
                if (index !== -1) {
                    updatedRules[index] = rule.getAsObj();
                } else {
                    updatedRules.push(rule.getAsObj());
                }

                await updateDoc(userDoc, { licenseKey: licenseKey, rules: updatedRules });
            } else {
                if (!this.user) throw new Error("user not logged");

                await setDoc(doc(collection(this.db, "timeTrackerRules"), this.user.uid), {
                    rules: [rule.getAsObj()],
                    licenseKey: licenseKey
                });
            }

            return { success: true, errorMessage: "" };
        } catch (error: any) {
            console.error("Error adding/updating time tracker rule:", error);
            return { success: false, errorMessage: error.message };
        }
    }


    public async removeTimeTrackerRule(licenseKey: string, ruleId: string): Promise<baseResponse> {
        try {
            if (!this.user) throw new Error("user not logged");

            const docRef = doc(this.db, "timeTrackerRules", this.user.uid);
            const docSnap = await this.firestoreProxy.getDocWithNetworkFirst(docRef);

            if (!docSnap.exists()) {
                throw new Error(`No time tracker rules found for licenseKey ${licenseKey}`);
            }

            const data = docSnap.data();
            const rules: TimeTrackerRuleObj[] = data.rules ?? [];

            const ruleToRemove = rules.find(r => r.id === ruleId);
            if (!ruleToRemove) {
                throw new Error(`Time Tracker rule with id ${ruleId} not found for licenseKey ${licenseKey}`);
            }

            await updateDoc(docRef, {
                rules: arrayRemove(ruleToRemove)
            });

            return { success: true, errorMessage: "" };
        } catch (error: any) {
            console.error("Error removing time tracker rule:", error);
            return { success: false, errorMessage: error.message };
        }
    }

    public async getTimeTrackerRules(licenseKey: string): Promise<{
        success: boolean,
        errorMessage: string,
        rules: TimeTrackerRuleObj[]
    }> {
        try {
            const q = query(collection(this.db, "timeTrackerRules"), where("licenseKey", "==", licenseKey));
            const snapshot = await this.firestoreProxy.getDocsWithNetworkFirst(q);

            if (snapshot.empty) {
                throw new Error("No time tracker rules found for license key: " + licenseKey);
            }

            const docData = snapshot.docs[0].data();
            const parsedRules: TimeTrackerRuleObj[] = docData.rules || [];

            return {
                success: true,
                errorMessage: '',
                rules: parsedRules
            };
        } catch (error: any) {
            console.error("Error getting time tracker rules:", error);
            return {
                success: false,
                errorMessage: error.message,
                rules: []
            };
        }
    }



}