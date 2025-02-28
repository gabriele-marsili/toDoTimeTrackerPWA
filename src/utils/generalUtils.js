export function generateLicenseKey() {
    return Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join("-");
}
console.log("key = ", generateLicenseKey());
