import { ToDoAction } from '../types/utilityTypes';
export interface Props {
    todos: ToDoAction[];
    viewMode: 'list' | 'grid';
}
declare const _default: import("vue").DefineComponent<Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    select: (todo: ToDoAction) => any;
    update: (updatedTodo: ToDoAction) => any;
}, string, import("vue").PublicProps, Readonly<Props> & Readonly<{
    onSelect?: ((todo: ToDoAction) => any) | undefined;
    onUpdate?: ((updatedTodo: ToDoAction) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;
