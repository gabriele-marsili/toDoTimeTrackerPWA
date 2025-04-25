<template>

  <div class="todo-item" :class="{ completed: localTodo.completed, expired: isExpired, [viewMode]: true }">
    <!-- Header: checkbox + titolo + pulsanti -->
    <div class="todo-header">
      <div class="checkbox-wrapper">
        <input :class="[priorityClass]" class="baseCheckbox" type="checkbox" v-model="localTodo.completed"
          @change="onCompletedChange" :disabled="isExpired && localTodo.completed" />
      </div>

      <div class="title-meta-wrapper">
        <span class="todo-title" :class="{ strikethrough: localTodo.completed }">
          {{ localTodo.title }}
        </span>

        <div class="meta-info">
          <span v-if="localTodo.expiration" class="meta-item todo-expiration" :class="{ 'text-red-500': isExpired }">
            Expires: {{ expirationDateString }}
          </span>
          <span v-if="localTodo.subActions && localTodo.subActions.size > 0" class="meta-item subtask-count">
            <span class="material-symbols-outlined g-icon">account_tree</span> {{ subTaskProgress }}
          </span>
          <span v-if="localTodo.category" class="meta-item todo-category">
            Category: {{ localTodo.category }}
          </span>
        </div>

      </div>
      <div class="action-buttons">
        <button v-if="showReplanButton" @click="openReplan" title="Replan To Do">
          <span class="material-symbols-outlined g-icon">event_repeat</span>
        </button>

        <button v-if="!localTodo.completed" @click="editing = !editing" title="Edit To Do">
          <span class="material-symbols-outlined g-icon">edit</span>
        </button>
        <button @click="copyToDo" title="Copy To Do">
          <span class="material-symbols-outlined g-icon">content_copy</span>
        </button>
        <button @click="deleteToDo" title="Delete To Do">
          <span class="material-symbols-outlined g-icon">delete</span>
        </button>
      </div>

    </div>

    <!-- replan box -->
    <div v-if="replanMode" class="modal">
      <div class="content">
        <h4>Replan To Do</h4>
        <div class="replan-date-options">
          <button class="baseButton smallButton" @click="setReplanDate('today')">Today
            <span class="material-symbols-outlined g-icon">calendar_today</span>
          </button>
          <button class="baseButton smallButton" @click="setReplanDate('tomorrow')">Tomorrow
            <span class="material-symbols-outlined g-icon">event_upcoming</span>
          </button>
        </div>
        <div class="replan-form-group">
          <label>Date:</label>
          <DatePicker :isDarkMode="isDarkMode" v-model="localTodo.dateWithTime" />
        </div>
        <div class="replan-form-group">
          <label>Expiration Date:</label>
          <DatePicker :isDarkMode="isDarkMode" v-model="localTodo.expiration" />
        </div>
        <div class="replan-form-group">
          <label>Notify Date:</label>
          <DatePicker :isDarkMode="isDarkMode" v-model="localTodo.notifyDate" />
        </div>
        <div class="replan-actions">
          <button class="baseButton smallButton" @click="handleReplanConfirm">Confirm
            <span class="material-symbols-outlined g-icon">check_circle</span>
          </button>
          <button class="baseButton smallButton" @click="handleReplanCancel">Cancel
            <span class="material-symbols-outlined g-icon">cancel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- edit box -->
    <div v-if="editing && !localTodo.completed" class="modal">
      <div class="content">
        <h3>Edit To Do Action : {{ localTodo.title }}</h3>
        <div class="form-group">
          <label for="todo_title">Title:</label>
          <input id="todo_title" class="baseInputField" type="text" v-model="localTodo.title" placeholder="Title" />
        </div>

        <div class="form-group">
          <label for="todo_description">Description:</label>
          <input id="todo_description" class="baseInputField" type="text" v-model="localTodo.description"
            placeholder="Description" />
        </div>

        <div class="form-group">
          <label for="todo_category">Category:</label>
          <select class="selettore" id="todo_category" v-model="localTodo.category">
            <option v-for="category in props.userCategories" :key="category.name" :value="category.name">{{
              category.name }} ({{ category.points }} points)</option>
          </select>

        </div>

        <div class="form-group">
          <label for="todo_priority">Priority:</label>
          <select class="selettore" id="todo_priority" v-model.number="localTodo.priority">
            <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="todo_date">Date:</label>
          <DatePicker :isDarkMode=isDarkMode v-model="localTodo.dateWithTime" />
        </div>

        <div class="form-group">
          <label for="todo_expiration">Expiration:</label>
          <DatePicker :isDarkMode=isDarkMode v-model="localTodo.expiration" />
        </div>

        <div class="form-group">
          <label for="todo_expiration">Notify Date:</label>
          <DatePicker :isDarkMode=isDarkMode v-model="localTodo.notifyDate" />
        </div>

        <!-- SubActions List -->
        <div class="form-group">
          <label>Sub Actions:</label>
          <ToDoList :trigger-add-to-do="false" isSubList @sub-to-do-notify="handleSubToDoNotify"
            @subToDoEvent="handleSubToDoEvent" @todoEvent=passToDoEvent :todos=Array.from(localTodo.subActions.values())
            viewMode="list">
          </ToDoList>
        </div>


        <div class="button-actions">
          <button class="baseButton" @click="addSubToDo">
            Add SubAction
            <span class="material-symbols-outlined g-icon">add</span>
          </button>

          <button class="baseButton" @click="updateToDo()">Confirm Edit
            <span class="material-symbols-outlined g-icon">check_circle</span>
          </button>
          <button class="baseButton" @click="() => {
            if (originalToDoCopy) {
              localTodo = originalToDoCopy.clone()
            }
            editing = false;
          }">Cancel
            <span class="material-symbols-outlined g-icon">cancel</span>
          </button>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue';
