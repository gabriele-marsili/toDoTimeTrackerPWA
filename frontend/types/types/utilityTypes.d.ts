export type baseResponse = {
    success: boolean;
    errorMessage: string;
};
export type broadcastMessageType = "offline";
export type broadcastChannelMessage = {
    type: broadcastMessageType;
    content: any;
};
export type firestoneDate = {
    seconds: number;
    nanoseconds: number;
};
