import { prestigeLevels } from "../types/userTypes.js";
/**
 * Singleton class that model the user
 */
export class UserHandler {
    static instance;
    apiGestor;
    user = null;
    userCredentials = null;
    licenseKey;
    userEmail;
    userByDB;
    constructor(apiGestor) {
        this.apiGestor = apiGestor;
        this.licenseKey = "";
        this.userEmail = "";
        this.updateLocalUserInfo();
    }
    getUserInfo(update = false) {
        if (update) {
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
        };
    }
    async updateUserInfo(uInfo) {
        return await this.apiGestor.updateUserInfo(uInfo);
    }
    updateLocalUserInfo() {
        const info = this.apiGestor.getUserInfo();
        const uInfo = info.userInfo;
        this.userByDB = info.userInfo_DB;
        this.user = uInfo.user;
        this.licenseKey = uInfo.licenseKey;
        this.userEmail = uInfo.userEmail;
        this.userCredentials = uInfo.userCredentials;
    }
    /**
     * singleton method to get the instance
     * @returns the instance of the API gestor
     */
    static getInstance(apiGestor) {
        if (UserHandler.instance == null) {
            UserHandler.instance = new UserHandler(apiGestor);
        }
        return UserHandler.instance;
    }
    // Restituisce il livello di prestigio attuale dell'utente
    getUserPrestigeTitle(tasksCompletedQuantity) {
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
