import { ref, computed, watch } from 'vue';
import ToDoItem from './ToDoItem.vue';
const props = defineProps();
const emit = defineEmits(["update"]);
// Crea una copia locale reattiva della to do per poterla modificare
const localTodo = ref(props.todo);
const localToDoObj = ref(props.todo.getAsObj());
// Stato per il cambio in modalità editing
const editing = ref(false);
// Funzioni di utilità per formattare e parsare date nel formato datetime-local (yyyy-MM-ddTHH:mm)
function formatDate(date) {
    const d = new Date(date);
    const pad = (n) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
function parseDate(str) {
    return new Date(str);
}
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
// Funzione per attivare/disattivare la modalità editing
function toggleEditing() {
    if (editing.value) {
        // Salva le modifiche
        emit('update', localTodo.value);
        editing.value = false;
    }
    else {
        editing.value = true;
    }
}
// Funzione che gestisce il cambio di stato (completato)
function onCompletedChange() {
    if (localToDoObj.value.completed) {
        localTodo.value.setAsCompleted();
        editing.value = false; // disabilita l'editing    
    }
    else {
        localTodo.value.setAsNotCompleted();
    }
    emit('update', localTodo.value);
}
// Aggiunge una nuova sotto-attività con valori di default
function addSubTask() {
    //to do
    emit('update', localTodo.value);
}
// Gestisce l'update di una sotto-attività (passato dal componente figlio)
function onSubTaskUpdate(updatedSub) {
    localTodo.value.addOrUpdateSubToDoAction(updatedSub);
    emit('update', localTodo.value);
}
// Se la prop todo cambia, aggiorna il locale
watch(() => props.todo, (newVal) => {
    localTodo.value = newVal;
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['sub-tasks',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("todo-item") },
        ...{ class: (({ completed: __VLS_ctx.localToDoObj.completed })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("todo-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.onCompletedChange) },
        type: ("checkbox"),
        disabled: ((__VLS_ctx.localToDoObj.completed)),
    });
    (__VLS_ctx.localToDoObj.completed);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("title-wrapper") },
    });
    if (!__VLS_ctx.editing || __VLS_ctx.localToDoObj.completed) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("todo-title") },
            ...{ class: (({ strikethrough: __VLS_ctx.localToDoObj.completed })) },
        });
        (__VLS_ctx.localToDoObj.title);
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("text"),
            value: ((__VLS_ctx.localToDoObj.title)),
        });
    }
    if (!__VLS_ctx.localToDoObj.completed) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.toggleEditing) },
        });
        (__VLS_ctx.editing ? 'Save' : 'Edit');
    }
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
        (__VLS_ctx.dateWithTimeString);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("sub-tasks") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    for (const [sub] of __VLS_getVForSourceType((__VLS_ctx.localToDoObj.subActions.values()))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((sub.id)),
        });
        // @ts-ignore
        /** @type { [typeof ToDoItem, ] } */ ;
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(ToDoItem, new ToDoItem({
            ...{ 'onUpdate': {} },
            todo: sub,
        }));
        const __VLS_1 = __VLS_0({
            ...{ 'onUpdate': {} },
            todo: sub,
        }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        let __VLS_5;
        const __VLS_6 = {
            onUpdate: (...[$event]) => {
                __VLS_ctx.onSubTaskUpdate(sub);
            }
        };
        let __VLS_2;
        let __VLS_3;
        var __VLS_4;
    }
    if (__VLS_ctx.editing && !__VLS_ctx.localToDoObj.completed) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.addSubTask) },
        });
    }
    ['todo-item', 'completed', 'todo-header', 'title-wrapper', 'todo-title', 'strikethrough', 'todo-details', 'todo-fields', 'sub-tasks',];
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
            localToDoObj: localToDoObj,
            editing: editing,
            dateWithTimeString: dateWithTimeString,
            expirationString: expirationString,
            notifyDateString: notifyDateString,
            toggleEditing: toggleEditing,
            onCompletedChange: onCompletedChange,
            addSubTask: addSubTask,
            onSubTaskUpdate: onSubTaskUpdate,
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
