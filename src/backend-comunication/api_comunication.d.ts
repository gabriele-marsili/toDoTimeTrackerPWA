import { userRegistrationForm } from "../types/userTypes";
import { baseResponse } from "../types/utilityTypes";
/**
 * singleton class to interact with the backend via API
 */
export declare class API_gestor {
    private static instance;
    private auth;
    private db;
    private analytics;
    private user;
    private userCredentials;
    private licenseKey;
    private constructor();
    /**
     * singleton method to get the instance
     * @returns the instance of the API gestor
     */
    static getInstance(): API_gestor;
    checkUniqueEmailAndUsername(email: string, username: string): Promise<baseResponse>;
    registerUser(userForm: userRegistrationForm): Promise<baseResponse>;
    private checkIfUserExist;
}
