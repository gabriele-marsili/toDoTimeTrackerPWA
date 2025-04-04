import { ToDoAction, ToDoPriority } from '../types/utilityTypes';
declare const _default: import("vue").DefineComponent<{}, {
    user: import("vue").Ref<{
        name: string;
        image: string;
    }, {
        name: string;
        image: string;
    } | {
        name: string;
        image: string;
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
        getAsObj: () => import("../types/utilityTypes").ToDoObj;
        isCompleted: () => boolean;
        addOrUpdateSubToDoAction: (SubToDoAction: ToDoAction) => void;
        removeSubToDoAction: (subActionId: string) => void;
        setAsCompleted: () => void;
        setAsNotCompleted: () => void;
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
        getAsObj: () => import("../types/utilityTypes").ToDoObj;
        isCompleted: () => boolean;
        addOrUpdateSubToDoAction: (SubToDoAction: ToDoAction) => void;
        removeSubToDoAction: (subActionId: string) => void;
        setAsCompleted: () => void;
        setAsNotCompleted: () => void;
    }[]>;
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
    ToDoList: import("vue").DefineComponent<import("../components/ToDoList.vue").Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        select: (todo: ToDoAction) => any;
        update: (updatedTodo: ToDoAction) => any;
    }, string, import("vue").PublicProps, Readonly<import("../components/ToDoList.vue").Props> & Readonly<{
        onSelect?: ((todo: ToDoAction) => any) | undefined;
        onUpdate?: ((updatedTodo: ToDoAction) => any) | undefined;
    }>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, HTMLDivElement>;
}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
