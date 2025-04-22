export type notificationDocData = {
    licenseKey: string;
    uId: string;
    notificationID: string;
    title: string;
    body: string;
    tag: string;
    icon: string;
    when: Date;
    fcmToken: string;
    sent: boolean;
};
export type TTT_Notification = {
    id: string;
    body: string;
    scheduleAt_timestamp: Date;
    imagePath: string;
    tag: string;
    title: string;
    fcmToken: string;
};
export declare function requestNotifyPermission(forceRequest?: boolean): Promise<boolean>;
