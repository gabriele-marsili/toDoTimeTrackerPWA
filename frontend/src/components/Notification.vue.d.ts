declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    type: {
        type: StringConstructor;
        required: true;
        validator: (value: unknown) => boolean;
    };
    message: {
        type: StringConstructor;
        required: true;
    };
    duration: {
        type: NumberConstructor;
        default: number;
    };
}>, {}, {
    visible: boolean;
    timer: null;
}, {
    typeClass(): string;
    icon(): any;
}, {
    pauseTimer(): void;
    resumeTimer(): void;
    startTimer(): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    type: {
        type: StringConstructor;
        required: true;
        validator: (value: unknown) => boolean;
    };
    message: {
        type: StringConstructor;
        required: true;
    };
    duration: {
        type: NumberConstructor;
        default: number;
    };
}>> & Readonly<{}>, {
    duration: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
