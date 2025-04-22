import { ToDoAction, ToDoObj, ToDoPriority } from '../engine/toDoEngine';
import { UserHandler } from '../engine/userHandler';
import { userDBentry } from '../types/userTypes';
declare const _default: import("vue").DefineComponent<{}, {
    handleCalendarEvent: (eventContent: {
        type: string;
        newEventsQuantity: number;
    }) => void;
    handleToDoEvent: (eventContent: {
        type: string;
        newToDoQuantity: number;
        karmaCoinsChange: undefined | number;
    }) => Promise<void>;
    askToDo: () => Promise<void>;
    askUserInfo: () => Promise<void>;
    userInfo: import("vue").Ref<{
        age: number;
        categories: {
            name: string;
            points: number;
        }[];
        createdAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        licenseIsValid: boolean;
        licenseKey: string;
        notifications: boolean;
        permissions: boolean;
        phone: string;
        timeTrackerActive: boolean;
        username: string;
        karmaCoinsBalance: number;
        friends: {
            username: string;
            email: string;
        }[];
        avatarImagePath: string;
        fcmToken: string;
    }, userDBentry | {
        age: number;
        categories: {
            name: string;
            points: number;
        }[];
        createdAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        licenseIsValid: boolean;
        licenseKey: string;
        notifications: boolean;
        permissions: boolean;
        phone: string;
        timeTrackerActive: boolean;
        username: string;
        karmaCoinsBalance: number;
        friends: {
            username: string;
            email: string;
        }[];
        avatarImagePath: string;
        fcmToken: string;
    }>;
    isDarkMode: import("vue").Ref<boolean, boolean>;
    handleSectionChange: (newSection: any) => void;
    notificationManager: import("vue").Ref<null, null>;
    sendNotify: (type: "info" | "warning" | "error" | "success", text: string) => void;
    todayToDoActions: import("vue").Ref<{
        title: string;
        description: string;
        priority: ToDoPriority;
        dateWithTime: Date;
        expiration: Date;
        notifyDate: Date;
        subActions: Map<string, /*elided*/ any> & Omit<Map<string, ToDoAction>, keyof Map<any, any>>;
        completed: boolean;
        id: string;
        category: string;
        getAsObj: () => ToDoObj;
        isCompleted: () => boolean;
        addOrUpdateSubToDoAction: (SubToDoAction: ToDoAction) => void;
        removeSubToDoAction: (subActionId: string) => void;
        setAsCompleted: () => void;
        setAsNotCompleted: () => void;
        clone: (id?: string | null) => ToDoAction;
    }[], ToDoAction[] | {
        title: string;
        description: string;
        priority: ToDoPriority;
        dateWithTime: Date;
        expiration: Date;
        notifyDate: Date;
        subActions: Map<string, /*elided*/ any> & Omit<Map<string, ToDoAction>, keyof Map<any, any>>;
        completed: boolean;
        id: string;
        category: string;
        getAsObj: () => ToDoObj;
        isCompleted: () => boolean;
        addOrUpdateSubToDoAction: (SubToDoAction: ToDoAction) => void;
        removeSubToDoAction: (subActionId: string) => void;
        setAsCompleted: () => void;
        setAsNotCompleted: () => void;
        clone: (id?: string | null) => ToDoAction;
    }[]>;
    genericToDoActions: import("vue").Ref<{
        title: string;
        description: string;
        priority: ToDoPriority;
        dateWithTime: Date;
        expiration: Date;
        notifyDate: Date;
        subActions: Map<string, /*elided*/ any> & Omit<Map<string, ToDoAction>, keyof Map<any, any>>;
        completed: boolean;
        id: string;
        category: string;
        getAsObj: () => ToDoObj;
        isCompleted: () => boolean;
        addOrUpdateSubToDoAction: (SubToDoAction: ToDoAction) => void;
        removeSubToDoAction: (subActionId: string) => void;
        setAsCompleted: () => void;
        setAsNotCompleted: () => void;
        clone: (id?: string | null) => ToDoAction;
    }[], ToDoAction[] | {
        title: string;
        description: string;
        priority: ToDoPriority;
        dateWithTime: Date;
        expiration: Date;
        notifyDate: Date;
        subActions: Map<string, /*elided*/ any> & Omit<Map<string, ToDoAction>, keyof Map<any, any>>;
        completed: boolean;
        id: string;
        category: string;
        getAsObj: () => ToDoObj;
        isCompleted: () => boolean;
        addOrUpdateSubToDoAction: (SubToDoAction: ToDoAction) => void;
        removeSubToDoAction: (subActionId: string) => void;
        setAsCompleted: () => void;
        setAsNotCompleted: () => void;
        clone: (id?: string | null) => ToDoAction;
    }[]>;
    userHandler: UserHandler;
    todoCompletedQuantity: import("vue").Ref<number, number>;
    totalToDoQuantity: import("vue").Ref<number, number>;
    totalEventsQuantity: import("vue").Ref<number, number>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {
    Sidebar: import("vue").DefineComponent<{}, {}, any>;
    NotificationManager: import("vue").DefineComponent<{}, {}, {
        currentNotification: null;
    }, {}, {
        showNotification(notification: any): void;
        dismissNotification(): void;
    }, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}>, {}, {}, {
        Notification: import("vue").DefineComponent<{}, {}, any>;
    }, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ConnectionStatus: import("vue").DefineComponent<{}, {
        broadcastListener: import("vue").Ref<null, null>;
        isOnline: import("vue").Ref<boolean, boolean>;
        showBox: import("vue").Ref<boolean, boolean>;
        notificationManager: import("vue").Ref<null, null>;
        updateOnlineStatus: () => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {
        NotificationManager: import("vue").DefineComponent<{}, {}, {
            currentNotification: null;
        }, {}, {
            showNotification(notification: any): void;
            dismissNotification(): void;
        }, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}>, {}, {}, {
            Notification: import("vue").DefineComponent<{}, {}, any>;
        }, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
        BroadcastListener: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    }, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ToDoList: import("vue").DefineComponent<import("../components/ToDoList.vue").Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        todoEvent: (...args: any[]) => void;
        subToDoNotify: (...args: any[]) => void;
        subToDoEvent: (...args: any[]) => void;
    }, string, import("vue").PublicProps, Readonly<import("../components/ToDoList.vue").Props> & Readonly<{
        onTodoEvent?: ((...args: any[]) => any) | undefined;
        onSubToDoNotify?: ((...args: any[]) => any) | undefined;
        onSubToDoEvent?: ((...args: any[]) => any) | undefined;
    }>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {
        notificationManager: import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{}>, {}, {
            currentNotification: null;
        }, {}, {
            showNotification(notification: any): void;
            dismissNotification(): void;
        }, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {}, true, {}, {}, {
            Notification: import("vue").DefineComponent<{}, {}, any>;
        } & import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{}>, {}, {
            currentNotification: null;
        }, {}, {
            showNotification(notification: any): void;
            dismissNotification(): void;
        }, {}> | null;
    }, any>;
    Calendar: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        calendarEvent: (...args: any[]) => void;
    }, string, import("vue").PublicProps, Readonly<{}> & Readonly<{
        onCalendarEvent?: ((...args: any[]) => any) | undefined;
    }>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {
        notificationManager: import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{}>, {}, {
            currentNotification: null;
        }, {}, {
            showNotification(notification: any): void;
            dismissNotification(): void;
        }, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {}, true, {}, {}, {
            Notification: import("vue").DefineComponent<{}, {}, any>;
        } & import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{}>, {}, {
            currentNotification: null;
        }, {}, {
            showNotification(notification: any): void;
            dismissNotification(): void;
        }, {}> | null;
    }, any>;
    TimeTrackerRuleList: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {
        notificationManager: import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{}>, {}, {
            currentNotification: null;
        }, {}, {
            showNotification(notification: any): void;
            dismissNotification(): void;
        }, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {}, true, {}, {}, {
            Notification: import("vue").DefineComponent<{}, {}, any>;
        } & import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{}>, {}, {
            currentNotification: null;
        }, {}, {
            showNotification(notification: any): void;
            dismissNotification(): void;
        }, {}> | null;
    }, any>;
}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
