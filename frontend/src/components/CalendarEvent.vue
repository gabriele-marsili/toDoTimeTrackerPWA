<!-- file: CalendarEvent.vue -->
<template>
    <div class="calendar-event">        
        <div class="event-header">
            <span class="material-symbols-outlined g-icon">schedule</span>
            <span class="event-date">{{ formattedDate.split(":")[1] }}</span>            
        </div>
        <div class="event-body">
            <h4 class="event-title">{{ event.title }}</h4>
        </div>
        <!-- Pulsanti di azione (modifica, elimina, ecc.) possono essere aggiunti qui -->
        <div class="event-actions">
            <button @click="$emit('edit', event)">
                <span class="material-symbols-outlined g-icon">edit</span>
            </button>
            <button @click="$emit('delete', event)">
                <span class="material-symbols-outlined g-icon">delete</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
import { CalendarEvent } from '../engine/calendarEvent';
import { formatDate } from '../utils/generalUtils';

const props = defineProps<{
    event: CalendarEvent;
}>();

const emit = defineEmits<{
    (e: 'edit', event: CalendarEvent): void;
    (e: 'delete', event: CalendarEvent): void;
}>();

const formattedDate = computed(() => {
    const date = props.event.eventDate;        
    return formatDate(date);
});
</script>

<style scoped>
.calendar-event {
    border-radius: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.calendar-event:hover {
    transform: translateY(-2px);
}

.event-header {
    display: flex;
    justify-content: center;
    font-size: 0.9em;
    color: #555;
}

.event-title {
    margin: 5px 0;
    font-size: 0.8em;
}

.event-actions button {
    margin-right: 5px;
    gap : 5px;
}

.event-actions button :hover {
    background-color: rgba(255, 255, 255, 0.1);
}
</style>