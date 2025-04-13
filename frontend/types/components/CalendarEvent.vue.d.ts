import { CalendarEvent } from '../engine/calendarEvent';
type __VLS_Props = {
    event: CalendarEvent;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    edit: (event: CalendarEvent) => any;
    delete: (event: CalendarEvent) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onEdit?: ((event: CalendarEvent) => any) | undefined;
    onDelete?: ((event: CalendarEvent) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;
