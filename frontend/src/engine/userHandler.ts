import { User, UserCredential } from "firebase/auth";
import { API_gestor } from "../backend-comunication/api_comunication.js";
import { prestigeLevels, userDBentry, UserPrestigeLevel } from "../types/userTypes.js";
import { baseResponse } from "../types/utilityTypes.js";



/**
 * Singleton class that model the user 
 */
export class UserHandler {
    private static instance: UserHandler;
    private apiGestor: API_gestor;
    private user: User | null = null;
    private userCredentials: UserCredential | null = null;
    private licenseKey: string;
    private userEmail: string
    private userByDB: userDBentry | null;


    private constructor(apiGestor: API_gestor) {
        this.apiGestor = apiGestor;
        this.licenseKey = "";
        this.userEmail = ""
        this.updateLocalUserInfo(true)
        this.userByDB = null;
    }


    public async getUserInfo(update = false) {
        if (update) {
            await this.updateLocalUserInfo(update);
        }
        if (!this.userByDB) {
            await this.updateLocalUserInfo(update);
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

    public async updateUserInfo(uInfo: userDBentry): Promise<baseResponse> {
        return await this.apiGestor.updateUserInfo(uInfo);
    }

    public logout(): baseResponse {
        try {

            this.user = null;
            this.licenseKey = ""
            this.userEmail = ""
            this.userByDB = null;
            return {
                success: true,
                errorMessage: ""
            }
        } catch (error:any) {
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    private async updateLocalUserInfo(forceUpdate=false) {
        const info = await this.apiGestor.getUserInfo(forceUpdate)

        console.log("info in update local user info (user handler):\n", info)
        const uInfo = info.userInfo;
        if (info.userInfo_DB) {
            this.userByDB = info.userInfo_DB
        }
        this.user = uInfo.user
        this.licenseKey = uInfo.licenseKey
        this.userEmail = uInfo.userEmail
        this.userCredentials = uInfo.userCredentials

    }

    /**
     * singleton method to get the instance
     * @returns the instance of the API gestor
     */
    public static getInstance(apiGestor: API_gestor): UserHandler {
        if (UserHandler.instance == null) {
            UserHandler.instance = new UserHandler(apiGestor)
        }

        return UserHandler.instance
    }

    // Restituisce il livello di prestigio attuale dell'utente
    public getUserPrestigeTitle(tasksCompletedQuantity: number): UserPrestigeLevel {
        const sortedLevels = [...prestigeLevels].sort((a, b) => b.minTasksCompleted - a.minTasksCompleted);

        for (const level of sortedLevels) {
            if (tasksCompletedQuantity >= level.minTasksCompleted) {
                return level;
            }
        }

        return prestigeLevels[0];
    }



}