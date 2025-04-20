"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTTappServer = void 0;
const fs_1 = __importDefault(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const node_machine_id_1 = require("node-machine-id");
const libsodium_wrappers_1 = __importDefault(require("libsodium-wrappers"));
const crypto_1 = require("crypto");
const crypto_2 = __importDefault(require("crypto"));
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../firebase/firebase");
const cors_1 = __importDefault(require("cors"));
const notificationManager_1 = require("../notificationEngine/notificationManager");
/**
 * Singleton class to handle the server services
 */
class TTTappServer {
    static instance = null;
    PORT = 3042;
    app = (0, express_1.default)();
    JWT_KEY;
    JWT_KEY_USERS;
    keyFilePath = path_1.default.join(__dirname, 'keyFile.json');
    keyPair;
    serverECDH;
    userKeyMap = new Map();
    auth;
    db;
    firestoneAdmin;
    notificationManager;
    constructor() {
        dotenv.config({ path: path_1.default.join(__dirname, "server.env") });
        this.auth = firebase_1.auth;
        this.db = firebase_1.db;
        this.firestoneAdmin = firebase_1.initializedFirestonAdmin;
        this.notificationManager = notificationManager_1.NotificationManager.getInstance();
        this.JWT_KEY = process.env.JWT_KEY || "JWT_KEY not loaded";
        this.JWT_KEY_USERS = process.env.JWT_KEY_USERS || "JWT_KEY_USERS not loaded";
        console.log("this.JWT_KEY_USERS = ", this.JWT_KEY_USERS);
        console.log("this.JWT_KEY = ", this.JWT_KEY);
        this.check(this.JWT_KEY);
        this.check(this.JWT_KEY_USERS);
        this.serverECDH = crypto_2.default.createECDH("prime256v1");
        this.serverECDH.generateKeys();
        console.log("ecdh creato");
        libsodium_wrappers_1.default.ready.then(() => {
            this.loadOrGenerateKeyPair();
            this.app.use((0, cors_1.default)());
            this.app.use(express_1.default.json()); // for parsing application/json
            this.start();
        });
    }
    /**
     * Load / generate keyPair (pub & private key)
     */
    loadOrGenerateKeyPair() {
        const mID = (0, node_machine_id_1.machineIdSync)();
        if (fs_1.default.existsSync(this.keyFilePath)) { //get keypair and dectipt it 
            const encryptedKeyData = JSON.parse(fs_1.default.readFileSync(this.keyFilePath, 'utf-8'));
            console.log("encryptedKeyData = ", encryptedKeyData);
            const decryptedPubKey = this.decryptKey(encryptedKeyData.publicKey, mID);
            const decryptedPrivateKey = this.decryptKey(encryptedKeyData.privateKey, mID);
            console.log("decryptedPubKey = ", decryptedPubKey);
            console.log("decryptedPrivateKey = ", decryptedPrivateKey);
            this.keyPair = {
                privateKey: decryptedPrivateKey,
                publicKey: decryptedPubKey
            };
        }
        else {
            const password = (0, node_machine_id_1.machineIdSync)();
            const hashedPassword = (0, crypto_1.createHash)('sha256').update(password).digest();
            this.keyPair = libsodium_wrappers_1.default.crypto_box_seed_keypair(hashedPassword);
            console.log("this.keyPair.privateKey = ", this.keyPair.privateKey);
            console.log("this.keyPair.publicKey = ", this.keyPair.publicKey);
            //encrypt and got base 64 str
            const encryptedPrivateKey = this.encryptKey(this.keyPair.privateKey, mID);
            const encryptedPublicKey = this.encryptKey(this.keyPair.publicKey, mID);
            const d = {
                publicKey: encryptedPublicKey,
                privateKey: encryptedPrivateKey,
            };
            fs_1.default.writeFileSync(this.keyFilePath, JSON.stringify(d), 'utf8');
        }
    }
    // --- security : 
    encryptKey(data, password) {
        const key = (0, crypto_1.createHash)('sha256').update(password).digest(); // Ottieni un buffer da 32 byte
        const nonce = libsodium_wrappers_1.default.randombytes_buf(libsodium_wrappers_1.default.crypto_secretbox_NONCEBYTES); // Genera un nonce casuale di 24 byte
        const encrypted = libsodium_wrappers_1.default.crypto_secretbox_easy(data, nonce, key);
        return {
            nonce: this.unitArrToBase64(nonce),
            encrypted: this.unitArrToBase64(encrypted)
        };
    }
    decryptKey(data, password) {
        const key = (0, crypto_1.createHash)('sha256').update(password).digest(); // Ottieni un buffer da 32 byte
        return libsodium_wrappers_1.default.crypto_secretbox_open_easy(Buffer.from(data.encrypted, 'base64'), Buffer.from(data.nonce, 'base64'), key);
    }
    encryptMessage(message, publicKey) {
        if (typeof message == "string") {
            message = this.convertToUint8ArrayByBase64(message);
        }
        return Buffer.from(libsodium_wrappers_1.default.crypto_box_seal(message, publicKey)).toString('base64');
    }
    encryptMessageToString(message, publicKey) {
        if (typeof publicKey == "string") {
            publicKey = this.convertToUint8ArrayByBase64(publicKey);
        }
        return Buffer.from(libsodium_wrappers_1.default.crypto_box_seal(message, publicKey)).toString('base64');
    }
    decryptMessage(encryptedMessage) {
        const decryptedUint8Array = libsodium_wrappers_1.default.crypto_box_seal_open(Buffer.from(encryptedMessage, 'base64'), this.keyPair.publicKey, this.keyPair.privateKey);
        if (!decryptedUint8Array) {
            throw new Error("Decryption failed");
        }
        return Buffer.from(decryptedUint8Array).toString('utf-8'); // Converte in stringa
    }
    AES_decrypt(key, iv, encryptedData, authTag) {
        const decipher = crypto_2.default.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
        decipher.setAuthTag(Buffer.from(authTag, "hex"));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedData, "hex")),
            decipher.final()
        ]);
        return decrypted.toString("utf8");
    }
    ;
    /**
     * singleton method to get the instance
     * @returns the instance
     */
    static getInstance() {
        if (TTTappServer.instance == null) {
            TTTappServer.instance = new TTTappServer();
        }
        return TTTappServer.instance;
    }
    check(s) {
        if (s.includes("not loaded")) {
            throw new Error(s);
        }
    }
    start() {
        this.app.listen(this.PORT, () => {
            console.log(`API listening at http://localhost:${this.PORT}`);
        });
        // Middleware per verificare il token JWT
        this.app.use((req, res, next) => {
            try {
                const encryptedToken = req.headers.authorization;
                console.log("Token (encrypted) :\n", encryptedToken);
                //console.log("req BEFORE middleware :\n", req)
                console.log("req query  :\n", req.query);
                //console.log("req headers  :\n", req.headers)
                const type = req.query["type"];
                let r_body = req.body;
                if (typeof r_body == "string") {
                    r_body = JSON.parse(r_body);
                }
                console.log("req path:\n", req.path);
                console.log("r_body:\n", r_body);
                if (!(req.path == "/DH" || req.path == " /DH" || req.path == " /getServerPubKey") && ((!encryptedToken) || !("machineId" in r_body) || !("iv" in req.headers))) {
                    console.log("m f");
                    res.status(401).json({ message: 'missing field', success: false, error: true, error_message: 'missing field' });
                    return;
                }
                if (req.path === "/DH" || req.path === " /DH" || req.path == " /getServerPubKey" || req.path == "/getServerPubKey") {
                    next();
                }
                else if (type == "user" && encryptedToken) { // => verifica utente
                    //dectypt token
                    console.log("req.headers:\n", req.headers);
                    const userMachineId = r_body.machineId;
                    const iv = req.headers.iv;
                    const authTag = req.headers.authtag;
                    const userKey = this.userKeyMap.get(userMachineId);
                    console.log("\nuser verification:\nuserMachineId : ", userMachineId);
                    console.log("iv:\n ", iv);
                    console.log("authTag:\n ", authTag);
                    console.log("userKey:\n ", userKey);
                    if (!userKey) {
                        res.status(401).json({ message: 'user key not found', success: false, error: true, error_message: 'user key not found' });
                        return;
                    }
                    const encryptedTokenValue = encryptedToken.split(' ')[1];
                    console.log("encryptedTokenValue = ", encryptedTokenValue);
                    console.log("userKey str = ", userKey.toString());
                    const tokenValue = this.AES_decrypt(userKey, iv, encryptedTokenValue, authTag);
                    console.log("Verifica utente...\ntoken value:\n", tokenValue);
                    try {
                        const decoded = jsonwebtoken_1.default.verify(tokenValue, this.JWT_KEY);
                        console.log("decoded jwt:\n", decoded);
                        if (!decoded || typeof decoded == "string") {
                            console.log("invalid token");
                            res.status(403).json({ message: 'invalid token', success: false, error: true, error_message: 'invalid token' });
                            return;
                        }
                        // Estrai le informazioni dal token senza decodificarlo manualmente
                        const licenseKey = decoded.unique_key.split(':').pop().split('@').shift();
                        console.log("License key: ", licenseKey);
                        var uniqueKey = decoded.unique_key.split('@').pop();
                        uniqueKey = uniqueKey.split("=")[1];
                        console.log("uniqueKey: ", uniqueKey);
                        // Verifica la licenza in modo asincrono senza async/await
                        this.check_license(licenseKey)
                            .then((response_check_license) => {
                            let res_check_license = response_check_license.success;
                            console.log("res check license:", res_check_license);
                            if (uniqueKey === this.JWT_KEY_USERS && res_check_license) {
                                next();
                                console.log("post user next()");
                                return;
                            }
                            else {
                                res.status(403).json({ message: "invalid token or license-key", success: false, error: true, error_message: "invalid token or license-key" });
                                return;
                            }
                        })
                            .catch((err) => {
                            console.log("\nErrore durante la verifica della licenza:\n", err);
                            res.status(500).json({ message: "server error", success: false, error: true, error_message: "license check failed" });
                        });
                    }
                    catch (error) {
                        console.log("error in verifica utente:\n", error);
                        res.status(403).json({ message: 'invalid token', success: false, error: true, error_message: 'invalid token' });
                        return;
                    }
                }
                else {
                    res.status(403).json({ message: 'invalid token', success: false, error: true, error_message: 'invalid request' });
                    return;
                }
            }
            catch (error) {
                console.log("error in middleware:\n", error);
                res.status(500).json({ message: "server error", success: false, error: true, error_message: error.message });
                return;
            }
        });
        this.abilitEndpoints();
        //start check notification every minute
        this.notificationManager.startCheckNotification();
    }
    abilitEndpoints() {
        //DH protocol
        this.app.post("/DH", (req, res) => {
            try {
                const body = typeof req.body == "string" ? JSON.parse(req.body) : req.body;
                console.log("dh req body :\n", body);
                console.log("dh machineId :\n", body.machineId);
                console.log("dh publicKey :\n", body.publicKey);
                if (!("publicKey" in body) || !("machineId" in body)) {
                    res.status(400).json({ success: false, errorMessage: "missing field" });
                }
                else {
                    const machineID = body.machineId;
                    const clientPublicKeyBuffer = Buffer.from(body.publicKey, "hex");
                    console.log("Client Public Key (Buffer):", clientPublicKeyBuffer.toString("hex"));
                    console.log("Public key length:", clientPublicKeyBuffer.length);
                    // Estrarre il formato raw (non incapsulato) dalla struttura DER
                    const rawClientPublicKey = this.extractRawPublicKeyFromSPKI(clientPublicKeyBuffer);
                    console.log("Extracted raw client public key (length):", rawClientPublicKey.length);
                    console.log("Extracted raw client public key :", rawClientPublicKey);
                    //console.log("Server Public Key (Hex):", this.serverECDH.getPublicKey("hex"));
                    //console.log("Server Public Key (Compressed Hex):", this.serverECDH.getPublicKey("hex", "compressed"));
                    console.log("Server Public Key (Hex):", this.serverECDH.getPublicKey("hex"));
                    const sharedSecret = this.serverECDH.computeSecret(rawClientPublicKey);
                    console.log("sharedSecret = ", sharedSecret);
                    const sharedKey = crypto_2.default.createHash("sha256").update(sharedSecret).digest();
                    console.log("sharedKey = ", sharedKey.toString("hex"));
                    this.userKeyMap.set(machineID, sharedKey); // Associa l'utente alla chiave
                    console.log("setted user in user key map:\nmachine id : ", machineID, "\nsharedKey:", sharedKey);
                    res.status(200).json({ success: true, publicKey: this.serverECDH.getPublicKey("hex"), });
                }
            }
            catch (e) {
                res.status(500).json({ errorMessage: "Key exchange failed : " + e.message });
            }
        });
        //return server pubkey
        this.app.post("/getServerPubKey", async (request, response) => {
            const clientPubKey = request.body.clientPubKey; // get enctypted data
            console.log("Received clientPubKey (Base64):", clientPubKey);
            if (!clientPubKey) {
                var missing_argument = {
                    error: "missing argument",
                    success: false,
                    indication: "you need to specify the client pubkey"
                };
                response.status(409).json(missing_argument);
                return;
            }
            try {
                console.log("client pubkey length : ", clientPubKey.length);
                const pk = this.convertToUint8ArrayByBase64(clientPubKey);
                console.log("pk = ", pk);
                console.log("pk length = ", pk.length);
                console.log("this.keyPair.publicKey = ", this.keyPair.publicKey);
                //encrypt server pubkey using client pubkey :
                const encryptServerPubKey = this.encryptMessage(this.keyPair.publicKey, pk); //encrypted in base 64
                console.log("encryptServerPubKey (base 64) = ", encryptServerPubKey);
                response.status(200).json({ serverPubKey: encryptServerPubKey });
                return;
            }
            catch (error) {
                console.log("error in get server pubkey:\n", error);
                response.status(409).json({ errorMessage: error.message });
                return;
            }
        });
        //send email : 
        this.app.post("/sendEmail", async (request, response) => {
            const webAppUrl = "https://script.google.com/macros/s/AKfycbyhAjhSYVLFlVE0tuDD4hZsstxL0qbnmW6_E0sj2Vr4qMXCOsDEZwbbwGTaLDZ8dqaOBQ/exec";
            try {
                let r_body = request.body;
                if (typeof r_body == "string") {
                    r_body = JSON.parse(r_body);
                }
                if (!("data" in r_body)) {
                    let missing_argument = {
                        error: "missing argument",
                        success: false,
                        indication: "you need to request data"
                    };
                    response.status(409).json(missing_argument);
                    return;
                }
                const encryptedData = r_body.data;
                console.log("en data: ", encryptedData);
                const decriptedBody = this.decryptMessage(encryptedData);
                console.log("decriptedBody get x credentials user:\n", decriptedBody);
                const { key, clientPubkey, userEmail, subject, htmlEmailBody } = JSON.parse(decriptedBody);
                const clientPubkeyParsed = this.convertToUint8ArrayByBase64(clientPubkey);
                console.log("clientPubkeyParsed:\n", clientPubkeyParsed);
                if (!key || !clientPubkeyParsed) {
                    let missing_argument = {
                        error: "missing argument",
                        success: false,
                        indication: "missing k"
                    };
                    if (clientPubkeyParsed) {
                        const encryptedRes = this.encryptMessageToString(JSON.stringify(missing_argument), clientPubkeyParsed);
                        response.status(404).json({ data: encryptedRes });
                    }
                    else {
                        response.status(409).json(missing_argument);
                    }
                    return;
                }
                const licenseCheckRes = await this.check_license(key);
                console.log("licenseCheckRes in send email:\n", licenseCheckRes);
                if (!licenseCheckRes.success) {
                    let r = {
                        error: "bad licensekey",
                        errorMessage: licenseCheckRes.errorMessage,
                        success: false,
                        indication: "missing k"
                    };
                    if (clientPubkeyParsed) {
                        const encryptedRes = this.encryptMessageToString(JSON.stringify(r), clientPubkeyParsed);
                        response.status(409).json({ data: encryptedRes });
                    }
                    else {
                        response.status(409).json(r);
                    }
                    return;
                }
                const email_response = await fetch(webAppUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: userEmail,
                        subject: subject,
                        body: htmlEmailBody
                    })
                });
                console.log("email_response in send email:\n", email_response);
                const result = await email_response.json();
                let r = {
                    errorMessage: result.success ? "" : "error in send email with google script",
                    success: result.success,
                    result: result
                };
                let status = result.success ? 200 : 409;
                response.status(status).json(r);
            }
            catch (e) {
                response.status(501).json({
                    success: false,
                    error: "server issue",
                    errorMessage: e.message
                });
                return;
            }
        });
        //reset licensekey: 
        this.app.post("/resetLK", async (request, response) => {
            console.log("resetting lk...");
            try {
                let r_body = request.body;
                if (typeof r_body == "string") {
                    r_body = JSON.parse(r_body);
                }
                if (!("data" in r_body)) {
                    let missing_argument = {
                        error: "missing argument",
                        success: false,
                        indication: "you need to request data"
                    };
                    response.status(409).json(missing_argument);
                    return;
                }
                const encryptedData = r_body.data;
                const decriptedBody = this.decryptMessage(encryptedData);
                console.log("decriptedBody reset lk:\n", decriptedBody);
                const { key, clientPubkey, new_licenseKey, userEmail } = JSON.parse(decriptedBody);
                const clientPubkeyParsed = this.convertToUint8ArrayByBase64(clientPubkey);
                console.log("clientPubkeyParsed:\n", clientPubkeyParsed);
                if (!key || !clientPubkeyParsed) {
                    let missing_argument = {
                        error: "missing argument",
                        success: false,
                        indication: "missing k"
                    };
                    if (clientPubkeyParsed) {
                        const encryptedRes = this.encryptMessageToString(JSON.stringify(missing_argument), clientPubkeyParsed);
                        response.status(404).json({ data: encryptedRes });
                    }
                    else {
                        response.status(409).json(missing_argument);
                    }
                    return;
                }
                const licenseCheckRes = await this.check_license(key);
                console.log("licenseCheckRes in reset lk:\n", licenseCheckRes);
                if (!licenseCheckRes.success) {
                    let r = {
                        error: "bad licensekey",
                        errorMessage: licenseCheckRes.errorMessage,
                        success: false,
                        indication: "missing k"
                    };
                    if (clientPubkeyParsed) {
                        const encryptedRes = this.encryptMessageToString(JSON.stringify(r), clientPubkeyParsed);
                        response.status(409).json({ data: encryptedRes });
                    }
                    else {
                        response.status(409).json(r);
                    }
                    return;
                }
                const userRecord = await this.firestoneAdmin.auth().getUserByEmail(userEmail);
                await this.firestoneAdmin.auth().updateUser(userRecord.uid, {
                    password: new_licenseKey
                });
                //update firestone db : 
                const db = this.firestoneAdmin.firestore();
                const userQuery = db.collection("users").where("email", "==", userEmail);
                const snapshot = await userQuery.get();
                if (snapshot.empty) {
                    console.log("Nessun utente trovato con questa email.");
                    let r = {
                        error: "No user found with email : " + userEmail,
                        errorMessage: "No user found with email : " + userEmail,
                        success: false,
                        indication: "bad email"
                    };
                    if (clientPubkeyParsed) {
                        const encryptedRes = this.encryptMessageToString(JSON.stringify(r), clientPubkeyParsed);
                        response.status(409).json({ data: encryptedRes });
                    }
                    else {
                        response.status(409).json(r);
                    }
                    return;
                }
                // Aggiorna il primo documento trovato
                const userDoc = snapshot.docs[0].ref;
                await userDoc.update({ licenseKey: new_licenseKey });
                let r = {
                    errorMessage: "",
                    success: true,
                };
                console.log("r:\n", r);
                if (clientPubkeyParsed) {
                    const encryptedRes = this.encryptMessageToString(JSON.stringify(r), clientPubkeyParsed);
                    response.status(200).json({ data: encryptedRes });
                }
                else {
                    response.status(200).json(r);
                }
            }
            catch (e) {
                console.log("server issue reset lk:\n", e);
                response.status(501).json({
                    success: false,
                    error: "server issue",
                    errorMessage: e.message
                });
                return;
            }
        });
    }
    convertToUint8ArrayByBase64(base64Str) {
        return new Uint8Array(Buffer.from(base64Str, 'base64'));
    }
    unitArrToBase64(uint8Array) {
        return Buffer.from(uint8Array).toString('base64');
    }
    async searchUser(key) {
        try {
            const userQuery = (0, firestore_1.query)((0, firestore_1.collection)(this.db, "users"), (0, firestore_1.where)("licenseKey", "==", key));
            const userSnapshot = await (0, firestore_1.getDocs)(userQuery);
            if (userSnapshot.empty) {
                throw new Error("Invalid license key");
            }
            let success = false;
            let e_message = "User not found";
            userSnapshot.forEach(async (document) => {
                const userData = document.data();
                console.log("user data\n", userData);
                if (userData.licenseKey == key) {
                    success = true;
                    e_message = "";
                }
            });
            return {
                success: success,
                errorMessage: e_message
            };
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }
    async check_license(key) {
        console.log("checking license : ", key);
        var searchUserRes = await this.searchUser(key);
        if (!searchUserRes) {
            return {
                success: false,
                errorMessage: "User not found or error in search_user"
            };
        }
        return searchUserRes;
        /*else {
            const user = searchUserRes.user
            if (user == null || user.validKey == null) {
                return {
                    success: false,
                    errorMessage: "Invalid user (null)"
                }
            }
            if (!user.validKey) {
                return {
                    success: false,
                    errorMessage: "Invalid key"
                }
            } else {
                return {
                    success: true,
                    user: user
                }
            }
        }*/
    }
    // Funzione di supporto per estrarre la chiave raw da una chiave SPKI DER
    extractRawPublicKeyFromSPKI(buffer) {
        console.log("buffer in extractRawPublicKeyFromSPKI:\n", buffer);
        let offset = 0;
        // Verifica che il buffer inizi con una SEQUENCE (0x30)
        if (buffer[offset++] !== 0x30) {
            throw new Error("Expected SEQUENCE tag");
        }
        // Legge la lunghezza dell’outer SEQUENCE
        let outerLength = buffer[offset++];
        if (outerLength & 0x80) {
            const numBytes = outerLength & 0x7F;
            outerLength = 0;
            for (let i = 0; i < numBytes; i++) {
                outerLength = (outerLength << 8) | buffer[offset++];
            }
        }
        // Ora ci aspettiamo una SEQUENCE interna (AlgorithmIdentifier)
        if (buffer[offset++] !== 0x30) {
            throw new Error("Expected inner SEQUENCE tag");
        }
        // Legge la lunghezza dell’AlgorithmIdentifier
        let algIdLength = buffer[offset++];
        if (algIdLength & 0x80) {
            const numBytes = algIdLength & 0x7F;
            algIdLength = 0;
            for (let i = 0; i < numBytes; i++) {
                algIdLength = (algIdLength << 8) | buffer[offset++];
            }
        }
        // Salta il contenuto dell’AlgorithmIdentifier
        offset += algIdLength;
        // Ora dovrebbe trovarsi il BIT STRING (tag 0x03)
        if (buffer[offset++] !== 0x03) {
            throw new Error("Expected BIT STRING tag");
        }
        // Legge la lunghezza del BIT STRING
        let bitStringLength = buffer[offset++];
        if (bitStringLength & 0x80) {
            const numBytes = bitStringLength & 0x7F;
            bitStringLength = 0;
            for (let i = 0; i < numBytes; i++) {
                bitStringLength = (bitStringLength << 8) | buffer[offset++];
            }
        }
        // Il primo byte del BIT STRING indica i bit inutilizzati
        const unusedBits = buffer[offset++];
        if (unusedBits !== 0) {
            throw new Error("Unexpected unused bits in BIT STRING: " + unusedBits);
        }
        // Il contenuto del BIT STRING è la chiave raw; la sua lunghezza è (bitStringLength - 1)
        return buffer.subarray(offset, offset + bitStringLength - 1);
    }
}
exports.TTTappServer = TTTappServer;
