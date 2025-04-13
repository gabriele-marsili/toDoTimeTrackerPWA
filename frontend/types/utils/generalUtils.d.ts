export declare function generateLicenseKey(): string;
export declare function delay(ms: number): Promise<void>;
export declare function getDeviceId(): Promise<string>;
export declare function hashPassword(password: string): Promise<Uint8Array>;
export declare const SW_BROADCAST_CHANNEL = "service_worker_channel";
export declare function formatDate(d: Date): string;
export declare function parseStringToDate(dateString: string): Date;
export declare function minToParsedTime(min: number): string;
export declare function isToday(date: Date): boolean;
