import { Analytics } from "firebase/analytics";
import { Auth, createUserWithEmailAndPassword, User, UserCredential } from "firebase/auth";
import { collection, doc, Firestore, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { analytics, auth, db } from "./firebase";
import { userRegistrationForm } from "../types/userTypes";
import { generateLicenseKey } from "../utils/generalUtils";
import { baseResponse } from "../types/utilityTypes";

/**
 * singleton class to interact with the backend via API
 */
export class API_gestor {
    private static instance: API_gestor;

    private auth: Auth
    private db: Firestore
    private analytics: Analytics
    private user: User | null = null;
    private userCredentials: UserCredential | null = null;
    private licenseKey : string;
    private constructor() {
        this.auth = auth;
        this.db = db;
        this.analytics = analytics;
        this.licenseKey = ""
    }   

    /**
     * singleton method to get the instance
     * @returns the instance of the API gestor
     */
    public static getInstance(): API_gestor {
        if (API_gestor.instance == null) {
            API_gestor.instance = new API_gestor()
        }

        return API_gestor.instance
    }



    public async checkUniqueEmailAndUsername(email: string, username: string): Promise<baseResponse> {
        try {
            console.log("Checking email:", email, "and username:", username);

            // Verifica se l'email è già presente
            const emailQuery = query(
                collection(this.db, "users"),
                where("email", "==", email)
            );
            const emailSnapshot = await getDocs(emailQuery);
            if (!emailSnapshot.empty) {
                throw new Error("Email already in use");
            }

            // Verifica se lo username è già presente
            const usernameQuery = query(
                collection(this.db, "users"),
                where("username", "==", username)
            );
            const usernameSnapshot = await getDocs(usernameQuery);
            if (!usernameSnapshot.empty) {
                throw new Error("Username already in use");
            }

            return { success: true, errorMessage: "" };
        } catch (error: any) {
            return { success: false, errorMessage: error.message };
        }
    }



    public async registerUser(userForm: userRegistrationForm): Promise<baseResponse> {
        try {
            let licenseKey = generateLicenseKey()
            while (await this.checkIfUserExist(licenseKey)) { //ensures uniqueness
                licenseKey = generateLicenseKey()
            }
            console.log("chosen license key = ",licenseKey)
            const userCredential = await createUserWithEmailAndPassword(this.auth, userForm.email, licenseKey);
            const user = userCredential.user;
            this.user = user;
            this.userCredentials = userCredential;
            console.log("registered user:\n", user)
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
            }
        } catch (error: any) {
            console.log("error while registering user:\n", error);
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    private async checkIfUserExist(licenseKey: string): Promise<boolean> {
        const docRef = doc(collection(this.db, "users"), licenseKey);
        const docSnap = await getDoc(docRef)
        return docSnap.exists()
    }

}