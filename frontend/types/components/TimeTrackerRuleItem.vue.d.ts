import { TimeTrackerRule } from '../engine/timeTracker';
interface Props {
    rule: TimeTrackerRule;
}
declare const _default: import("vue").DefineComponent<Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    delete: (...args: any[]) => void;
    edit: (...args: any[]) => void;
}, string, import("vue").PublicProps, Readonly<Props> & Readonly<{
    onDelete?: ((...args: any[]) => any) | undefined;
    onEdit?: ((...args: any[]) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;
