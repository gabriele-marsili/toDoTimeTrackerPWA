import { User, UserCredential } from "firebase/auth";
import { API_gestor } from "../backend-comunication/api_comunication.js";
import { userDBentry, UserPrestigeLevel } from "../types/userTypes.js";
import { baseResponse } from "../types/utilityTypes.js";
/**
 * Singleton class that model the user
 */
export declare class UserHandler {
    private static instance;
    private apiGestor;
    private user;
    private userCredentials;
    private licenseKey;
    private userEmail;
    private userByDB;
    private constructor();
    getUserInfo(update?: boolean): {
        userInfo: {
            licenseKey: string;
            user: User | null;
            userCredentials: UserCredential | null;
            userEmail: string;
        };
        userInfo_DB: userDBentry;
    };
    updateUserInfo(uInfo: userDBentry): Promise<baseResponse>;
    private updateLocalUserInfo;
    /**
     * singleton method to get the instance
     * @returns the instance of the API gestor
     */
    static getInstance(apiGestor: API_gestor): UserHandler;
    getUserPrestigeTitle(tasksCompletedQuantity: number): UserPrestigeLevel;
}
