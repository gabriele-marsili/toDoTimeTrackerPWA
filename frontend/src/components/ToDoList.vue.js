import { computed, defineProps, defineEmits, ref } from 'vue';
import ToDoItem from './ToDoItem.vue';
const viewMode = ref('list');
const toggleViewMode = () => viewMode.value = viewMode.value === 'list' ? 'grid' : 'list';
const props = defineProps();
const emit = defineEmits();
// Filtra i todo che non sono completati
const filteredTodos = computed(() => {
    return [...props.todos].sort((a, b) => {
        if (!a.isCompleted() && b.isCompleted())
            return -1;
        if (a.isCompleted() && !b.isCompleted())
            return 1;
        return 0;
    });
    //return props.todos.filter(todo => !todo.isCompleted());
});
// Quando un item viene cliccato, emetti l'evento "select"
function openAction(todo) {
    emit('select', todo);
}
// Gestione dell'update: qui puoi propagarlo al componente padre
function onItemUpdate(todo, updated) {
    // In questo esempio emettiamo l'evento "update" con il todo aggiornato
    emit('update', updated);
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['todo-list', 'todo-list-container',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("todo-list-container") },
        ...{ class: ((__VLS_ctx.viewMode)) },
    });
    for (const [todo] of __VLS_getVForSourceType((__VLS_ctx.filteredTodos))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.openAction(todo);
                } },
            key: ((todo.id)),
            ...{ class: ("todo-item-wrapper") },
        });
        // @ts-ignore
        /** @type { [typeof ToDoItem, ] } */ ;
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(ToDoItem, new ToDoItem({
            ...{ 'onUpdate': {} },
            ...{ 'onClick': {} },
            viewMode: ((__VLS_ctx.viewMode)),
            todo: ((todo)),
        }));
        const __VLS_1 = __VLS_0({
            ...{ 'onUpdate': {} },
            ...{ 'onClick': {} },
            viewMode: ((__VLS_ctx.viewMode)),
            todo: ((todo)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        let __VLS_5;
        const __VLS_6 = {
            onUpdate: (...[$event]) => {
                __VLS_ctx.onItemUpdate(todo, $event);
            }
        };
        const __VLS_7 = {
            onClick: () => { }
        };
        let __VLS_2;
        let __VLS_3;
        var __VLS_4;
    }
    ['todo-list-container', 'todo-item-wrapper',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {};
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ToDoItem: ToDoItem,
            viewMode: viewMode,
            filteredTodos: filteredTodos,
            openAction: openAction,
            onItemUpdate: onItemUpdate,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
