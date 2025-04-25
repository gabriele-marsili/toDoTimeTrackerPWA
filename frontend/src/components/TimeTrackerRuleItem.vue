<template>
    <div class="rule-item">
        <!-- Visualizzazione in modalità normale -->
        <div class="rule-display">

            <div class="rule-info">
                <div class="info">
                    <span class="material-symbols-outlined g-icon">language</span>
                    <span>{{ tt_rule.site_or_app_name }}</span>
                </div>

                <div class="info">
                    <span class="material-symbols-outlined g-icon">timer</span>
                    <span>Limit: {{ minToParsedTime(tt_rule.minutesDailyLimit) }}</span>
                </div>

                <div class="info">
                    <span class="material-symbols-outlined g-icon">hourglass</span>
                    <span>Remaining: {{ minToParsedTime(tt_rule.remainingTimeMin) }}</span>
                </div>

                <div class="info">
                    <span class="material-symbols-outlined g-icon">category</span>
                    <span class="category">{{ tt_rule.category }}</span>
                </div>

                <div class="info">
                    <span class="material-symbols-outlined g-icon">policy</span>
                    <span>Rule: {{ tt_rule.rule }}</span>
                </div>


            </div>

            <div class="rule-actions">
                <button @click="$emit('edit', tt_rule)">
                    <span class="material-symbols-outlined g-icon">edit</span>
                </button>

                <button @click="$emit('delete', tt_rule)">
                    <span class="material-symbols-outlined g-icon">delete</span>
                </button>
            </div>
        </div>


    </div>


</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { TimeTrackerRule } from '../engine/timeTracker';
import { minToParsedTime } from '../utils/generalUtils';

interface Props {
    rule: TimeTrackerRule;
}
const props = defineProps<Props>();
const emit = defineEmits(['edit', 'delete']);
const tt_rule = ref<TimeTrackerRule>(props.rule);

// Se la prop cambia, aggiorna lo stato locale
watch(() => props.rule, (newVal) => {
    tt_rule.value = newVal;
}, { deep: true });
</script>

<style scoped>
.rule-item {
    border: 1px solid #15b680d4;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 6px;
}

.rule-info {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 5px;
    flex-grow: 1;
}

.info {
    display: flex;
    justify-content: left;
    align-items: center;
    text-align: center;
    flex-direction: row;
    gap: 8px;
    font-size: 0.95em;
}

.info .g-icon {
     font-size: 1.2em; /* Icone leggermente più grandi */
     color: var(--primary-color); /* Colore icona primario */
}

.rule-info span {
    margin-right: 10px;
}

.rule-actions {
    display: flex;
    justify-content: center;
    flex-direction: column;
    gap: 10px; /* Spazio tra i bottoni di azione */
    flex-shrink: 0; /* Evita che l'action section si riduca */
}

.rule-actions button,
.edit-actions button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
     color: var(--text-color); /* Colore icone bottoni */
     display: flex; /* Per centrare l'icona nel bottone */
     justify-content: center;
     align-items: center;
}

.rule-actions button:hover,
.edit-actions button:hover {
    background: #333;
    box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1);
}

.rule-display {
    display: flex;
    /* Ritorna a flexbox per layout orizzontale */
    flex-direction: row;
    justify-content: space-between;
    /* Spazio tra info e actions */
    align-items: center; /* Centra verticalmente le due sezioni */
    flex-wrap: wrap; /* Permette al layout di andare a capo su schermi piccoli */
}
</style>