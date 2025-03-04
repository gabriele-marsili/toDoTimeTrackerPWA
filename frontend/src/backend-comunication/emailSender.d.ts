import { baseResponse } from '../types/utilityTypes';
export declare class EmailSender {
    private static instance;
    private constructor();
    static getInstance(): EmailSender;
    private sendEmail;
    /**
     * 1) Registration confirmation email with the license key
     */
    sendRegistrationConfirmationEmail(licenseKey: string, username: string, userEmail: string): Promise<baseResponse>;
    /**
     * 2) License key reminder email
     */
    sendLicenseReminderEmail(licenseKey: string, username: string, userEmail: string): Promise<baseResponse>;
    /**
     * 3) Reset license key email with creation of a new license key
     */
    sendResetLicenseKeyEmail(newLicenseKey: string, username: string, userEmail: string): Promise<baseResponse>;
    /**
     * 4) Account deletion confirmation email
     */
    sendAccountDeletionConfirmationEmail(username: string, userEmail: string): Promise<baseResponse>;
}
