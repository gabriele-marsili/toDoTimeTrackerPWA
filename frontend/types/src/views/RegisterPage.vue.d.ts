declare const _default: import("vue").DefineComponent<{}, {
    isDarkMode: import("vue").Ref<boolean, boolean>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {
    RegistrationForm: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {
        notificationManager: any;
    }, any>;
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
    DarkModeSwitcher: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, HTMLDivElement>;
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
}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
