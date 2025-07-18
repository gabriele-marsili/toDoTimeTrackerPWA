import { ToDoAction } from '../engine/toDoEngine';
export interface Props {
    todos: ToDoAction[];
    viewMode: 'list' | 'grid';
    isSubList: boolean;
    triggerAddToDo: boolean;
}
declare const _default: import("vue").DefineComponent<Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    todoEvent: (...args: any[]) => void;
    subToDoNotify: (...args: any[]) => void;
    subToDoEvent: (...args: any[]) => void;
    todoAdded: (...args: any[]) => void;
}, string, import("vue").PublicProps, Readonly<Props> & Readonly<{
    onTodoEvent?: ((...args: any[]) => any) | undefined;
    onSubToDoNotify?: ((...args: any[]) => any) | undefined;
    onSubToDoEvent?: ((...args: any[]) => any) | undefined;
    onTodoAdded?: ((...args: any[]) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {
    notificationManager: import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{}>, {}, {
        currentNotification: null;
    }, {}, {
        showNotification(notification: any): void;
        dismissNotification(): void;
    }, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {}, true, {}, {}, {
        Notification: import("vue").DefineComponent<{}, {}, any>;
    } & import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
        P: {};
        B: {};
        D: {};
        C: {};
        M: {};
        Defaults: {};
    }, Readonly<{}>, {}, {
        currentNotification: null;
    }, {}, {
        showNotification(notification: any): void;
        dismissNotification(): void;
    }, {}> | null;
}, any>;
export default _default;
