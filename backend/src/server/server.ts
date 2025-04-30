import cron from 'node-cron';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import path from 'path';
import express, { Request as expressRequest, Response as expressResponse, NextFunction } from 'express'
import { machineIdSync } from 'node-machine-id';
import sodium from 'libsodium-wrappers';
import { createHash } from 'crypto';
import crypto from "crypto";
import { collection, Firestore, getDocs, query, where } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { auth, db, initializedFirestonAdmin } from '../firebase/firebase';
import cors from 'cors';
import { app } from 'firebase-admin';
import { NotificationManager } from '../notificationEngine/notificationManager';
import { updateDailyShop } from '../engine/shopEngine';


/**
 * Singleton class to handle the server services
 */
export class TTTappServer {
    private static instance: TTTappServer | null = null;
    private PORT = 3042;
    private app = express()
    private JWT_KEY: string;
    private JWT_KEY_USERS: string;
    private keyFilePath: string = path.join(__dirname, 'keyFile.json');
    private keyPair!: { publicKey: Uint8Array; privateKey: Uint8Array };
    private serverECDH: crypto.ECDH;
    private userKeyMap = new Map<string, Buffer>();

    private auth: Auth
    private db: Firestore
    private firestoneAdmin: app.App

    private notificationManager : NotificationManager

    private constructor() {
        dotenv.config({ path: path.join(__dirname, "server.env") });

        this.auth = auth;
        this.db = db;
        this.firestoneAdmin = initializedFirestonAdmin;

        this.notificationManager = NotificationManager.getInstance()

        this.JWT_KEY = process.env.JWT_KEY || "JWT_KEY not loaded"
        this.JWT_KEY_USERS = process.env.JWT_KEY_USERS || "JWT_KEY_USERS not loaded"
        console.log("this.JWT_KEY_USERS = ", this.JWT_KEY_USERS)
        console.log("this.JWT_KEY = ", this.JWT_KEY)
        this.check(this.JWT_KEY)
        this.check(this.JWT_KEY_USERS)

        this.serverECDH = crypto.createECDH("prime256v1");
        this.serverECDH.generateKeys();
        console.log("ecdh creato")

        sodium.ready.then(() => {
            this.loadOrGenerateKeyPair();

            this.app.use(cors());
            this.app.use(express.json()) // for parsing application/json

            this.start()

        });
    }

    /**
     * Load / generate keyPair (pub & private key)
     */
    private loadOrGenerateKeyPair() {
        const mID = machineIdSync()
        if (fs.existsSync(this.keyFilePath)) { //get keypair and dectipt it 
            const encryptedKeyData: {
                publicKey: { nonce: string, encrypted: string },
                privateKey: { nonce: string, encrypted: string },

            } = JSON.parse(fs.readFileSync(this.keyFilePath, 'utf-8'));


            console.log("encryptedKeyData = ", encryptedKeyData)

            const decryptedPubKey = this.decryptKey(encryptedKeyData.publicKey, mID);
            const decryptedPrivateKey = this.decryptKey(encryptedKeyData.privateKey, mID);
            console.log("decryptedPubKey = ", decryptedPubKey)
            console.log("decryptedPrivateKey = ", decryptedPrivateKey)

            this.keyPair = {
                privateKey: decryptedPrivateKey,
                publicKey: decryptedPubKey
            }

        } else {
            const password = machineIdSync();
            const hashedPassword = createHash('sha256').update(password).digest();
            this.keyPair = sodium.crypto_box_seed_keypair(hashedPassword);
            console.log("this.keyPair.privateKey = ", this.keyPair.privateKey)
            console.log("this.keyPair.publicKey = ", this.keyPair.publicKey)


            //encrypt and got base 64 str
            const encryptedPrivateKey = this.encryptKey(
                this.keyPair.privateKey,
                mID
            );
            const encryptedPublicKey = this.encryptKey(
                this.keyPair.publicKey,
                mID
            );

            const d = {
                publicKey: encryptedPublicKey,
                privateKey: encryptedPrivateKey,
            }
            fs.writeFileSync(this.keyFilePath, JSON.stringify(d), 'utf8');
        }
    }

    // --- security : 
    private encryptKey(data: Uint8Array, password: string): {
        nonce: string,
        encrypted: string
    } {
        const key = createHash('sha256').update(password).digest(); // Ottieni un buffer da 32 byte
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES); // Genera un nonce casuale di 24 byte

