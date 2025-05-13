<template>
    <NotificationManager ref="notificationManager" />
    <div class="calendar">
        <div class="calendar-header">
            <button class="baseButton" @click="prevMonth">
                <span class="material-symbols-outlined g-icon">arrow_back_ios</span>
            </button>
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
                    <template v-if="hoveredDay !== day">
                        <span v-if="eventsForDay(day).length > 1">
                            {{ eventsForDay(day).length }} events
                        </span>
                        <span v-else-if="eventsForDay(day).length === 1">
                            1 event
                        </span>
                    </template>
                    <template v-else>
                        <div v-for="event in eventsForDay(day)" :key="event.title + event.eventDate"
                            class="event-details">
                            <CalendarEvent :event="event" @edit="editEvent" @delete="deleteEvent" />
                            <div v-if="eventsForDay(day).length === 1" class="event-extra"> {{ event.description }}
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- Modal o form per aggiungere/modificare evento -->
        <div v-if="showEventForm" class="modal">
            <div class="add-event-content">
                <h3>{{ isEditEvent ? "Edit" : "Add New" }} Event</h3>
                <div class="form-group">
                    <label for="eventDate">Event Date:</label>
                    <DatePicker :isDarkMode=isDarkMode v-model="eventDateInput" />
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
                    <select class="selettore" name="catgory" id="category" v-model="currentEvent.category">
                        <option v-for="category in userInfo.categories" :key="category.name" :value="category.name">{{
                            category.name }} ({{ category.points }} points)</option>
                    </select>


                </div>
                <div class="form-group">
                    <label for="duration">Duration (hours):</label>
                    <input class="baseInputField" id="duration" type="number" min="0.5" step="0.5"
                        v-model.number="currentEvent.durationInH" />
                </div>

                <div class="form-group">
                    <label for="Notices">Notices:</label>
                    <div v-if="currentEvent.notices.length > 0">
                        <div v-for="(notice, idx) in currentEvent.notices" :key="notice.notificationID"
                            class="flex items-end space-x-2 mb-2">
                            <!-- Schedule At -->
                            <div class="flex-1">
                                <label class="block text-xs font-medium mb-1">When:</label>
                                <DatePicker :isDarkMode=isDarkMode v-model="notice.scheduleAt_timestamp" />
                            </div>
                            <!-- Title -->
                            <div class="flex-1">
                                <label class="block text-xs font-medium mb-1">Notice Title</label>
                                <input class="baseInputField" v-model="notice.title" />
                            </div>
                            <!-- Body -->
                            <div class="flex-1">
                                <label class="block text-xs font-medium mb-1">Notice Description</label>
                                <input class="baseInputField" v-model="notice.body" />
                            </div>
                            <!-- Remove Button -->
                            <button @click="removeNotice(idx)" class="baseButton">
                                <span class="material-symbols-outlined g-icon">delete</span>
                            </button>

                        </div>
                    </div>
                    <div v-else class="mb-2 text-sm text-gray-500">
                        No notices setted yet.
                    </div>

                    <p v-if="!canAddNotice" class="mt-1 text-xs text-red-500">
                        You've reched the limit of 5 notices for this event.
                    </p>

                </div>

                <div class="add-event-actions">
                    <button @click="addNoticeBoxOpen = true" v-if="canAddNotice" :disabled="!canAddNotice"
                        class="baseButton">
                        Add Notice
                        <span class="material-symbols-outlined g-icon">add_circle</span>
                    </button>

                    <button class="baseButton" @click="addOrUpdateEvent">Apply
                        <span class="material-symbols-outlined g-icon">check_circle</span>
                    </button>

                    <button class="baseButton" @click="canceladdOrUpdateEvent">Cancel
                        <span class="material-symbols-outlined g-icon">cancel</span>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="addNoticeBoxOpen" class="modal">
            <div class="add-event-content">
                <h3>Add New Notice for event {{ currentEvent.title }}</h3>
                <div class="form-group">
                    <label for="eventDate">Notice Date:</label>
                    <DatePicker :isDarkMode=isDarkMode v-model="currentNoticeDateInput" />
                </div>
                <div class="form-group">
                    <label for="description">Notice Description:</label>
                    <textarea class="baseInputField" id="description" v-model="currentNotice.body"
                        placeholder="Notice Description"></textarea>
                </div>

                <div class="add-event-actions">
                    <button class="baseButton" @click="addNotice">Add Notice
                        <span class="material-symbols-outlined g-icon">check_circle</span>
                    </button>
                    <button class="baseButton" @click="canceladdNotice">Cancel
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
import { CalendarEvent as CalendarEventClass, CalendarEventHandler, CalendarObj } from '../engine/calendarEvent';
import NotificationManager from '../gestors/NotificationManager.vue';
import { API_gestor } from '../backend-comunication/api_comunication';
import { userDBentry } from '../types/userTypes';
import { UserHandler } from '../engine/userHandler';
import { useRouter } from 'vue-router';
import { delay, isToday } from '../utils/generalUtils';
import DatePicker from './DatePicker.vue';
import { TTT_Notification } from '../engine/notification';

