declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    value: {
        type: DateConstructor;
        default: null;
    };
}>, {}, {
    fp: null;
}, {
    formattedDate(): string;
}, {
    /**
     * Callback chiamato da Flatpickr quando la data viene cambiata.
     * Emette l'evento input con il nuovo valore (oggetto Date).
     */
    onChange(selectedDates: any): void;
    /**
     * Funzione per formattare un oggetto Date in formato "gg/mm/yyyy hh:mm".
     */
    formatDate(date: any): string;
    onInput(event: any): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    value: {
        type: DateConstructor;
        default: null;
    };
}>> & Readonly<{}>, {
    value: Date;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
