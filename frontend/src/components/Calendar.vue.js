import { ref, computed, onMounted } from 'vue';
import CalendarEvent from './CalendarEvent.vue';
import { CalendarEvent as CalendarEventClass } from '../engine/calendarEvent';
import NotificationManager from '../gestors/NotificationManager.vue';
const currentDate = ref(new Date());
const events = ref([]);
const showEventForm = ref(false);
const currentEvent = ref({
    eventDate: new Date(),
    title: '',
    description: '',
    durationInH: 0,
    notifications: [],
    category: ''
});
const eventDateInput = ref("");
const notificationManager = ref(null);
// Stato per il selettore personalizzato
const showMonthPicker = ref(false);
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const selectedMonth = ref(currentDate.value.getMonth());
const currentYear = currentDate.value.getFullYear();
const yearRange = computed(() => {
    const start = currentYear - 5;
    const end = currentYear + 5;
    const range = [];
    for (let y = start; y <= end; y++) {
        range.push(y);
    }
    return range;
});
const selectedYear = ref(currentYear);
const hoveredDay = ref(null);
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
    selectedMonth.value = currentDate.value.getMonth();
    selectedYear.value = currentDate.value.getFullYear();
}
function nextMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
    selectedMonth.value = currentDate.value.getMonth();
    selectedYear.value = currentDate.value.getFullYear();
}
// Funzioni per il selettore personalizzato
function openMonthPicker() {
    // Imposta i valori selezionati in base a currentDate
    selectedMonth.value = currentDate.value.getMonth();
    selectedYear.value = currentDate.value.getFullYear();
    showMonthPicker.value = true;
}
function closeMonthPicker() {
    showMonthPicker.value = false;
}
function applyMonthPicker() {
    currentDate.value = new Date(selectedYear.value, selectedMonth.value, 1);
    showMonthPicker.value = false;
}
// Eventi per modificare/ cancellare eventi
function editEvent(event) {
    console.log('Edit event:', event);
    showEventForm.value = true;
}
function deleteEvent(event) {
    events.value = events.value.filter(e => e !== event);
}
function sendNotify(type, text) {
    if (notificationManager.value) {
        notificationManager.value.showNotification({
            type: type,
            message: text,
        });
    }
    else {
        console.log("notification manager not found");
    }
}
function addEvent() {
    let errorMessage = '';
    // Validazione base: titolo non vuoto, data valida e durata > 0
    if (!currentEvent.value.title.trim()) {
        errorMessage = 'Title is required.';
        return;
    }
    if (!eventDateInput.value || eventDateInput.value == "") {
        errorMessage = 'Event date is required.';
        return;
    }
    // Converti la stringa dell'input in Date
    const newEventDate = new Date(eventDateInput.value);
    if (isNaN(newEventDate.getTime())) {
        errorMessage = 'Invalid event date.';
        return;
    }
    if (currentEvent.value.durationInH < 0) {
        errorMessage = 'Duration must be >= 0.';
        return;
    }
    if (errorMessage != "") {
        sendNotify("error", errorMessage);
    }
    else {
        // Imposta l'evento con la data convertita
        currentEvent.value.eventDate = newEventDate;
        let eventID = "."; //get event id to do 
        const newEvent = new CalendarEventClass(eventID, newEventDate, currentEvent.value.title, currentEvent.value.description, currentEvent.value.notifications, currentEvent.value.category, currentEvent.value.durationInH);
        // Aggiungi il nuovo evento all'array degli eventi
        events.value.push(newEvent);
        sendNotify("success", "Event " + currentEvent.value.title + " added successfully");
    }
    // Resetta il form
    resetEventForm();
    showEventForm.value = false;
}
function resetEventForm() {
    currentEvent.value = {
        eventDate: new Date(),
        title: '',
        description: '',
        notifications: [],
        category: '',
        durationInH: 1
    };
    eventDateInput.value = "";
}
function cancelAddEvent() {
    resetEventForm();
    showEventForm.value = false;
}
onMounted(() => {
    // Creazione di eventi fittizi per il mese corrente
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= Math.min(10, days); i++) {
        let e = new CalendarEventClass("e " + i, new Date(year, month, i), `Event ${i}`, "description", [], `Category ${i}`, i);
        events.value.push(e);
        if (i % 2 == 0) {
            e.title = `Other Event ${i}`;
            e.id = e.id + " .2";
            events.value.push(e);
        }
    }
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['month-selector', 'add-event-content', 'add-event-content', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'picker-actions', 'calendar-day', 'calendar', 'calendar-grid', 'add-event-content', 'calendar',];
    // CSS variable injection 
    // CSS variable injection end 
    // @ts-ignore
    /** @type { [typeof NotificationManager, ] } */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(NotificationManager, new NotificationManager({
        ref: ("notificationManager"),
    }));
    const __VLS_1 = __VLS_0({
        ref: ("notificationManager"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    // @ts-ignore navigation for `const notificationManager = ref()`
    /** @type { typeof __VLS_ctx.notificationManager } */ ;
    var __VLS_5 = {};
    var __VLS_4;
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openMonthPicker) },
        ...{ class: ("baseButton month-selector") },
    });
    (__VLS_ctx.currentMonthYear);
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("material-symbols-outlined month-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showEventForm = true;
            } },
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
    if (__VLS_ctx.showMonthPicker) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("month-picker-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("picker-row") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.selectedMonth)),
            ...{ class: ("selettore") },
        });
        for (const [m, index] of __VLS_getVForSourceType((__VLS_ctx.months))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((index)),
                value: ((index)),
            });
            (m);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.selectedYear)),
            modelModifiers: { number: true, },
            ...{ class: ("selettore") },
        });
        for (const [year] of __VLS_getVForSourceType((__VLS_ctx.yearRange))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((year)),
                value: ((year)),
            });
            (year);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("picker-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.applyMonthPicker) },
            ...{ class: ("baseButton") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closeMonthPicker) },
            ...{ class: ("baseButton") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("calendar-grid") },
    });
    for (const [day] of __VLS_getVForSourceType((__VLS_ctx.daysInMonth))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onMouseenter: (...[$event]) => {
                    __VLS_ctx.hoveredDay = day;
                } },
            ...{ onMouseleave: (...[$event]) => {
                    __VLS_ctx.hoveredDay = null;
                } },
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
        if (__VLS_ctx.hoveredDay !== day) {
            if (__VLS_ctx.eventsForDay(day).length > 1) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.eventsForDay(day).length);
            }
            else if (__VLS_ctx.eventsForDay(day).length === 1) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            }
        }
        else {
            for (const [event] of __VLS_getVForSourceType((__VLS_ctx.eventsForDay(day)))) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: ((event.title + event.eventDate)),
                    ...{ class: ("event-details") },
                });
                // @ts-ignore
                /** @type { [typeof CalendarEvent, ] } */ ;
                // @ts-ignore
                const __VLS_6 = __VLS_asFunctionalComponent(CalendarEvent, new CalendarEvent({
                    ...{ 'onEdit': {} },
                    ...{ 'onDelete': {} },
                    event: ((event)),
                }));
                const __VLS_7 = __VLS_6({
                    ...{ 'onEdit': {} },
                    ...{ 'onDelete': {} },
                    event: ((event)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_6));
                let __VLS_11;
                const __VLS_12 = {
                    onEdit: (__VLS_ctx.editEvent)
                };
                const __VLS_13 = {
                    onDelete: (__VLS_ctx.deleteEvent)
                };
                let __VLS_8;
                let __VLS_9;
                var __VLS_10;
                if (__VLS_ctx.eventsForDay(day).length === 1) {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: ("event-extra") },
                    });
                    (event.description);
                }
            }
        }
    }
    if (__VLS_ctx.showEventForm) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("add-event-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ("eventDate"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            ...{ class: ("baseInputField") },
            id: ("eventDate"),
            type: ("datetime-local"),
        });
        (__VLS_ctx.eventDateInput);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ("title"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            ...{ class: ("baseInputField") },
            id: ("title"),
            type: ("text"),
            value: ((__VLS_ctx.currentEvent.title)),
            placeholder: ("Event Title"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ("description"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
            ...{ class: ("baseInputField") },
            id: ("description"),
            value: ((__VLS_ctx.currentEvent.description)),
            placeholder: ("Event Description"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ("category"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            ...{ class: ("baseInputField") },
            id: ("category"),
            type: ("text"),
            value: ((__VLS_ctx.currentEvent.category)),
            placeholder: ("Event Category"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ("duration"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            ...{ class: ("baseInputField") },
            id: ("duration"),
            type: ("number"),
            min: ("0.5"),
            step: ("0.5"),
        });
        (__VLS_ctx.currentEvent.durationInH);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("add-event-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.addEvent) },
            ...{ class: ("baseButton") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.cancelAddEvent) },
            ...{ class: ("baseButton") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
    }
    ['calendar', 'calendar-header', 'baseButton', 'material-symbols-outlined', 'g-icon', 'baseButton', 'month-selector', 'material-symbols-outlined', 'month-icon', 'baseButton', 'material-symbols-outlined', 'g-icon', 'baseButton', 'material-symbols-outlined', 'g-icon', 'modal', 'month-picker-content', 'picker-row', 'selettore', 'selettore', 'picker-actions', 'baseButton', 'material-symbols-outlined', 'g-icon', 'baseButton', 'material-symbols-outlined', 'g-icon', 'calendar-grid', 'calendar-day', 'day-number', 'events-for-day', 'event-details', 'event-extra', 'modal', 'add-event-content', 'form-group', 'baseInputField', 'form-group', 'baseInputField', 'form-group', 'baseInputField', 'form-group', 'baseInputField', 'form-group', 'baseInputField', 'add-event-actions', 'baseButton', 'material-symbols-outlined', 'g-icon', 'baseButton', 'material-symbols-outlined', 'g-icon',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'notificationManager': __VLS_5,
    };
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
            NotificationManager: NotificationManager,
            showEventForm: showEventForm,
            currentEvent: currentEvent,
            eventDateInput: eventDateInput,
            notificationManager: notificationManager,
            showMonthPicker: showMonthPicker,
            months: months,
            selectedMonth: selectedMonth,
            yearRange: yearRange,
            selectedYear: selectedYear,
            hoveredDay: hoveredDay,
            currentMonthYear: currentMonthYear,
            daysInMonth: daysInMonth,
            eventsForDay: eventsForDay,
            prevMonth: prevMonth,
            nextMonth: nextMonth,
            openMonthPicker: openMonthPicker,
            closeMonthPicker: closeMonthPicker,
            applyMonthPicker: applyMonthPicker,
            editEvent: editEvent,
            deleteEvent: deleteEvent,
            addEvent: addEvent,
            cancelAddEvent: cancelAddEvent,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeRefs: {},
});
; /* PartiallyEnd: #4569/main.vue */
