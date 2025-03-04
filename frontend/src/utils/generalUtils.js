export function generateLicenseKey() {
    return Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join("-");
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