import { ToDoAction } from '../engine/toDoEngine'
import { formatDate, parseStringToDate } from '../utils/generalUtils';
import DatePicker from './DatePicker.vue';
import ToDoList from './ToDoList.vue';
import { format, isPast, startOfDay, endOfDay, addDays, parseISO } from 'date-fns';

interface Props {
  todo: ToDoAction,
  viewMode: 'list' | 'grid',
  userCategories: {
    name: string;
    points: number;
  }[]
}

const props = defineProps<Props>();
const emit = defineEmits(["sendNotify", "update", "delete", "copy", "todoEvent", "addSubToDo"]);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const localTodo = ref<ToDoAction>(props.todo);
const editing = ref(false);
const replanMode = ref(false);
const originalToDoCopy = ref<ToDoAction | null>(null);
// Stato per salvare le date originali prima di entrare in modalità replan
const originalReplanDates = ref<{ dateWithTime: Date | null, expiration: Date | null, notifyDate: Date | null } | null>(null);

const subTaskProgress = computed(() => {
  const total = localTodo.value.subActions.size;
  const completed = [...localTodo.value.subActions.values()].filter(t => t.completed).length;
  return `${completed}/${total}`;
});

const isExpired = computed(() => {
  // ToDo è scaduta se ha una data di scadenza valida ed è nel passato (fine giornata inclusa)
  if (!localTodo.value.expiration) return false;
  try {
    const expirationDate = localTodo.value.expiration instanceof Date ? localTodo.value.expiration : parseISO(localTodo.value.expiration as any);
    if (isNaN(expirationDate.getTime())) return false; // Data non valida
    return isPast(endOfDay(expirationDate));
  } catch (e) {
    console.error("Error checking if expired:", localTodo.value.expiration, e);
    return false;
  }
});

const showReplanButton = computed(() => isExpired.value && !localTodo.value.completed);


const expirationDateString = computed(() => {

  return localTodo.value.expiration ? formatDate(localTodo.value.expiration) : 'N/A';
});

const priorityClass = computed(() => {
  const priority = localTodo.value.priority;
  if (priority === null || priority === undefined) return 'priority-none'; // Nessuna priorità impostata
  if (priority >= 4) return 'priority-very-high';
  if (priority >= 3) return 'priority-high';
  if (priority >= 2) return 'priority-medium';
  if (priority >= 1) return 'priority-none';
  return 'priority-none'; // Per priorità 0 o altre
});



// --- Handlers principali ---


async function onCompletedChange() {
  const completed = localTodo.value.completed
  if (completed) {
    localTodo.value.setAsCompleted();
  } else {
    localTodo.value.setAsNotCompleted();
  }

  let karmaCoinsChange = 0
  const relatedCategory = props.userCategories.find(c => c.name == localTodo.value.category)
  if (relatedCategory && relatedCategory.points > 0) {
    if (completed) {
      karmaCoinsChange = relatedCategory.points
      emit("sendNotify", { type: "success", text: `Completed to do ${localTodo.value.title}, +${karmaCoinsChange} karma coins` })
    } else { // => user ha settato to do come non completata      
      karmaCoinsChange = -relatedCategory.points
      emit("sendNotify", { type: "warning", text: `Un-completed to do ${localTodo.value.title}, ${karmaCoinsChange} karma coins` })
    }
  }
  editing.value = false;
  replanMode.value = false;
  emit('update', { updated: localTodo.value, karmaCoinsChange });

}

