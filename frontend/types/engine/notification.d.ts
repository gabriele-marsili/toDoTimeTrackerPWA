export declare class TTT_Notification {
    id: string;
    text: string;
    scheduleAt: Date;
    private imagePath;
    tag?: string;
    constructor(id: string, text: string, scheduleAt: Date, imagePath?: string, tag?: string);
}
export declare function requestNotifyPermission(forceRequest?: boolean): Promise<boolean>;
