import { userRegistrationForm } from "../types/userTypes";
import { baseResponse } from "../types/utilityTypes";
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
    checkUniqueEmailAndUsername(email: string, username: string): Promise<baseResponse>;
    registerUser(userForm: userRegistrationForm): Promise<baseResponse>;
    loginWithLicenseKey(licenseKey: string): Promise<baseResponse>;
    logOut(): Promise<baseResponse>;
    private checkIfUserExist;
    getUserByEmail(email: string): Promise<{
        success: boolean;
        errorMessage: string;
        data: any;
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
}
