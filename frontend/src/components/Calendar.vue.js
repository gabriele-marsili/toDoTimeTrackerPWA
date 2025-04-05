import { ref, computed, onMounted, watch } from 'vue';
import CalendarEvent from './CalendarEvent.vue';
import { CalendarEvent as CalendarEventClass } from '../engine/calendarEvent';
const currentDate = ref(new Date());
// Imposta selectedMonthYear come stringa "YYYY-MM"
const selectedMonthYear = ref(currentDate.value.toISOString().slice(0, 7));
const events = ref([]);
const showEventForm = ref(false);
const currentMonthYear = computed(() => {
    return currentDate.value.toLocaleDateString("en-US", { month: "long", year: "numeric" });
});
const daysInMonth = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    return new Array(new Date(year, month + 1, 0).getDate()).fill(0).map((_, i) => i + 1);
});
function eventsForDay(day) {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    return events.value.filter(event => {
        const d = event.eventDate;
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
}
function prevMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
    selectedMonthYear.value = currentDate.value.toISOString().slice(0, 7);
}
function nextMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
    selectedMonthYear.value = currentDate.value.toISOString().slice(0, 7);
}
// Watch per aggiornare currentDate quando l'utente seleziona un mese
watch(selectedMonthYear, (newVal) => {
    const [year, month] = newVal.split("-").map(Number);
    currentDate.value = new Date(year, month - 1, 1);
});
function openAddEvent() {
    showEventForm.value = true;
}
function closeEventForm() {
    showEventForm.value = false;
}
function editEvent(event) {
    console.log('Edit event:', event);
    showEventForm.value = true;
}
function deleteEvent(event) {
    events.value = events.value.filter(e => e !== event);
}
onMounted(() => {
    // Creiamo eventi per il mese corrente
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const day = currentDate.value.getDay();
    const days = new Date(year, month, day + 1).getDate();
    for (let i = 1; i <= Math.min(10, days); i++) {
        let e = new CalendarEventClass(new Date(year, month, i), `Event ${i}`, "description", [], `Category ${i}`, i);
        events.value.push(e);
    }
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['calendar', 'calendar-grid', 'calendar',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("calendar") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("calendar-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.prevMonth) },
        ...{ class: ("baseButton") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("material-symbols-outlined g-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("month"),
        ...{ class: ("baseButton month-selector") },
    });
    (__VLS_ctx.selectedMonthYear);
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openAddEvent) },
        ...{ class: ("baseButton") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("material-symbols-outlined g-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.nextMonth) },
        ...{ class: ("baseButton") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("material-symbols-outlined g-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("calendar-grid") },
    });
    for (const [day] of __VLS_getVForSourceType((__VLS_ctx.daysInMonth))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((day)),
            ...{ class: ("calendar-day") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("day-number") },
        });
        (day);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("events-for-day") },
        });
        for (const [event] of __VLS_getVForSourceType((__VLS_ctx.eventsForDay(day)))) {
            // @ts-ignore
            /** @type { [typeof CalendarEvent, ] } */ ;
            // @ts-ignore
            const __VLS_0 = __VLS_asFunctionalComponent(CalendarEvent, new CalendarEvent({
                ...{ 'onEdit': {} },
                ...{ 'onDelete': {} },
                key: ((event.title + event.eventDate)),
                event: ((event)),
            }));
            const __VLS_1 = __VLS_0({
                ...{ 'onEdit': {} },
                ...{ 'onDelete': {} },
                key: ((event.title + event.eventDate)),
                event: ((event)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_0));
            let __VLS_5;
            const __VLS_6 = {
                onEdit: (__VLS_ctx.editEvent)
            };
            const __VLS_7 = {
                onDelete: (__VLS_ctx.deleteEvent)
            };
            let __VLS_2;
            let __VLS_3;
            var __VLS_4;
        }
    }
    if (__VLS_ctx.showEventForm) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("event-form-modal") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closeEventForm) },
        });
    }
    ['calendar', 'calendar-header', 'baseButton', 'material-symbols-outlined', 'g-icon', 'baseButton', 'month-selector', 'baseButton', 'material-symbols-outlined', 'g-icon', 'baseButton', 'material-symbols-outlined', 'g-icon', 'calendar-grid', 'calendar-day', 'day-number', 'events-for-day', 'event-form-modal',];
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
            CalendarEvent: CalendarEvent,
            selectedMonthYear: selectedMonthYear,
            showEventForm: showEventForm,
            daysInMonth: daysInMonth,
            eventsForDay: eventsForDay,
            prevMonth: prevMonth,
            nextMonth: nextMonth,
            openAddEvent: openAddEvent,
            closeEventForm: closeEventForm,
            editEvent: editEvent,
            deleteEvent: deleteEvent,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
