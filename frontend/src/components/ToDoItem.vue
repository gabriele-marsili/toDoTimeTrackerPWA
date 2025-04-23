<template>

  <div class="todo-item" :class="{ completed: localTodo.completed, [viewMode]: true }">
    <!-- Header: checkbox + titolo + pulsanti -->
    <div class="todo-header">
      <input class="baseCheckbox" type="checkbox" v-model="localTodo.completed" @change="onCompletedChange" />
      <div class="title-meta-wrapper">
        <span class="todo-title" :class="{ strikethrough: localTodo.completed }">
          {{ localTodo.title }}
        </span>
        <div class="meta-info">
          <span class="todo-date">{{ dateWithTimeString }}</span>
          <span v-if="localTodo.subActions.size > 0" class="subtask-count">
            <span class="material-symbols-outlined g-icon">account_tree</span> {{ subTaskProgress }}
          </span>
        </div>
      </div>
      <div class="action-buttons">
        <button v-if="!localTodo.completed" @click="editing = !editing">
          <span class="material-symbols-outlined g-icon">edit</span>
        </button>
        <button @click="copyToDo">
          <span class="material-symbols-outlined g-icon">content_copy</span>
        </button>
        <button @click="deleteToDo">
          <span class="material-symbols-outlined g-icon">delete</span>
        </button>
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
          <ToDoList :trigger-add-to-do="false" isSubList @sub-to-do-notify="handleSubToDoNotify" @subToDoEvent="handleSubToDoEvent" @todoEvent=passToDoEvent
            :todos=Array.from(localTodo.subActions.values()) viewMode="list">
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

//const localToDoObj = ref<ToDoObj>(props.todo.getAsObj());
const editing = ref(false);
const originalToDoCopy = ref<ToDoAction | null>(null);
const subTaskProgress = computed(() => {
  const total = localTodo.value.subActions.size;
  const completed = [...localTodo.value.subActions.values()].filter(t => t.completed).length;
  return `${completed}/${total}`;
});

const dateWithTimeString = computed({
  get: () => formatDate(localTodo.value.dateWithTime),
  set: (val: string) => {
    localTodo.value.dateWithTime = parseStringToDate(val);
    emit('update', { updated: localTodo.value, karmaCoinsChange: 0 });
  }
});



async function onCompletedChange() {
  const completed = localTodo.value.completed
  if (completed) {
    localTodo.value.setAsCompleted();
  } else {
    localTodo.value.setAsNotCompleted();
  }

  let karmaCoinsChange = 0
  const relatedCategory = props.userCategories.find(c => c.name == localTodo.value.category)
  if (relatedCategory) {
    if (completed) {
      karmaCoinsChange = relatedCategory.points
      emit("sendNotify", { type: "success", text: `Completed to do ${localTodo.value.title}, +${karmaCoinsChange} karma coins` })
    } else { // => user ha settato to do come non completata      
      karmaCoinsChange = -relatedCategory.points
      emit("sendNotify", { type: "warning", text: `Un-completed to do ${localTodo.value.title}, ${karmaCoinsChange} karma coins` })
    }
  }


  editing.value = false;
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
}

function deleteToDo() {
  emit("delete", localTodo.value)
}

function updateToDo(karmaCoinsChange: number = 0) {
  console.log("emit update by to do item with local to do:\n", localTodo.value)
  emit("update", { updated: localTodo.value, karmaCoinsChange });
  editing.value = false
}

watch(() => props.todo, (newVal) => {
  localTodo.value = newVal;
});
watch(editing, (val) => {
  if (val) {
    originalToDoCopy.value = localTodo.value.clone();
  }
});


//handle sub-actions : 
function passToDoEvent(eventContent: { type: string, newToDoQuantity: number }) {
  emit("todoEvent", eventContent)
}

function handleSubToDoNotify(notifyContent:{type:"success"|"info"|"warning"|"error",text:string}){
  emit("sendNotify",notifyContent) //pass to parent component (to do list)
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

.todo-item:hover {
  background: #333;
  box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1);
}

.todo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  gap: 10px;
  margin-top: 2px;
  font-size: 0.7em;
  color: #aaa;
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

.strikethrough {
  text-decoration: line-through;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.action-buttons button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.action-buttons button:hover {
  background-color: rgba(255, 255, 255, 0.1);
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
</style>
