export declare function generateLicenseKey(): string;
export declare function delay(ms: number): Promise<void>;
export declare function getDeviceId(): Promise<string>;
export declare function hashPassword(password: string): Promise<Uint8Array>;
