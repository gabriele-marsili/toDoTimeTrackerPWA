import { ToDoAction } from '../engine/toDoEngine';
interface Props {
    todo: ToDoAction;
    viewMode: 'list' | 'grid';
}
declare const _default: import("vue").DefineComponent<Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    copy: (...args: any[]) => void;
    delete: (...args: any[]) => void;
    update: (...args: any[]) => void;
    todoEvent: (...args: any[]) => void;
}, string, import("vue").PublicProps, Readonly<Props> & Readonly<{
    onCopy?: ((...args: any[]) => any) | undefined;
    onDelete?: ((...args: any[]) => any) | undefined;
    onUpdate?: ((...args: any[]) => any) | undefined;
    onTodoEvent?: ((...args: any[]) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;
