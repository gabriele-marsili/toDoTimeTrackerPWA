<template>
    <NotificationManager ref="notificationManager" />
    <div class="calendar">
        <div class="calendar-header">
            <button class="baseButton" @click="prevMonth">
                <span class="material-symbols-outlined g-icon">arrow_back_ios</span>
            </button>
            <!-- Bottone che apre il selettore personalizzato -->
            <button class="baseButton month-selector" @click="openMonthPicker">
                {{ currentMonthYear }}
                <span class="material-symbols-outlined month-icon">calendar_today</span>
            </button>
            <button class="baseButton" @click="showEventForm = true">
                Add Event <span class="material-symbols-outlined g-icon">event</span>
            </button>
            <button class="baseButton" @click="nextMonth">
                <span class="material-symbols-outlined g-icon">arrow_forward_ios</span>
            </button>
        </div>

        <!-- Modale personalizzata per selezionare mese e anno -->
        <div v-if="showMonthPicker" class="modal">
            <div class="month-picker-content">
                <h3>Select Month and Year</h3>
                <div class="picker-row">
                    <select v-model="selectedMonth" class="selettore">
                        <option v-for="(m, index) in months" :key="index" :value="index">
                            {{ m }}
                        </option>
                    </select>
                    <select v-model.number="selectedYear" class="selettore">
                        <option v-for="year in yearRange" :key="year" :value="year">
                            {{ year }}
                        </option>
                    </select>
                </div>
                <div class="picker-actions">
                    <button class="baseButton" @click="applyMonthPicker">Apply
                        <span class="material-symbols-outlined g-icon">check_circle</span>
                    </button>
                    <button class="baseButton" @click="closeMonthPicker">Cancel
                        <span class="material-symbols-outlined g-icon">cancel</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="calendar-grid">
            <!-- Itara sui giorni del mese corrente -->
            <div v-for="day in daysInMonth" :key="day" class="calendar-day" @mouseenter="hoveredDay = day"
                @mouseleave="hoveredDay = null">
                <div class="day-number">{{ day }}</div>
                <div class="events-for-day">
                    <!-- Se non siamo in hover, mostra solo il numero di eventi se > 1 -->
                    <template v-if="hoveredDay !== day">
                        <span v-if="eventsForDay(day).length > 1">
                            {{ eventsForDay(day).length }} events
                        </span>
                        <span v-else-if="eventsForDay(day).length === 1">
                            1 event
                        </span>
                    </template>
                    <!-- In hover, mostra tutti gli eventi del giorno -->
                    <template v-else>
                        <div v-for="event in eventsForDay(day)" :key="event.title + event.eventDate"
                            class="event-details">
                            <!-- Se c'è più di uno, mostra elenco; se c'è solo uno, mostra dettaglio aggiuntivo -->
                            <CalendarEvent :event="event" @edit="editEvent" @delete="deleteEvent" />
                            <!-- Se c'è un solo evento, mostra ad esempio la descrizione sotto -->
                            <div v-if="eventsForDay(day).length === 1" class="event-extra"> {{ event.description }}
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- Modal o form per aggiungere/modificare evento (da implementare) -->
        <div v-if="showEventForm" class="modal">
            <div class="add-event-content">
                <h3>Add New Event</h3>
                <div class="form-group">
                    <label for="eventDate">Event Date:</label>
                    <input class="baseInputField" id="eventDate" type="datetime-local" v-model="eventDateInput" />
                </div>
                <div class="form-group">
                    <label for="title">Title:</label>
                    <input class="baseInputField" id="title" type="text" v-model="currentEvent.title"
                        placeholder="Event Title" />
                </div>
                <div class="form-group">
                    <label for="description">Description:</label>
                    <textarea class="baseInputField" id="description" v-model="currentEvent.description"
                        placeholder="Event Description"></textarea>
                </div>
                <div class="form-group">
                    <label for="category">Category:</label>
                    <input class="baseInputField" id="category" type="text" v-model="currentEvent.category"
                        placeholder="Event Category" />
                </div>
                <div class="form-group">
                    <label for="duration">Duration (hours):</label>
                    <input class="baseInputField" id="duration" type="number" min="0.5" step="0.5"
                        v-model.number="currentEvent.durationInH" />
                </div>

                <div class="add-event-actions">
                    <button class="baseButton" @click="addEvent">Apply
                        <span class="material-symbols-outlined g-icon">check_circle</span>
                    </button>
                    <button class="baseButton" @click="cancelAddEvent">Cancel
                        <span class="material-symbols-outlined g-icon">cancel</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CalendarEvent from './CalendarEvent.vue';
