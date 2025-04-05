<template>
    <div class="todo-list-container" :class="viewMode">
        <!--<button @click="toggleViewMode" class="toggle-btn">
            {{ viewMode === 'list' ? 'Grid View' : 'List View' }}
        </button>
        -->
        <div v-for="todo in filteredTodos" :key="todo.id" class="todo-item-wrapper" @click="openAction(todo)">
            <ToDoItem :viewMode="viewMode" :todo="todo" @update="onItemUpdate(todo, $event)" @click.stop />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, ref } from 'vue';
import ToDoItem from './ToDoItem.vue';
import { ToDoAction } from '../engine/toDoAction';

export interface Props {
    todos: ToDoAction[];
    // viewMode: 'list' mostra ogni item in una riga,
    // viewMode: 'grid' mostra ogni item in un piccolo box
    viewMode: 'list' | 'grid';
}
const viewMode = ref<'list' | 'grid'>('list');
const toggleViewMode = () => viewMode.value = viewMode.value === 'list' ? 'grid' : 'list';

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'select', todo: ToDoAction): void;
    (e: 'update', updatedTodo: ToDoAction): void;
}>();

// Filtra i todo che non sono completati
const filteredTodos = computed(() => {
    return [...props.todos].sort((a, b) => {
        if (!a.isCompleted() && b.isCompleted()) return -1;
        if (a.isCompleted() && !b.isCompleted()) return 1;
        return 0;
    });

    //return props.todos.filter(todo => !todo.isCompleted());
});

// Quando un item viene cliccato, emetti l'evento "select"
function openAction(todo: ToDoAction) {
    emit('select', todo);
}

// Gestione dell'update: qui puoi propagarlo al componente padre
function onItemUpdate(todo: ToDoAction, updated: ToDoAction) {
    // In questo esempio emettiamo l'evento "update" con il todo aggiornato
    emit('update', updated);
}
</script>

<style scoped>
.todo-list-container {
    max-height: 500px;
    overflow-y: auto;
}

.todo-list.list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.todo-list.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
}

.toggle-btn {
    margin-bottom: 10px;
}

.todo-list-container::-webkit-scrollbar {
    display: none;
}
</style>
