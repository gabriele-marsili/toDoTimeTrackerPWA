declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: DateConstructor;
        default: null;
    };
    isDarkMode: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, {}, {
    fp: null;
}, {
    formattedDate(): string;
}, {
    onChange(selectedDates: any): void;
    formatDate(date: any): string;
    updateDarkMode(isDark: any): void;
    updateCalendarPosition(selectedDates: any, dateStr: any, instance: any): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "update:modelValue"[], "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: DateConstructor;
        default: null;
    };
    isDarkMode: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: ((...args: any[]) => any) | undefined;
}>, {
    isDarkMode: boolean;
    modelValue: Date;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
