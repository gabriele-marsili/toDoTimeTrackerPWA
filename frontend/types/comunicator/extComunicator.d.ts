import { TimeTrackerHandler, TimeTrackerRuleObj } from "../engine/timeTracker";
import { userDBentry } from "../types/userTypes";
export type PwaToExtMessageType = "UPDATE_TIME_TRACKER_RULES" | "REQUEST_TIME_TRACKER_RULES" | "PWA_READY";
export type ExtToPwaMessageType = "LIMIT_REACHED" | "TTT_EXTENSION_ID_BROADCAST" | "RULES_UPDATED_FROM_EXT" | "ASK_RULES_FROM_EXT";
type payload = {
    rules: TimeTrackerRuleObj;
};
interface PwaToExtMessage {
    type: PwaToExtMessageType;
    payload?: payload | any;
    source: 'TTT_PWA_CLIENT';
    requestId?: string;
}
export declare class ExtComunicator {
    private static instance;
    licenseKey: string;
    private isListening;
    private timeTrackerHandler;
    private messageHandlers;
    private pendingRequests;
    private requestIdCounter;
    private extID;
    private constructor();
    static getInstance(timeTrackerHandler: TimeTrackerHandler, licenseKey: string): ExtComunicator;
    private showClientSideNotification;
    private ensureNotificationPermission;
    on<T extends ExtToPwaMessageType>(messageType: T, handler: (payload: any) => void): void;
    off<T extends ExtToPwaMessageType>(messageType: T): void;
    deleteAllHandlers(): void;
    private initMessageListener;
    sendMessageToExtension(message: PwaToExtMessage): void;
    private sendMessageAndGetResponse;
    updateTTrulesInExt(rules: TimeTrackerRuleObj[]): void;
    requestTimeTrackerRules(): Promise<TimeTrackerRuleObj[]>;
    notifyPwaReady(userInfo: userDBentry): void;
}
export {};
