import { API_gestor } from '../backend-comunication/api_comunication';
declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    activeSection: {
        type: StringConstructor;
        required: true;
    };
}>, {
    notificationManager: import("vue").Ref<null, null>;
    sendNotify: (type: "info" | "warning" | "error" | "success", text: string) => void;
    isDarkMode: import("vue").Ref<boolean, boolean>;
    router: import("vue-router").Router;
    api_gestor: API_gestor;
    isHovered: import("vue").Ref<boolean, boolean>;
    sections: {
        name: string;
        label: string;
        icon: string;
    }[];
    navigateTo: (sectionName: string) => Promise<void>;
    logout: () => Promise<void>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    activeSection: {
        type: StringConstructor;
        required: true;
    };
}>> & Readonly<{}>, {}, {}, {
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
