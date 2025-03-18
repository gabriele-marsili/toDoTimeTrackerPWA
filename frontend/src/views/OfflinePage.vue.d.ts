declare const _default: import("vue").DefineComponent<{}, {
    isDarkMode: import("vue").Ref<boolean, boolean>;
    themeClass: import("vue").ComputedRef<"dark" | "light">;
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
}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
