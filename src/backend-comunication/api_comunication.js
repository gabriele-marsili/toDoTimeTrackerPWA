import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { analytics, auth, db } from "./firebase";
import { generateLicenseKey } from "../utils/generalUtils";
/**
 * singleton class to interact with the backend via API
 */
export class API_gestor {
    static instance;
    auth;
    db;
    analytics;
    user = null;
    userCredentials = null;
    licenseKey;
    constructor() {
        this.auth = auth;
        this.db = db;
        this.analytics = analytics;
        this.licenseKey = "";
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
            });
            this.licenseKey = licenseKey;
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
    async checkIfUserExist(licenseKey) {
        const docRef = doc(collection(this.db, "users"), licenseKey);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    }
}
