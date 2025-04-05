import { ref, computed, watch } from 'vue';
const props = defineProps();
const emit = defineEmits(["update"]);
const localTodo = ref(props.todo);
const localToDoObj = ref(props.todo.getAsObj());
const editing = ref(false);
function formatDate(date) {
    const d = new Date(date);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function parseDate(str) {
    return new Date(str);
}
const subTaskProgress = computed(() => {
    const total = localToDoObj.value.subActions.size;
    const completed = [...localToDoObj.value.subActions.values()].filter(t => t.completed).length;
    return `${completed}/${total}`;
});
const dateWithTimeString = computed({
    get: () => formatDate(localTodo.value.dateWithTime),
    set: (val) => {
        localTodo.value.dateWithTime = parseDate(val);
        emit('update', localTodo.value);
    }
});
const expirationString = computed({
    get: () => formatDate(localTodo.value.expiration),
    set: (val) => {
        localTodo.value.expiration = parseDate(val);
        emit('update', localTodo.value);
    }
});
const notifyDateString = computed({
    get: () => formatDate(localTodo.value.notifyDate),
    set: (val) => {
        localTodo.value.notifyDate = parseDate(val);
        emit('update', localTodo.value);
    }
});
function toggleEditing() {
    if (editing.value) {
        emit('update', localTodo.value);
    }
    editing.value = !editing.value;
}
function onCompletedChange() {
    if (localToDoObj.value.completed) {
        localTodo.value.setAsCompleted();
    }
    else {
        localTodo.value.setAsNotCompleted();
    }
    editing.value = false;
    emit('update', localTodo.value);
}
function copyToDo() {
    console.log("Copy action");
}
function deleteToDo() {
    console.log("Delete action");
}
watch(() => props.todo, (newVal) => {
    localTodo.value = newVal;
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['todo-item', 'action-buttons', 'action-buttons',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("todo-item") },
        ...{ class: (({ completed: __VLS_ctx.localToDoObj.completed, [__VLS_ctx.viewMode]: true })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("todo-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.onCompletedChange) },
        ...{ class: ("baseCheckbox") },
        type: ("checkbox"),
        disabled: ((__VLS_ctx.localToDoObj.completed)),
    });
    (__VLS_ctx.localToDoObj.completed);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("title-meta-wrapper") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("todo-title") },
        ...{ class: (({ strikethrough: __VLS_ctx.localToDoObj.completed })) },
    });
    (__VLS_ctx.localToDoObj.title);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("meta-info") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("todo-date") },
    });
    (__VLS_ctx.dateWithTimeString);
    if (__VLS_ctx.localToDoObj.subActions.size > 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("subtask-count") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
        (__VLS_ctx.subTaskProgress);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("action-buttons") },
    });
    if (!__VLS_ctx.localToDoObj.completed) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.toggleEditing) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.copyToDo) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("material-symbols-outlined g-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.deleteToDo) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("material-symbols-outlined g-icon") },
    });
    if (__VLS_ctx.editing && !__VLS_ctx.localToDoObj.completed) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("todo-details") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
            value: ((__VLS_ctx.localToDoObj.description)),
            placeholder: ("Descrizione (facoltativa)"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("todo-fields") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.localToDoObj.priority)),
            modelModifiers: { number: true, },
        });
        for (const [n] of __VLS_getVForSourceType((5))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((n)),
                value: ((n)),
            });
            (n);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("datetime-local"),
        });
        (__VLS_ctx.expirationString);
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("datetime-local"),
        });
        (__VLS_ctx.notifyDateString);
    }
    ['todo-item', 'completed', 'todo-header', 'baseCheckbox', 'title-meta-wrapper', 'todo-title', 'strikethrough', 'meta-info', 'todo-date', 'subtask-count', 'material-symbols-outlined', 'g-icon', 'action-buttons', 'material-symbols-outlined', 'g-icon', 'material-symbols-outlined', 'g-icon', 'material-symbols-outlined', 'g-icon', 'todo-details', 'todo-fields',];
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
            localToDoObj: localToDoObj,
            editing: editing,
            subTaskProgress: subTaskProgress,
            dateWithTimeString: dateWithTimeString,
            expirationString: expirationString,
            notifyDateString: notifyDateString,
            toggleEditing: toggleEditing,
            onCompletedChange: onCompletedChange,
            copyToDo: copyToDo,
            deleteToDo: deleteToDo,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
