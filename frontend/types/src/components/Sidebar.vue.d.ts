declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    activeSection: {
        type: StringConstructor;
        required: true;
    };
}>, {
    isHovered: import("vue").Ref<boolean, boolean>;
    sections: {
        name: string;
        label: string;
        icon: string;
    }[];
    navigateTo: (section: any) => Promise<void>;
    logout: () => Promise<void>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    activeSection: {
        type: StringConstructor;
        required: true;
    };
}>> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