const api_gestor = API_gestor.getInstance()
const userHandler = UserHandler.getInstance(api_gestor)
const calendarHandler = CalendarEventHandler.getInstance(api_gestor);
const defaultImagePath = "../../public/user.avif"
const router = useRouter()
const userInfo = ref<userDBentry>({
    username: "",
    avatarImagePath: defaultImagePath,
    age: 1,
    categories: [],
    createdAt: new Date(),
    email: "",
    firstName: "",
    lastName: "",
    licenseIsValid: false,
    licenseKey: "",
    notifications: false,
    permissions: false,
    phone: "",
    timeTrackerActive: false,
    karmaCoinsBalance: 0,
    friends: [],
    fcmToken: "",
    frame : "",
    karmaBoost:0
});
const addNoticeBoxOpen = ref(false);
const emit = defineEmits(["calendarEvent"])
const currentDate = ref(new Date());
const events = ref<CalendarEventClass[]>([]);
const showEventForm = ref(false);
const isEditEvent = ref(false)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const currentEvent = ref<CalendarObj>({
    id: '',
    eventDate: new Date(),
    title: '',
    description: '',
    durationInH: 0,
    category: '',
    notices: []
})
const eventDateInput = ref("")
const currentNotice = ref<TTT_Notification>({
    title: "",
    scheduleAt_timestamp: new Date(),
    body: "",
    notificationID: "",
    imagePath: "",
    fcmToken: "",
    tag: ""
})
const currentNoticeDateInput = ref<Date>(new Date())
const notificationManager = ref(null);

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
const canAddNotice = computed(() => currentEvent.value.notices.length < 5);
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

