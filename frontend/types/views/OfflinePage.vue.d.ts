declare const _default: import("vue").DefineComponent<{}, {
    router: import("vue-router").Router;
    isDarkMode: import("vue").Ref<boolean, boolean>;
    sendNotify: (type: "info" | "warning" | "error" | "success", text: string) => void;
    themeClass: import("vue").ComputedRef<"dark" | "light">;
    handleChangeDarkMode: (args: any) => void;
    backOnline: () => Promise<void>;
    tryToReconnect: () => Promise<void>;
    notificationManager: import("vue").Ref<null, null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {
    DarkModeSwitcher: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, HTMLDivElement>;
    BackgroundEffect: import("vue").DefineComponent<{}, {}, {
        particles: never[];
        maxParticles: number;
        maxConnectionDistance: number;
        connectionDuration: number;
        connectionDelay: number;
        lastConnectionTime: number;
    }, {}, {
        generateParticles(): void;
        drawConnections(): void;
        moveParticles(): void;
    }, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    NotificationManager: import("vue").DefineComponent<{}, {}, {
        currentNotification: null;
    }, {}, {
        showNotification(notification: any): void;
        dismissNotification(): void;
    }, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}>, {}, {}, {
        Notification: import("vue").DefineComponent<{}, {}, any>;
    }, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
