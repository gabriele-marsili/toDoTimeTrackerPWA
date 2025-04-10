export function generateLicenseKey() {
    return Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join("-");
}
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function getDeviceId() {
    try {
        let id = localStorage.getItem("deviceId");
        if (!id) {
            id = crypto.randomUUID(); // Genera un UUID
            localStorage.setItem("deviceId", id);
        }
        return id;
    }
    catch (error) {
        console.error("Error generating device ID:", error);
        throw error;
    }
}
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(hashBuffer);
}
export const SW_BROADCAST_CHANNEL = "service_worker_channel";
export function parseDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
}
export function minToParsedTime(min) {
    let h = parseInt(String(min / 60));
    let m = parseInt(String(min % 60));
    return `${h} H and ${m} min`;
}
