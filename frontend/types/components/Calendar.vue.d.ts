declare const _default: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
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
export default _default;
