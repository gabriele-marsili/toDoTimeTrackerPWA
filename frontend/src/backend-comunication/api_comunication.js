import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { analytics, auth, db } from "./firebase";
import { generateLicenseKey, getDeviceId, hashPassword } from "../utils/generalUtils";
import sodium from 'libsodium-wrappers';
/**
 * singleton class to interact with the backend via API
 */
export class API_gestor {
    static instance;
    API_BASE_URL;
    JWT_KEY_USERS;
    JWT_KEY;
    machineID;
    keyPair;
    serverPubKey;
    keyFilePath;
    clientECDH;
    sharedKey;
    initialized;
    accessInvalid = false;
    auth;
    db;
    analytics;
    user = null;
    userCredentials = null;
    licenseKey;
    userEmail;
    constructor() {
        this.auth = auth;
        this.db = db;
        this.analytics = analytics;
        this.licenseKey = "";
        this.userEmail = "";
        this.initialized = false;
    }
    /**
     * singleton method to get the instance
     * @returns the instance of the API gestor
     */
    static getInstance() {
        if (API_gestor.instance == null) {
            API_gestor.instance = new API_gestor();
        }
        return API_gestor.instance;
    }
    // --- init methods :
    async init() {
        this.machineID = "";
        this.API_BASE_URL = "http://localhost:3042"; // to do : spostare da qui
        this.JWT_KEY_USERS = "jU(TTT-app)%8/*+-.-+*![00]";
        this.JWT_KEY = "jwtTTT-%42-=ç-%42°?!372-1092-947019-[[[]-T-È€-à>";
        console.log("API_BASE_URL = ", this.API_BASE_URL);
        console.log("JWT_KEY_USERS = ", this.JWT_KEY_USERS);
        console.log("JWT_KEY = ", this.JWT_KEY);
        this.keyFilePath = "./keyFile.json";
        this.clientECDH = await this.generateECDHKeyPair();
        console.log("ecdh creato : ", this.clientECDH);
        await sodium.ready;
        console.log("sodium ready");
        await this.loadOrGenerateKeyPair();
        await this.initDH();
        console.log("\nDH completed\n");
        await this.setServerPubKey();
        console.log("\n\nserver pubkey setted :", this.serverPubKey);
        this.initialized = true;
    }
    async checkInit() {
        if (!this.initialized) {
            await this.init();
            if (!this.initialized) {
                throw new Error("Server API not fully initialized");
            }
        }
        if (this.accessInvalid) {
            throw new Error("invalid token or license-key");
        }
    }
    async generateECDHKeyPair() {
        const keyPair = await window.crypto.subtle.generateKey({
            name: "ECDH",
            namedCurve: "P-256", // "prime256v1" in OpenSSL è "P-256" nel Web Crypto API
        }, true, // Può essere esportata
        ["deriveKey", "deriveBits"]);
        return keyPair;
    }
    /**
     * Load / generate keyPair (pub & private key)
     */
    async loadOrGenerateKeyPair() {
        const mId = await this.getMachineID();
        // Accedi a IndexedDB
        const dbRequest = indexedDB.open("KeyPairDB", 2);
        dbRequest.onupgradeneeded = (event) => {
            const db = event.target.result;
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
                console.log("data:\n", data);
                if (data) {
                    const encryptedKeyData = data;
                    const decryptedPubKey = await this.decryptKey(encryptedKeyData.publicKey, mId);
                    const decryptedPrivateKey = await this.decryptKey(encryptedKeyData.privateKey, mId);
                    this.keyPair = {
                        privateKey: decryptedPrivateKey,
                        publicKey: decryptedPubKey
                    };
                }
                else {
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
                    console.log("key pair (encrypted):\n", d);
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
    async initDH() {
        try {
            const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", this.clientECDH.publicKey);
            //conversione in formato hex (string)
            const publicKeyHex = this.arrayBufferToHex(publicKeyBuffer);
            console.log("pub key (client) hex : ", publicKeyHex);
            const reqUrl = `${this.API_BASE_URL}/DH?type=user`;
            const mId = await this.getMachineID();
            const options = {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicKey: publicKeyHex, machineId: mId })
            };
            const response = await fetch(reqUrl, options);
            console.log(`response by API init DH:\n`, response);
            const responseData = await response.json();
            console.log(`responseData by API init dh:\n`, responseData);
            if (response.ok && responseData.success && responseData.publicKey) {
                console.log("key by server : ", responseData.publicKey);
                const serverPublicKey = await window.crypto.subtle.importKey("raw", this.hexToArrayBuffer(responseData.publicKey), {
                    name: "ECDH",
                    namedCurve: "P-256"
                }, false, []);
                // Deriva i 256 bit della shared secret
                const sharedSecretBits = await window.crypto.subtle.deriveBits({ name: "ECDH", public: serverPublicKey }, this.clientECDH.privateKey, 256);
                // Calcola l'hash SHA-256 per ottenere la shared key, come fatto sul server
                const sharedKeyBuffer = await window.crypto.subtle.digest("SHA-256", sharedSecretBits);
                // Converti in hex per verificare
                const sharedKeyHex = this.arrayBufferToHex(sharedKeyBuffer);
                console.log("Shared key (client, hex):", sharedKeyHex);
                this.sharedKey = sharedKeyHex;
            }
            else {
                throw new Error(responseData.errorMessage);
            }
        }
        catch (error) {
            console.log("error in init DH:\n", error);
            throw new Error("an error occured in init DH");
        }
    }
    // --- security : 
    async encryptKey(data, password) {
        const key = await hashPassword(password);
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES); // Genera un nonce casuale di 24 byte
        const encrypted = sodium.crypto_secretbox_easy(data, nonce, key);
        return {
            nonce: this.unitArrToBase64(nonce),
            encrypted: this.unitArrToBase64(encrypted)
        };
    }
    encryptMessage(message) {
        // Il risultato è un Uint8Array
        const sealed = sodium.crypto_box_seal(message, this.serverPubKey);
        return this.unitArrToBase64(sealed);
    }
    async decryptKey(data, password) {
        const key = await hashPassword(password);
        const encryptedUint8 = this.base64ToUint8Array(data.encrypted);
        const nonceUint8 = this.base64ToUint8Array(data.nonce);
        return sodium.crypto_secretbox_open_easy(encryptedUint8, nonceUint8, key);
    }
    async AES_encrypt(key, plaintext) {
        const KeyBuffer = this.hexToArrayBuffer_2(key);
        const CryptoKey = await window.crypto.subtle.importKey("raw", KeyBuffer, { name: "AES-GCM" }, false, // non esportabile
        ["encrypt", "decrypt"]);
        // Genera un IV casuale per AES-GCM (12 bytes)
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // iv è un Uint8Array, va bene per AES-GCM
        // Converti il plaintext in un ArrayBuffer
        const encoder = new TextEncoder();
        const encodedText = encoder.encode(plaintext); // encodedText è un Uint8Array
        // Esegui la cifratura
        const encrypted = await window.crypto.subtle.encrypt({
            name: "AES-GCM",
            iv: iv, // iv è un Uint8Array
        }, CryptoKey, encodedText);
        // Converti il risultato cifrato (ArrayBuffer) in un Uint8Array
        const encryptedArray = new Uint8Array(encrypted); // encryptedArray è un Uint8Array, non un Uint8Array<ArrayBuffer>
        // Converti i dati cifrati in formato esadecimale
        const encryptedHex = this.arrayBufferToHex(encryptedArray.buffer); // Forza il tipo a ArrayBuffer
        // Il tag di autenticazione è l'ultimo byte del ciphertext (AES-GCM)
        const authTag = encryptedHex.slice(-32); // Gli ultimi 16 byte (32 caratteri esadecimali)
        return {
            iv: this.arrayBufferToHex(iv.buffer), // Forza il tipo a ArrayBuffer
            encryptedData: encryptedHex.slice(0, -32), // Dati cifrati (senza il tag)
            authTag: authTag,
        };
    }
    // Funzione per convertire ArrayBuffer in stringa esadecimale
    arrayBufferToHex(buffer) {
        const view = new Uint8Array(buffer); // La vista Uint8Array dell'ArrayBuffer
        return Array.from(view).map(byte => byte.toString(16).padStart(2, '0')).join('');
    }
    hexToArrayBuffer_2(hex) {
        if (hex.length % 2 !== 0) {
            throw new Error("Hex string must have an even number of characters");
        }
        const buffer = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            buffer[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return buffer.buffer;
    }
    async cryptoKeyToHex(key) {
        const sharedSecretBuffer = await window.crypto.subtle.exportKey("raw", key);
        // Converti il buffer in stringa esadecimale
        return Array.from(new Uint8Array(sharedSecretBuffer))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }
    async getMachineID() {
        if (!this.machineID || this.machineID == "") {
            this.machineID = await getDeviceId();
        }
        return this.machineID;
    }
    decryptMessage(encryptedMessage) {
        const encryptedUint8 = this.base64ToUint8Array(encryptedMessage);
        return sodium.crypto_box_seal_open(encryptedUint8, this.keyPair.publicKey, this.keyPair.privateKey);
    }
    decryptMessageToString(encryptedMessage) {
        const decryptedUint8 = sodium.crypto_box_seal_open(this.base64ToUint8Array(encryptedMessage), this.keyPair.publicKey, this.keyPair.privateKey);
        if (!decryptedUint8) {
            throw new Error("Decryption failed");
        }
        return this.uint8ArrayToUtf8(decryptedUint8);
    }
    // Converte una stringa base64 in Uint8Array
    base64ToUint8Array(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
    // Converte un Uint8Array in una stringa base64
    unitArrToBase64(uint8Array) {
        let binary = "";
        for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return window.btoa(binary);
    }
    // Converte un Uint8Array in una stringa UTF-8
    uint8ArrayToUtf8(uint8Array) {
        return new TextDecoder().decode(uint8Array);
    }
    hexToArrayBuffer(hex) {
        const buffer = new ArrayBuffer(hex.length / 2);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < hex.length; i += 2) {
            view[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return buffer;
    }
    // --- set server pubkey :
    async setServerPubKey() {
        try {
            const reqUrl = `${this.API_BASE_URL}/getServerPubKey?type=user`;
            const mId = await this.getMachineID();
            const base64ClientPubkey = this.unitArrToBase64(this.keyPair.publicKey);
            console.log("client pubkey length : ", base64ClientPubkey.length);
            console.log("base64ClientPubkey: ", base64ClientPubkey);
            const options = {
                method: 'POST',
                headers: await this.getHeader(this.licenseKey),
                body: JSON.stringify({ clientPubKey: base64ClientPubkey, machineId: mId })
            };
            const response = await fetch(`${reqUrl}`, options);
            console.log(`response by API set ServerPubKey :`, response);
            const responseData = await response.json();
            console.log(`responseData set ServerPubKey :`, responseData);
            if ('serverPubKey' in responseData && response.ok) {
                console.log("server pubkey str (base 64, encrypted) = ", responseData.serverPubKey);
                this.serverPubKey = this.decryptMessage(responseData.serverPubKey); //decrypt base 64 to unitArr
                console.log("this.serverPubKey = ", this.serverPubKey);
            }
            else {
                const e_message = 'error_message' in responseData ? responseData.error_message : "";
                if (e_message == "invalid token or license-key" && response.status == 403) {
                    this.accessInvalid = true;
                }
                throw new Error("request status : " + response.status + "\nErr msg : " + e_message);
            }
        }
        catch (error) {
            console.log("error in get server pubkey", error);
        }
    }
    // --- other methods : 
    async sendEmail(type, licenseKey, username, userEmail) {
        try {
            await this.checkInit();
            let subject = "";
            let htmlEmailBody = "";
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
                    break;
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
                    break;
                case "delete acc confirmation":
                    subject = "TTT app - Account Deletion Confirmation";
                    htmlEmailBody = `
                        <h2>Hello ${username},</h2>
                        <p>This is to confirm that your account has been successfully deleted from TTT app.</p>
                        <p>We are sorry to see you go and hope to serve you again in the future.</p>
                        <br/>
                        <p>Best regards,<br/>TTT app</p>
                    `;
                    break;
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
                    break;
                default: //@unreachable
                    return {
                        success: false,
                        errorMessage: "unsopported type : " + type
                    };
            }
            const base64PubKey = this.unitArrToBase64(this.keyPair.publicKey);
            const params = { key: this.licenseKey, clientPubkey: base64PubKey, userEmail, subject, htmlEmailBody };
            const plainText = JSON.stringify(params);
            console.log("plain text: ", plainText);
            const encryptedParams = this.encryptMessage(plainText);
            console.log("encryptedParams send email = ", encryptedParams);
            const mId = await this.getMachineID();
            const b = { data: encryptedParams, machineId: mId };
            const reqUrl = `${this.API_BASE_URL}/sendEmail?type=user`;
            const options = {
                method: 'POST',
                headers: await this.getHeader(this.licenseKey),
                body: JSON.stringify(b)
            };
            const response = await fetch(reqUrl, options);
            const responseJ = await response.json();
            if (!response.ok) {
                console.log("bad server response for send email :\n", response);
                if (responseJ.data) {
                    let responseData = JSON.parse(this.decryptMessageToString(JSON.stringify(responseJ.data)));
                    console.log("bad server response for get x credentials - respnoseData (parsed) :\n", responseData);
                    if (responseData.errorMessage) {
                        throw new Error(`bad response by server : ${responseData.errorMessage}`);
                    }
                }
                throw new Error(`bad response by server with status : ${response.status}`);
            }
            console.log("response j (send email):\n", responseJ);
            const responseData = responseJ.data ? JSON.parse(this.decryptMessageToString(JSON.stringify(responseJ.data))) : responseJ;
            console.log("responseData (parsed) j (send email):\n", responseData);
            if (responseData.success) {
                return {
                    success: true,
                    errorMessage: ""
                };
            }
            else {
                return {
                    success: false,
                    errorMessage: responseData.errorMessage
                };
            }
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }
    // --- firestone utils :    
    async checkUniqueEmailAndUsername(email, username) {
        try {
            console.log("Checking email:", email, "and username:", username);
            // Verifica se l'email è già presente
            const emailQuery = query(collection(this.db, "users"), where("email", "==", email));
            const emailSnapshot = await getDocs(emailQuery);
            if (!emailSnapshot.empty) {
                throw new Error("Email already in use");
            }
            // Verifica se lo username è già presente
            const usernameQuery = query(collection(this.db, "users"), where("username", "==", username));
            const usernameSnapshot = await getDocs(usernameQuery);
            if (!usernameSnapshot.empty) {
                throw new Error("Username already in use");
            }
            return { success: true, errorMessage: "" };
        }
        catch (error) {
            return { success: false, errorMessage: error.message };
        }
    }
    async registerUser(userForm) {
        try {
            let licenseKey = generateLicenseKey();
            while (await this.checkIfUserExist(licenseKey)) { //ensures uniqueness
                licenseKey = generateLicenseKey();
            }
            console.log("chosen license key = ", licenseKey);
            const userCredential = await createUserWithEmailAndPassword(this.auth, userForm.email, licenseKey);
            const user = userCredential.user;
            this.user = user;
            this.userCredentials = userCredential;
            console.log("registered user:\n", user);
            // Salva i dati utente in Firestore
            await setDoc(doc(collection(db, "users"), user.uid), {
                licenseKey: licenseKey,
                email: userForm.email,
                username: userForm.username,
                firstName: userForm.firstName,
                lastName: userForm.lastName,
                permissions: userForm.permissions,
                categories: userForm.categories,
                timeTrackerActive: userForm.timeTracker,
                phone: userForm.phone,
                age: userForm.age,
                notification: userForm.notifications,
                createdAt: new Date(),
                licenseIsValid: true
            });
            this.licenseKey = licenseKey;
            this.userEmail = userForm.email;
            const sendRegistrationMailResponse = await this.sendEmail("registration", this.licenseKey, userForm.username, userForm.email);
            console.log("send registration mail res:\n", sendRegistrationMailResponse);
            return {
                success: true,
                errorMessage: ""
            };
        }
        catch (error) {
            console.log("error while registering user:\n", error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }
    async loginWithLicenseKey(licenseKey) {
        try {
            // Verifica se esiste un documento con la licenseKey
            const userQuery = query(collection(this.db, "users"), where("licenseKey", "==", licenseKey));
            const userSnapshot = await getDocs(userQuery);
            console.log("userSnapshot:\n", userSnapshot);
            if (userSnapshot.empty) {
                throw new Error("Invalid license key");
            }
            let success = false;
            let e_message = "User not found";
            userSnapshot.forEach(async (document) => {
                const userData = document.data();
                console.log("user data\n", userData);
                if (userData.licenseKey == licenseKey) {
                    try {
                        this.userCredentials = await signInWithEmailAndPassword(this.auth, userData.email, userData.licenseKey);
                        this.user = this.userCredentials.user;
                    }
                    catch (error) {
                        console.log("error during login:\n", error);
                        e_message = "Invalid license key";
                    }
                }
            });
            return {
                success,
                errorMessage: e_message
            };
        }
        catch (error) {
            console.log("Error during login:\n", error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }
    async logOut() {
        try {
            await signOut(this.auth);
            return {
                success: true,
                errorMessage: ""
            };
        }
        catch (error) {
            console.log("error during logout:\n", error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }
    async checkIfUserExist(licenseKey) {
        const docRef = doc(collection(this.db, "users"), licenseKey);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    }
    // ----- utils :
    async getHeader(licenseKey) {
        const plainToken = await this.generateJwtToken(licenseKey);
        console.log("plain tk = ", plainToken);
        const AES_res = await this.AES_encrypt(this.sharedKey, plainToken);
        console.log("aes res = ", AES_res);
        return {
            "Authorization": 'Bearer ' + AES_res.encryptedData,
            "iv": AES_res.iv,
            "authTag": AES_res.authTag,
            "Content-Type": "application/json"
        };
    }
    base64urlEncode(str) {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
    // Funzione per generare un token JWT
    async generateJwtToken(licenseKey, uniqueKey = this.JWT_KEY_USERS) {
        console.log("lk generate jwt = ", licenseKey);
        console.log("unique k generate jwt = ", uniqueKey);
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };
        const payload = {
            exp: Math.floor(Date.now() / 1000) + 3600, // Scadenza del token in 1 ora (in secondi)
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
}
