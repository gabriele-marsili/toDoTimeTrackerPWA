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