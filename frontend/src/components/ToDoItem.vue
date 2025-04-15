<template>
  <div class="todo-item" :class="{ completed: localToDoObj.completed, [viewMode]: true }">
    <!-- Header: checkbox + titolo + pulsanti -->
    <div class="todo-header">
      <input class="baseCheckbox" type="checkbox" v-model="localToDoObj.completed" @change="onCompletedChange"
        :disabled="localToDoObj.completed" />
      <div class="title-meta-wrapper">
        <span class="todo-title" :class="{ strikethrough: localToDoObj.completed }">
          {{ localToDoObj.title }}
        </span>
        <div class="meta-info">
          <span class="todo-date">{{ dateWithTimeString }}</span>
          <span v-if="localToDoObj.subActions.length > 0" class="subtask-count">
            <span class="material-symbols-outlined g-icon">account_tree</span> {{ subTaskProgress }}
          </span>
        </div>
      </div>
      <div class="action-buttons">
        <button v-if="!localToDoObj.completed" @click="editing = !editing">
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
    <div v-if="editing && !localToDoObj.completed" class="modal">
      <div class="content">
        <h3>Edit To Do Action : {{ localToDoObj.title }}</h3>
        <div class="form-group">
          <label for="todo_description">Description:</label>
          <input id="todo_description" class="baseInputField" type="text" v-model="localToDoObj.description"
            placeholder="Description" />
        </div>

        <div class="form-group">
          <label for="todo_priority">Priority:</label>
          <select class="selettore" id="todo_priority" v-model.number="localToDoObj.priority">
            <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="todo_expiration">Expiration:</label>
          <!--<input id="todo_expiration" type="datetime-local" class="baseInputField" v-model="expirationString" />-->
          <DatePicker v-model="expirationString" />
        </div>

        <div class="form-group">
          <label for="todo_expiration">Notify Date:</label>
          <DatePicker v-model="notifyDateString" />
          <!--<<input id="todo_expiration" type="datetime-local" class="baseInputField" v-model="notifyDateString" />-->
        </div>

        <div class="button-actions">
          <button class="baseButton" @click="updateToDo">Confirm Edit
            <span class="material-symbols-outlined g-icon">check_circle</span>
          </button>
          <button class="baseButton" @click="editing = false">Cancel
            <span class="material-symbols-outlined g-icon">cancel</span>
          </button><!--to do: da ripristinare val pre-edit -->
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ToDoAction, ToDoObj } from '../engine/toDoEngine'
import { formatDate, parseStringToDate } from '../utils/generalUtils';
import DatePicker from './DatePicker.vue';

interface Props {
  todo: ToDoAction,
  viewMode: 'list' | 'grid'
}

const props = defineProps<Props>();
const emit = defineEmits(["update", "delete", "copy"]);

const localTodo = ref<ToDoAction>(props.todo);
const localToDoObj = ref<ToDoObj>(props.todo.getAsObj());
const editing = ref(false);

const subTaskProgress = computed(() => {
  const total = localToDoObj.value.subActions.length;
  const completed = [...localToDoObj.value.subActions.values()].filter(t => t.completed).length;
  return `${completed}/${total}`;
});

const dateWithTimeString = computed({
  get: () => formatDate(localTodo.value.dateWithTime),
  set: (val: string) => {
    localTodo.value.dateWithTime = parseStringToDate(val);
    emit('update', localTodo.value);
  }
});

const expirationString = computed({
  get: () => formatDate(localTodo.value.expiration),
  set: (val: string) => {
    localTodo.value.expiration = parseStringToDate(val);
    emit('update', localTodo.value);
  }
});

const notifyDateString = computed({
  get: () => formatDate(localTodo.value.notifyDate),
  set: (val: string) => {
    localTodo.value.notifyDate = parseStringToDate(val);
    emit('update', localTodo.value);
  }
});



function onCompletedChange() {
  if (localToDoObj.value.completed) {
    localTodo.value.setAsCompleted();
  } else {
    localTodo.value.setAsNotCompleted();
  }
  editing.value = false;
  emit('update', localTodo.value);
}

function copyToDo() {
  const localToDoValue = localTodo.value;

  //to do : get id by to do handler  
  const copiedToDo = new ToDoAction(localToDoValue.id + "1234567", localToDoValue.title, localToDoValue.priority, localToDoValue.dateWithTime, localToDoValue.expiration, localToDoValue.notifyDate, localToDoValue.category, localToDoValue.description)
  console.log("copiedToDo:\n", copiedToDo)
  localToDoValue.subActions.forEach(subA => copiedToDo.addOrUpdateSubToDoAction(subA))
  emit("copy", copiedToDo)
}

function deleteToDo() {
  emit("delete", localTodo.value)
}

function updateToDo() {
  emit("update", localTodo.value);
}

watch(() => props.todo, (newVal) => {
  localTodo.value = newVal;
});
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
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  /* Eventuali altre proprietà per modificare colore, dimensioni, margini dell’icona */
}
</style>