import { CalendarEvent as CalendarEventClass, CalendarObj } from '../engine/calendarEvent';
import NotificationManager from '../gestors/NotificationManager.vue';

const currentDate = ref(new Date());
const events = ref<CalendarEventClass[]>([]);
const showEventForm = ref(false);
const currentEvent = ref<CalendarObj>({
    eventDate: new Date(),
    title: '',
    description: '',
    durationInH: 0,
    notifications: [],
    category: ''
})
const eventDateInput = ref("")
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
const hoveredDay = ref<number | null>(null);

const currentMonthYear = computed(() => {
    return currentDate.value.toLocaleDateString("en-US", { month: "long", year: "numeric" });
});

const daysInMonth = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    return new Array(new Date(year, month + 1, 0).getDate()).fill(0).map((_, i) => i + 1);
});

function eventsForDay(day: number): CalendarEventClass[] {
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
function editEvent(event: CalendarEventClass) {
    console.log('Edit event:', event);
    showEventForm.value = true;
}

function deleteEvent(event: CalendarEventClass) {
    events.value = events.value.filter(e => e !== event);
}


function sendNotify(type: "info" | "warning" | "error" | "success", text: string) {
    if (notificationManager.value) {
        (notificationManager.value as any).showNotification({
            type: type,
            message: text,
        })
    } else {
        console.log("notification manager not found")
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
        sendNotify("error", errorMessage)
    } else {
        // Imposta l'evento con la data convertita
        currentEvent.value.eventDate = newEventDate;

        let eventID = "." //get event id to do 

        const newEvent = new CalendarEventClass(
            eventID,
            newEventDate,
            currentEvent.value.title,
            currentEvent.value.description,
            currentEvent.value.notifications,
            currentEvent.value.category,
            currentEvent.value.durationInH
        );
        // Aggiungi il nuovo evento all'array degli eventi
        events.value.push(newEvent);
        sendNotify("success", "Event " + currentEvent.value.title + " added successfully")
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
    eventDateInput.value = ""
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
        let e = new CalendarEventClass(
            "e " + i,
            new Date(year, month, i),
            `Event ${i}`,
            "description",
            [],
            `Category ${i}`,
            i
        );
        events.value.push(e);
        if (i % 2 == 0) {
            e.title = `Other Event ${i}`
            e.id = e.id + " .2"
            events.value.push(e);
        }

    }
});
</script>

<style scoped>
.calendar {
    padding: 20px;
    overflow-y: auto;
}

.calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}



/* Stile per il selettore personalizzato */
.month-selector {
    position: relative;
    padding: 8px 12px;
    border: 2px solid var(--button-border, #10B981);
    border-radius: 4px;
    background: var(--button-background, #10B981);
    color: #fff;
    font-size: 1em;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
}

.month-selector:focus {
    outline: none;
    border-color: var(--button-border, #0d8f6c);
}

.month-picker-content,
.add-event-content {
    background: #212121;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    text-align: center;
    border: 1px solid #15b680d4;
}



.add-event-content {
    width: 500px;
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;
}

.add-event-content h3 {
    margin-bottom: 10px;
}

.form-group {
    margin-bottom: 10px;
    text-align: left;
}

.form-group label {
    display: block;
    margin-bottom: 4px;
    font-size: 0.9em;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #444;
    border-radius: 4px;
    background: #333;
    color: #fff;
}

.form-group input,
.form-group textarea {
    border: 0.7px solid var(--input-field-border);
    transition: border-color 0.3s ease, border-width 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    border-color: var(--button-border);
}

.picker-row {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 15px 0;
}

.picker-actions,
.add-event-actions {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px
}

.picker-actions button {
    width: 90px;
}

/* Calendario */
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    overflow-y: auto;
}

.calendar-day {
    border: 1px solid #ddd;
    min-height: 100px;
    padding: 5px;
    display: flex;
    flex-direction: column;
    border-radius: 10%;
    transition: all 0.3s ease;
}

.calendar-day:hover {
    transform: scale(1.05);
    z-index: 1;
}

.day-number {
    font-weight: bold;
    margin-bottom: 5px;
}

.events-for-day {
    flex: 1;
    overflow-y: auto;
}

/* Nascondi scrollbar in WebKit e Firefox se necessario */
.calendar::-webkit-scrollbar,
.calendar-grid::-webkit-scrollbar,
.add-event-content::-webkit-scrollbar {
    display: none;
}

.calendar {
    scrollbar-width: none;
}

.event-details {
    margin-top: 5px;
}

.event-extra {
    font-size: 0.8em;
    color: #555;
    margin-top: 2px;
}
</style>