function addSubToDo() {
  emit("addSubToDo", localTodo.value.id)

}

function copyToDo() {
  const localToDoValue = localTodo.value;
  const id = new Date().getTime().toString() //use actual timestamp as id  
  const copiedToDo = new ToDoAction(id, localToDoValue.title, localToDoValue.priority, localToDoValue.dateWithTime, localToDoValue.expiration, localToDoValue.notifyDate, localToDoValue.category, localToDoValue.description)
  console.log("copiedToDo:\n", copiedToDo)
  localToDoValue.subActions.forEach(subA => copiedToDo.addOrUpdateSubToDoAction(subA))
  emit("copy", copiedToDo)
  editing.value = false;
  replanMode.value = false;
}

function deleteToDo() {
  emit("delete", localTodo.value)
  editing.value = false;
  replanMode.value = false;
}

function updateToDo(karmaCoinsChange: number = 0) {
  console.log("emit update by to do item with local to do:\n", localTodo.value)
  emit("update", { updated: localTodo.value, karmaCoinsChange });
  editing.value = false
  replanMode.value = false;
}

watch(() => props.todo, (newVal) => {
  localTodo.value = newVal;
});
watch(editing, (val) => {
  if (val) {
    originalToDoCopy.value = localTodo.value.clone();
  }
});

// --- Handlers per Replan ---
function openReplan() {
  // Salva le date correnti prima di permettere la modifica
  originalReplanDates.value = {
    dateWithTime: localTodo.value.dateWithTime,
    expiration: localTodo.value.expiration,
    notifyDate: localTodo.value.notifyDate,
  };
  replanMode.value = true; // Apri il riquadro
  editing.value = false; // Assicurati che il modal di edit sia chiuso
}

function handleReplanCancel() {
  // Ripristina le date originali e chiudi il riquadro
  if (originalReplanDates.value) {
    localTodo.value.dateWithTime = originalReplanDates.value.dateWithTime || localTodo.value.dateWithTime;
    localTodo.value.expiration = originalReplanDates.value.expiration || localTodo.value.expiration;
    localTodo.value.notifyDate = originalReplanDates.value.notifyDate || localTodo.value.notifyDate;
  }
  replanMode.value = false;
  originalReplanDates.value = null; // Resetta lo stato salvato
}

function handleReplanConfirm() {
  // Applica le modifiche (le date sono già modificate tramite v-model nel riquadro)
  // Emetti l'evento di update. Nessun cambiamento di karma previsto qui.
  updateToDo(0); // Passa 0 per karmaCoinsChange
  // Il riquadro viene chiuso da updateToDo
  originalReplanDates.value = null; // Resetta lo stato salvato
}

function setReplanDate(option: 'today' | 'tomorrow') {
  let newDate: Date;
  const now = new Date();
  switch (option) {
    case 'today':
      newDate = startOfDay(now);
      break;
    case 'tomorrow':
      newDate = startOfDay(addDays(now, 1));
      break;
    default:
      return; // Non fare nulla per opzioni non riconosciute
  }

  // Applica la nuova data all'inizio del giorno selezionato per tutte le date della ToDo
  localTodo.value.dateWithTime = newDate;
  localTodo.value.expiration = newDate;
  localTodo.value.notifyDate = newDate;

  // Nota: questo non salva immediatamente, l'utente deve cliccare "Confirm"
}


//handle sub-actions : 
function passToDoEvent(eventContent: { type: string, newToDoQuantity: number }) {
  emit("todoEvent", eventContent)
}

function handleSubToDoNotify(notifyContent: { type: "success" | "info" | "warning" | "error", text: string }) {
  emit("sendNotify", notifyContent) //pass to parent component (to do list)
}

function handleSubToDoEvent(eventContent: { type: "delete" | "copy" | "update", todo: ToDoAction, karmaCoinsChange: number }) {
  try {
    const toDo = toRaw(eventContent.todo)
    console.log("handleSubToDoEvent event:\n", eventContent)
    console.log("toDo:\n", toDo)
    console.log("toDo.id : ", toDo.id)
    switch (eventContent.type) {
      case 'delete':
        localTodo.value.subActions.delete(toDo.id)
        break;
      case 'copy': //add new copied to do
        localTodo.value.subActions.set(toDo.id, toDo)
        break;
      case 'update': //update to do in the sub actions map
        localTodo.value.subActions.set(toDo.id, toDo)
        console.log("toDo sub action : ", toDo.id)
        break;
      default:
        throw new Error("unsupported type : " + eventContent.type)
    }

    updateToDo(eventContent.karmaCoinsChange) //propagate update event to parent component (main list) that will update db 
  } catch (error) {
    console.log("error in handleSubToDoEvent:\n", error)
  }
}
</script>

