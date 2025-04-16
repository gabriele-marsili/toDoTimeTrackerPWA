declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    value: {
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
    onInput(event: any): void;
    updateDarkMode(isDark: any): void;
    updateCalendarPosition(selectedDates: any, dateStr: any, instance: any): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    value: {
        type: DateConstructor;
        default: null;
    };
    isDarkMode: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    isDarkMode: boolean;
    value: Date;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
