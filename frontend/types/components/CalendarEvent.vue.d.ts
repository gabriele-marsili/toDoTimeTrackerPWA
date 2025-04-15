import { CalendarEvent } from '../engine/calendarEvent';
type __VLS_Props = {
    event: CalendarEvent;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    delete: (event: CalendarEvent) => any;
    edit: (event: CalendarEvent) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onDelete?: ((event: CalendarEvent) => any) | undefined;
    onEdit?: ((event: CalendarEvent) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;