function openMonthPicker() {    
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


function editEvent(event: CalendarEventClass) {
    console.log('Edit event:', event);
    showEventForm.value = true;
    isEditEvent.value = true
    currentEvent.value = event
}

async function deleteEvent(event: CalendarEventClass) {
    try {
        const deleteRes = await calendarHandler.removeEvent(userInfo.value.licenseKey, event)
        if (!deleteRes.success) {
            throw new Error(deleteRes.errorMessage)
        } else {
            events.value = events.value.filter(e => e.id !== event.id);
            sendNotify("success", "Event " + currentEvent.value.title + " deleted successfully")
            emit("calendarEvent", { type: "delete event", newEventsQuantity: events.value.length, isToday : isToday(event.eventDate) })
        }
    } catch (error: any) {
        sendNotify("error", "Error deleting event : " + error.message);
    }
}

function canceladdNotice() {
    currentNotice.value = {
        title: "",
        scheduleAt_timestamp: new Date(),
        body: "",
        notificationID: "",
        imagePath: "",
        fcmToken: "",
        tag: ""
    }
    addNoticeBoxOpen.value = false;
}

function addNotice() {
    if (!canAddNotice.value) return;
    const idx = currentEvent.value.notices.length + 1;
    console.log("adding notice (calendar.vue) with scheduled at: ",currentNoticeDateInput.value);
    const notice: TTT_Notification = {
        notificationID: `${currentEvent.value.id}_notices_${idx}_${Date.now()}`,
        body: currentNotice.value.body,
        scheduleAt_timestamp: currentNoticeDateInput.value,
        imagePath: 'default logo',
        tag: 'event notice',
        title: currentEvent.value.title,
        fcmToken: '',
    };
    currentEvent.value.notices.push(notice);
    sendNotify("success", "Successfully addedd notice for event " + currentEvent.value.title)
    canceladdNotice()
}

async function removeNotice(index: number) {
    const deletedNotices = currentEvent.value.notices.splice(index, 1);
    if (deletedNotices.length > 0) {
        const deletedNoticeID = deletedNotices[0].notificationID
        const index = events.value.findIndex(x => x.notices.findIndex(n => n.notificationID == deletedNoticeID))
        if (index != -1) {

            const r = await api_gestor.deleteNotification(deletedNoticeID, userInfo.value.licenseKey)
            if (r.success) {
                sendNotify("success", "Successfully deleted notice for event " + currentEvent.value.title)
            } else {
                sendNotify("error", "Error deleting notice: " + r.errorMessage)
            }
        } else {
            sendNotify("success", "Successfully deleted notice for event " + currentEvent.value.title)
        }
        return;
    }
    sendNotify("warning", "Notice not deleted correctly");
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

async function addOrUpdateEvent() {
    let errorMessage = '';

    try {
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

            let eventID = calendarHandler.getNextCalendarEventId()

            const newEvent = new CalendarEventClass(
                eventID,
                newEventDate,
                currentEvent.value.title,
                currentEvent.value.description,
                currentEvent.value.category,
                currentEvent.value.durationInH
            );
            
            //set notices for new event
            currentEvent.value.notices.forEach(x => newEvent.notices.push(x))
            
            

            const index = events.value.findIndex(e => e.id == eventID)
            if (index != -1 && !isEditEvent.value) {
                throw new Error("Invalid event id : already present")
            }
            if (index == -1 && isEditEvent.value) {
                throw new Error("Invalid event id : editing an event not already present")
            }

            const addRes = await calendarHandler.addOrUpdateEvent(userInfo.value.licenseKey, newEvent)
            if (!addRes.success) {
                throw new Error(addRes.errorMessage)
            } else {
                let action = isEditEvent.value ? "edited" : "added"
                if (isEditEvent.value) {
                    if (index != -1) {
                        events.value[index] = newEvent;
                    }
                } else {
                    events.value.push(newEvent);
                    emit("calendarEvent", { type: "add event", newEventsQuantity: events.value.length, isToday : isToday(newEvent.eventDate)})
                }
                sendNotify("success", "Event " + currentEvent.value.title + " " + action + " successfully")
                await askCalendarEvents()
            }
        }
    } catch (error: any) {
        let a = isEditEvent.value ? "adding" : "editing"
        sendNotify("error", "Error " + a + " event : " + error.message)

    } finally {
        // Resetta il form
        await delay(1300)
        resetEventForm();
        showEventForm.value = false;
        isEditEvent.value = false;
    }
}

function resetEventForm() {
    currentEvent.value = {
        id: '',
        eventDate: new Date(),
        title: '',
        description: '',
        category: '',
        durationInH: 1,
        notices: []
    };
    eventDateInput.value = ""
}

function canceladdOrUpdateEvent() {
    resetEventForm();
    showEventForm.value = false;
}


async function askCalendarEvents() {
    try {
        const calendarHandlerRes = await calendarHandler.loadAllEvents(userInfo.value.licenseKey)
        if (calendarHandlerRes.success) {
            const calendarEvents = calendarHandlerRes.events
            console.log("calendarEvents by db:\n", calendarEvents)
            events.value = []
            for (let event of calendarEvents) {
                events.value.push(calendarHandler.fromCalendarObj(event))
            }
            const todayEventsQuantity = events.value.filter(e => isToday(e.eventDate)).length
            emit("calendarEvent", { type: "load events", newEventsQuantity: events.value.length, todayEventsQuantity : todayEventsQuantity })
        } else {
            throw new Error(calendarHandlerRes.errorMessage);
        }
    } catch (error: any) {
        sendNotify("error", `Error obtaining calendar events : ${error.message} `)
    }
}

onMounted(async () => {
    const userInfoRes = await userHandler.getUserInfo(true)
    console.log("userInfoRes (calendar):\n", userInfoRes)
    if (!userInfoRes.userInfo_DB) { // => user not logged 

        //redirect to welcome
        await delay(2000)        
        router.push("/welcome")
        return;
    }

    userInfo.value = userInfoRes.userInfo_DB
    await askCalendarEvents();
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




.month-selector {
    position: relative;
    padding: 8px 12px;
    border: 2px solid var(--button-border, #10B981);
    border-radius: 4px;
    background: var(--button-background, #10B981);
    color: var(--color);
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
    background: var(--container-background-color);
    color: var(--color);
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
    background: var(--container-background-color);
    color: var(--color);
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