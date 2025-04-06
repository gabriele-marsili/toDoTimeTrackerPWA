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
                    <span>{{ minToParsedTime(tt_rule.remainingTimeMin) }}</span>
                </div>

                <div class="info">
                    <span class="material-symbols-outlined g-icon">category</span>
                    <span class="category">{{ tt_rule.category }}</span>
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
import { TimeTrackerRule, ruleType } from '../engine/timeTracker';
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
});
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
    justify-content: center;
    flex-direction: column;
    gap : 3px
}

.info {
    display: flex;
    justify-content: left;
    flex-direction: row;

}

.rule-info span {
    margin-right: 10px;
}

.rule-actions {
    display: flex;
    justify-content: center;
    flex-direction: column;
    gap : 28px
}

.rule-actions button,
.edit-actions button {
    margin-right: 5px;
    border-radius: 4px;
}

.rule-actions button:hover {
    background: #333;
    box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1);
}

.rule-display {
    display: flex;
    justify-content: center;
    flex-direction: row;
}
</style>