<style scoped>
.todo-item {
  border: 1px solid #15b680d4;
  background: #212121;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.todo-item.expired {
  border-color: #f44336;
  border-width: 2px;
}

.todo-item:hover {
  background: #333;
  box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1);
}

.todo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Wrapper per la checkbox per lo styling del bordo */
.checkbox-wrapper {
  display: inline-block;
  /* O flex / grid se vuoi centrare la checkbox */
  border: 2px solid transparent;
  /* Bordo di default trasparente */
  border-radius: 4px;
  /* Arrotonda gli angoli del bordo */
  padding: 2px;
  /* Spazio tra bordo e checkbox */
  transition: border-color 0.3s ease, border-width 0.3s ease;
}


/* Stili bordo checkbox basati sulla priorità */
.priority-none {
  border: 2px solid var(--checkbox-border);
}

.priority-medium {
  border-color: #FFEE58;
  /* Giallo */
}

.priority-high {
  border-color: #FFB300;
  /* Arancione */
}

.priority-very-high {
  border-color: #E53935;
  /* Rosso */
}

.title-meta-wrapper {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  flex-grow: 1;
  align-items: flex-start;
}

.todo-title {
  font-size: 1em;
  line-height: 1.2;
}

.meta-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 2px;
  font-size: 0.7em;
  color: #aaa;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.subtask-count .g-icon,
.meta-item .material-symbols-outlined {
  font-size: 1em;
}

.todo-date,
.todo-expiration,
.todo-notify,
.todo-category,
.todo-priority {
  color: #bbb;
}

.todo-expiration.text-red-500 {
  color: #f44336;
  /* Colore rosso per data scadenza se expired */

}

.strikethrough {
  text-decoration: line-through;
  color: #888;
  /* Colore grigio per completate */
}

.subtask-count {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75em;
}

.todo-date {
  color: #bbb;
}


.action-buttons {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.action-buttons button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  color: var(--text-color);
}

.action-buttons button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Stili per il riquadro Replan (inline) */
.replan-section {
  margin-top: 15px;
  padding: 15px;
  border: 1px dashed #15b680d4;
  border-radius: 4px;
  background-color: rgba(21, 182, 128, 0.1);
  /* Sfondo leggermente colorato */
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.replan-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--primary-color);
}

.replan-date-options,
.replan-form-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 30px;  
}

.replan-form-group label {
  min-width: 120px;
  /* Larghezza minima per le label */
  font-size: 0.9em;
  color: #bbb;
}

.replan-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;
  /* Centra bottoni su schermi piccoli */
}

/* Stili per i bottoni piccoli nel riquadro replan */
.baseButton.smallButton {
  padding: 5px 10px;
  font-size: 0.8em;
  height: auto;
  min-width: 80px;
  /* Larghezza minima per i bottoni */
  justify-content: center;
}

/* Stili per i DatePicker nel riquadro replan */
.replan-section .v-cal-datepicker {
  /* Adegua stili DatePicker se necessario */
  width: auto;
  /* Lascia che il DatePicker si adatti al contenuto/flexbox */
  flex-grow: 1;
  /* Permetti al datepicker di occupare spazio */
}

.replan-section .date-range-group {
  /* Se il DatePicker crea un .date-range-group al suo interno, adegua questi stili */
  /* Altrimenti, potresti non aver bisogno di questa regola */
  gap: 8px;
}


/*edit to do box */
.content {
  background: #212121;
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  text-align: center;
  border: 1px solid #15b680d4;
}

.content h3 {
  margin-bottom: 10px;
}

.content::-webkit-scrollbar {
  display: none;
}

.button-actions {
  margin-top: 3%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  /* Eventuali altre proprietà per modificare colore, dimensioni, margini dell’icona */
}

.addButton {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color);
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #15b680d4;
  height: 20px;
  width: 20px;
  border-radius: 75%;
  cursor: pointer;

  text-align: center;
}

.addButton:hover {
  background-color: rgba(16, 185, 129, 0.305);
}


.selettore:hover {
  background-color: #333;
}
</style>
