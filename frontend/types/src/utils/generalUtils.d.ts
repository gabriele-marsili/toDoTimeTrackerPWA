export declare function generateLicenseKey(): string;
export declare function delay(ms: number): Promise<void>;
export declare function getDeviceId(): Promise<string>;
export declare function hashPassword(password: string): Promise<Uint8Array>;
export declare const SW_BROADCAST_CHANNEL = "service_worker_channel";
export declare function parseDate(date: Date): string;
export declare function minToParsedTime(min: number): string;
