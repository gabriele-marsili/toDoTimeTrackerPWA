import { ToDoObj } from "../engine/toDoEngine";
import { Timestamp as firestoreTimestamp } from "firebase/firestore";

export const VAPID_PUB_KEY = 'BFeFiK9dB7L-JJqRrql83EdAIQ3MOlaHaQYKlM_AZ3m4dSIGNxQy5_Wdthd7_IP-U8wZEyJl4e5gheTsR4ys78o'
export const MAIN_LOGO_URL = "https://i.imgur.com/ROIfwjw.png"

export function generateLicenseKey(): string {
    return Array.from({ length: 4 }, () =>
        Math.random().toString(36).substring(2, 6).toUpperCase()
    ).join("-");
}

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getDeviceId(): Promise<string> {
    try {
        let id = localStorage.getItem("deviceId");
        if (!id) {
            id = crypto.randomUUID(); // Genera un UUID
            localStorage.setItem("deviceId", id);
        }
        return id;
    } catch (error) {
        console.error("Error generating device ID:", error);
        throw error;
    }
}

export async function hashPassword(password: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(hashBuffer);
}

export const SW_BROADCAST_CHANNEL = "service_worker_channel"

export function formatDate(d: Date): string {
    console.log("d in format date:\n", d)
    const pad = (n: number) => n.toString().padStart(2, '0');
    const res = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} : ${pad(d.getHours())}.${pad(d.getMinutes())}`;
    console.log("res in format date:\n", res)
    return res
}

export function parseStringToDate(dateString: string): Date {

    const [datePart, timePart] = dateString.split(' : ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split('.').map(Number);

    return new Date(year, month - 1, day, hours, minutes);

}


export function minToParsedTime(min: number) {
    let h = parseInt(String(min / 60));
    let m = parseInt(String(min % 60));
    return `${h} H and ${m} min`
}

export function isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}


export function parseActionDates(action: ToDoObj) {
    let firestoreDateWithTime = action.dateWithTime as unknown as firestoreTimestamp
    action.dateWithTime = firestoreDateWithTime.toDate()

    let firestorenotifyDate = action.notifyDate as unknown as firestoreTimestamp
    action.notifyDate = firestorenotifyDate.toDate()

    let firestore_expiration = action.expiration as unknown as firestoreTimestamp
    action.expiration = firestore_expiration.toDate()

    let completionFirestoreDate = action.completionDate as unknown as firestoreTimestamp
    action.completionDate = completionFirestoreDate.toDate()

    for(let a of action.subActions){
        parseActionDates(a)
    }
}