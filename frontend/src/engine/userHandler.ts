import { User, UserCredential } from "firebase/auth";
import { API_gestor } from "../backend-comunication/api_comunication";
import { prestigeLevels, userDBentry, UserPrestigeLevel } from "../types/userTypes";
import { baseResponse } from "../types/utilityTypes";



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
    private userByDB!: userDBentry;


    private constructor(apiGestor: API_gestor) {
        this.apiGestor = apiGestor;
        this.licenseKey = "";
        this.userEmail = ""
        this.updateLocalUserInfo()
    }


    public getUserInfo(update=false){
        if(update){
            this.updateLocalUserInfo();
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

    private updateLocalUserInfo() {
        const info = this.apiGestor.getUserInfo()
        const uInfo = info.userInfo;
        this.userByDB = info.userInfo_DB
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
        // Ordina i livelli dal più alto al più basso (per trovare il livello massimo raggiunto)
        const sortedLevels = [...prestigeLevels].sort((a, b) => b.minTasksCompleted - a.minTasksCompleted);

        // Trova il primo livello per cui l'utente ha abbastanza task completati
        for (const level of sortedLevels) {
            if (tasksCompletedQuantity >= level.minTasksCompleted) {
                return level;
            }
        }

        // In caso di errore o valore negativo, ritorna il primo livello (fallback)
        return prestigeLevels[0];
    }



}