        const encrypted = sodium.crypto_secretbox_easy(data, nonce, key);

        return {
            nonce: this.unitArrToBase64(nonce),
            encrypted: this.unitArrToBase64(encrypted)
        };
    }

    private decryptKey(data: {
        nonce: string,
        encrypted: string
    }, password: string): Uint8Array {
        const key = createHash('sha256').update(password).digest(); // Ottieni un buffer da 32 byte

        return sodium.crypto_secretbox_open_easy(
            Buffer.from(data.encrypted, 'base64'),
            Buffer.from(data.nonce, 'base64'),
            key
        );
    }


    private encryptMessage(message: Uint8Array | string, publicKey: Uint8Array): string {
        if (typeof message == "string") {
            message = this.convertToUint8ArrayByBase64(message)
        }
        return Buffer.from(sodium.crypto_box_seal(message, publicKey)).toString('base64');
    }

    private encryptMessageToString(message: string, publicKey: Uint8Array | string): string { // enctypt with client pubkey 
        if (typeof publicKey == "string") {
            publicKey = this.convertToUint8ArrayByBase64(publicKey)
        }
        return Buffer.from(sodium.crypto_box_seal(message, publicKey)).toString('base64');
    }

    private decryptMessage(encryptedMessage: string): string {
        const decryptedUint8Array = sodium.crypto_box_seal_open(
            Buffer.from(encryptedMessage, 'base64'),
            this.keyPair.publicKey,
            this.keyPair.privateKey
        );

        if (!decryptedUint8Array) {
            throw new Error("Decryption failed");
        }

        return Buffer.from(decryptedUint8Array).toString('utf-8'); // Converte in stringa
    }


    private AES_decrypt(key: Buffer, iv: string, encryptedData: string, authTag: string): string {
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));

        decipher.setAuthTag(Buffer.from(authTag, "hex"));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedData, "hex")),
            decipher.final()
        ]);

        return decrypted.toString("utf8");
    };

    /**
     * singleton method to get the instance 
     * @returns the instance 
     */
    public static getInstance(): TTTappServer {
        if (TTTappServer.instance == null) {
            TTTappServer.instance = new TTTappServer()
        }

        return TTTappServer.instance;
    }

    private check(s: string): void {
        if (s.includes("not loaded")) {
            throw new Error(s);
        }
    }

    private start(): void {
        this.app.listen(this.PORT, () => {
            console.log(`API listening at http://localhost:${this.PORT}`)
        })

        // Middleware per verificare il token JWT
        this.app.use((req: expressRequest, res: expressResponse, next: NextFunction): void => {
            try {
                const encryptedToken = req.headers.authorization;
                console.log("Token (encrypted) :\n", encryptedToken)
                //console.log("req BEFORE middleware :\n", req)
                console.log("req query  :\n", req.query)
                //console.log("req headers  :\n", req.headers)
                const type = req.query["type"] as string;
                let r_body = req.body
                if (typeof r_body == "string") {
                    r_body = JSON.parse(r_body)
                }

                console.log("req path:\n", req.path)
                console.log("r_body:\n", r_body)

                if (!(req.path == "/DH" || req.path == " /DH" || req.path == " /getServerPubKey") && ((!encryptedToken) || !("machineId" in r_body) || !("iv" in req.headers))) {
                    console.log("m f")
                    res.status(401).json({ message: 'missing field', success: false, error: true, error_message: 'missing field' });
                    return;
                }



                if (req.path === "/DH" || req.path === " /DH" || req.path == " /getServerPubKey" || req.path == "/getServerPubKey") {
                    next()
                }
                else if (type == "user" && encryptedToken) { // => verifica utente

                    //dectypt token
                    console.log("req.headers:\n", req.headers)
                    const userMachineId = r_body.machineId
                    const iv = req.headers.iv as string;
                    const authTag = req.headers.authtag as string;
                    const userKey = this.userKeyMap.get(userMachineId)
                    console.log("\nuser verification:\nuserMachineId : ", userMachineId)
                    console.log("iv:\n ", iv)
                    console.log("authTag:\n ", authTag)
                    console.log("userKey:\n ", userKey)

                    if (!userKey) {
                        res.status(401).json({ message: 'user key not found', success: false, error: true, error_message: 'user key not found' });
                        return;
                    }
                    const encryptedTokenValue = encryptedToken.split(' ')[1];
                    console.log("encryptedTokenValue = ", encryptedTokenValue)
                    console.log("userKey str = ", userKey.toString())
                    const tokenValue = this.AES_decrypt(userKey, iv, encryptedTokenValue, authTag);

                    console.log("Verifica utente...\ntoken value:\n", tokenValue);
                    try {
                        const decoded = jwt.verify(tokenValue, this.JWT_KEY);
                        console.log("decoded jwt:\n", decoded);

                        if (!decoded || typeof decoded == "string") {
                            console.log("invalid token")
                            res.status(403).json({ message: 'invalid token', success: false, error: true, error_message: 'invalid token' });
                            return;

                        }

                        // Estrai le informazioni dal token senza decodificarlo manualmente
                        const licenseKey = decoded.unique_key.split(':').pop().split('@').shift();
                        console.log("License key: ", licenseKey)
                        var uniqueKey = decoded.unique_key.split('@').pop();
                        uniqueKey = uniqueKey.split("=")[1]
                        console.log("uniqueKey: ", uniqueKey)

                        // Verifica la licenza in modo asincrono senza async/await
                        this.check_license(licenseKey)
                            .then((response_check_license) => {
                                let res_check_license = response_check_license.success;
                                console.log("res check license:", res_check_license);

                                if (uniqueKey === this.JWT_KEY_USERS && res_check_license) {
                                    next();
                                    console.log("post user next()")
                                    return;
                                } else {
                                    res.status(403).json({ message: "invalid token or license-key", success: false, error: true, error_message: "invalid token or license-key" });
                                    return;
                                }
                            })
                            .catch((err) => {
                                console.log("\nErrore durante la verifica della licenza:\n", err);
                                res.status(500).json({ message: "server error", success: false, error: true, error_message: "license check failed" });
                            });


                    } catch (error) {
                        console.log("error in verifica utente:\n", error)
                        res.status(403).json({ message: 'invalid token', success: false, error: true, error_message: 'invalid token' });
                        return;

                    }
                } else {
                    res.status(403).json({ message: 'invalid token', success: false, error: true, error_message: 'invalid request' });
                    return;

                }

            } catch (error: any) {
                console.log("error in middleware:\n", error)
                res.status(500).json({ message: "server error", success: false, error: true, error_message: error.message });
                return;

            }

        });

        this.abilitEndpoints()

        //start check notification every minute
        this.notificationManager.startCheckNotification()
        //start update shop every day at 00.00
        this.startUpdateShop()
    }

    private abilitEndpoints(): void {

        //DH protocol
        this.app.post("/DH", (req, res) => {
            try {
                const body = typeof req.body == "string" ? JSON.parse(req.body) : req.body;
                console.log("dh req body :\n", body)
                console.log("dh machineId :\n", body.machineId)
                console.log("dh publicKey :\n", body.publicKey)
                if (!("publicKey" in body) || !("machineId" in body)) {
                    res.status(400).json({ success: false, errorMessage: "missing field" });
                } else {
                    const machineID: string = body.machineId;
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
                    console.log("sharedSecret = ", sharedSecret)
                    const sharedKey = crypto.createHash("sha256").update(sharedSecret).digest();
                    console.log("sharedKey = ", sharedKey.toString("hex"))

                    this.userKeyMap.set(machineID, sharedKey); // Associa l'utente alla chiave
                    console.log("setted user in user key map:\nmachine id : ", machineID, "\nsharedKey:", sharedKey)
                    res.status(200).json({ success: true, publicKey: this.serverECDH.getPublicKey("hex"), });
                }
            } catch (e: any) {
                res.status(500).json({ errorMessage: "Key exchange failed : " + e.message });
            }
        });

        //return server pubkey
        this.app.post("/getServerPubKey", async (request, response) => {
            const clientPubKey = request.body.clientPubKey as string // get enctypted data
            console.log("Received clientPubKey (Base64):", clientPubKey);
            if (!clientPubKey) {
                var missing_argument = {
                    error: "missing argument",
                    success: false,
                    indication: "you need to specify the client pubkey"
                }
                response.status(409).json(missing_argument)
                return;
            }


            try {
                console.log("client pubkey length : ", clientPubKey.length)
                const pk = this.convertToUint8ArrayByBase64(clientPubKey)
                console.log("pk = ", pk);
                console.log("pk length = ", pk.length);
                console.log("this.keyPair.publicKey = ", this.keyPair.publicKey)

                //encrypt server pubkey using client pubkey :
                const encryptServerPubKey = this.encryptMessage(this.keyPair.publicKey, pk); //encrypted in base 64
                console.log("encryptServerPubKey (base 64) = ", encryptServerPubKey)

                response.status(200).json({ serverPubKey: encryptServerPubKey })
                return;


            } catch (error: any) {
                console.log("error in get server pubkey:\n", error)
                response.status(409).json({ errorMessage: error.message })
                return;

            }
        })

        //send email : 
        this.app.post("/sendEmail", async (request: any, response: any) => {
            const webAppUrl = "https://script.google.com/macros/s/AKfycbyhAjhSYVLFlVE0tuDD4hZsstxL0qbnmW6_E0sj2Vr4qMXCOsDEZwbbwGTaLDZ8dqaOBQ/exec";
            try {
                let r_body = request.body
                if (typeof r_body == "string") {
                    r_body = JSON.parse(r_body)
                }

                if (!("data" in r_body)) {
                    let missing_argument = {
                        error: "missing argument",
                        success: false,
                        indication: "you need to request data"
                    }
                    response.status(409).json(missing_argument)
                    return;
                }

                const encryptedData = r_body.data
                console.log("en data: ", encryptedData)
                const decriptedBody = this.decryptMessage(encryptedData)
                console.log("decriptedBody get x credentials user:\n", decriptedBody)
                const { key, clientPubkey, userEmail, subject, htmlEmailBody } = JSON.parse(decriptedBody)
                const clientPubkeyParsed = this.convertToUint8ArrayByBase64(clientPubkey);
                console.log("clientPubkeyParsed:\n", clientPubkeyParsed)
                if (!key || !clientPubkeyParsed) {
                    let missing_argument = {
                        error: "missing argument",
                        success: false,
                        indication: "missing k"
                    }

                    if (clientPubkeyParsed) {
                        const encryptedRes = this.encryptMessageToString(JSON.stringify(missing_argument), clientPubkeyParsed)
                        response.status(404).json({ data: encryptedRes })
                    } else {
                        response.status(409).json(missing_argument)
                    }

                    return;
                }

                const licenseCheckRes = await this.check_license(key)
                console.log("licenseCheckRes in send email:\n", licenseCheckRes)
                if (!licenseCheckRes.success) {
                    let r = {
                        error: "bad licensekey",
                        errorMessage: licenseCheckRes.errorMessage,
                        success: false,
                        indication: "missing k"
                    }

                    if (clientPubkeyParsed) {
                        const encryptedRes = this.encryptMessageToString(JSON.stringify(r), clientPubkeyParsed)
                        response.status(409).json({ data: encryptedRes })
                    } else {
                        response.status(409).json(r)
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
                console.log("email_response in send email:\n", email_response)

                const result = await email_response.json();
                let r = {
                    errorMessage: result.success ? "" : "error in send email with google script",
                    success: result.success,
                    result: result
                }
                let status = result.success ? 200 : 409
                response.status(status).json(r)


            } catch (e: any) {
                response.status(501).json({
                    success: false,
                    error: "server issue",
                    errorMessage: e.message
                })
                return;
            }
        })

        //reset licensekey: 
        this.app.post("/resetLK", async (request: any, response: any) => {
            console.log("resetting lk...")
            try {
                let r_body = request.body
                if (typeof r_body == "string") {
                    r_body = JSON.parse(r_body)
                }

                if (!("data" in r_body)) {
                    let missing_argument = {
                        error: "missing argument",
                        success: false,
                        indication: "you need to request data"
                    }
                    response.status(409).json(missing_argument)
                    return;
                }

                const encryptedData = r_body.data                
                const decriptedBody = this.decryptMessage(encryptedData)
                console.log("decriptedBody reset lk:\n", decriptedBody)
                const { key, clientPubkey, new_licenseKey, userEmail } = JSON.parse(decriptedBody)
                const clientPubkeyParsed = this.convertToUint8ArrayByBase64(clientPubkey);
                console.log("clientPubkeyParsed:\n", clientPubkeyParsed)
                if (!key || !clientPubkeyParsed) {
                    let missing_argument = {
                        error: "missing argument",
                        success: false,
                        indication: "missing k"
                    }

                    if (clientPubkeyParsed) {
                        const encryptedRes = this.encryptMessageToString(JSON.stringify(missing_argument), clientPubkeyParsed)
                        response.status(404).json({ data: encryptedRes })
                    } else {
                        response.status(409).json(missing_argument)
                    }

                    return;
                }

                const licenseCheckRes = await this.check_license(key)
                console.log("licenseCheckRes in reset lk:\n", licenseCheckRes)
                if (!licenseCheckRes.success) {
                    let r = {
                        error: "bad licensekey",
                        errorMessage: licenseCheckRes.errorMessage,
                        success: false,
                        indication: "missing k"
                    }

                    if (clientPubkeyParsed) {
                        const encryptedRes = this.encryptMessageToString(JSON.stringify(r), clientPubkeyParsed)
                        response.status(409).json({ data: encryptedRes })
                    } else {
                        response.status(409).json(r)
                    }

                    return;
                }

                const userRecord = await this.firestoneAdmin.auth().getUserByEmail(userEmail)
                await this.firestoneAdmin.auth().updateUser(userRecord.uid, {
                    password: new_licenseKey
                })

                //update firestone db : 
                const db = this.firestoneAdmin.firestore()
                const userQuery = db.collection("users").where("email", "==", userEmail);
                const snapshot = await userQuery.get();
        
                if (snapshot.empty) {
                    console.log("Nessun utente trovato con questa email.");
                    
                    let r = {
                        error: "No user found with email : "+userEmail,
                        errorMessage: "No user found with email : "+userEmail,
                        success: false,
                        indication: "bad email"
                    }

                    if (clientPubkeyParsed) {
                        const encryptedRes = this.encryptMessageToString(JSON.stringify(r), clientPubkeyParsed)
                        response.status(409).json({ data: encryptedRes })
                    } else {
                        response.status(409).json(r)
                    }

                    return;
                }
        
                // Aggiorna il primo documento trovato
                const userDoc = snapshot.docs[0].ref;
                await userDoc.update({ licenseKey: new_licenseKey });
        

                let r = {
                    errorMessage: "",
                    success: true,
                }
                console.log("r:\n",r)
                if (clientPubkeyParsed) {
                    const encryptedRes = this.encryptMessageToString(JSON.stringify(r), clientPubkeyParsed)
                    response.status(200).json({ data: encryptedRes })
                } else {
                    response.status(200).json(r)
                }
                


            } catch (e: any) {
                console.log("server issue reset lk:\n",e)
                response.status(501).json({
                    success: false,
                    error: "server issue",
                    errorMessage: e.message
                })
                return;
            }
        })

    }


    private convertToUint8ArrayByBase64(base64Str: string): Uint8Array {
        return new Uint8Array(Buffer.from(base64Str, 'base64'));
    }

    private unitArrToBase64(uint8Array: Uint8Array): string {
        return Buffer.from(uint8Array).toString('base64');
    }

    private async searchUser(key: string): Promise<{
        success: boolean,
        errorMessage: string
        //user? : to do 
    }> {
        try {

            const userQuery = query(
                collection(this.db, "users"),
                where("licenseKey", "==", key)
            );

            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                throw new Error("Invalid license key");
            }

            let success = false
            let e_message = "User not found"
            userSnapshot.forEach(async (document) => {
                const userData = document.data()
                console.log("user data\n", userData)
                if (userData.licenseKey == key) {
                    success = true
                    e_message = ""
                }
            })

            return {
                success: success,
                errorMessage: e_message
            }

        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message
            }
        }


    }

    private async check_license(key: string) {
        console.log("checking license : ", key)
        var searchUserRes = await this.searchUser(key);
        if (!searchUserRes) {
            return {
                success: false,
                errorMessage: "User not found or error in search_user"
            }
        }
        return searchUserRes

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
    private extractRawPublicKeyFromSPKI(buffer: Buffer): Buffer {
        console.log("buffer in extractRawPublicKeyFromSPKI:\n", buffer)
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


    private startUpdateShop(){ //run every day at 00:00 
        cron.schedule("0 0 * * *",async ()=>{
            await updateDailyShop()
        })
    }

}


