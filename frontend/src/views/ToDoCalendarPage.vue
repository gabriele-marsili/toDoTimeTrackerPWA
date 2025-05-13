<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="calendar-app">
        <Sidebar :activeSection="'calendar_and_todo'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">

            <header class="header-section box elevated shadow-lg rounded-2xl">

                <div class="header-item">
                    <span class="material-symbols-outlined icon">paid</span>
                    <span>Karma Points : </span>
                    <span class="value"> {{ userInfo.karmaCoinsBalance }}</span>
                </div>
                <div class="header-item">
                    <span class="material-symbols-outlined icon">task</span>
                    <span>Total To-Dos : </span>
                    <span class="value"> {{ totalToDoQuantity }}</span>
                </div>
                <div class="header-item">
                    <span class="material-symbols-outlined icon">task</span>
                    <span>Today To-Dos : </span>
                    <span class="value"> {{ todayToDoActionsComputed.length }}</span>
                </div>
                <div class="header-item">
                    <span class="material-symbols-outlined icon">event</span>
                    <span>Total Events : </span>
                    <span class="value"> {{ totalEventsQuantity }}</span>
                </div>
                <div class="header-item">
                    <span class="material-symbols-outlined icon">event</span>
                    <span>Today Events : </span>
                    <span class="value"> {{ todayEventsQuantity }}</span>
                </div>
                <button class="baseButton" @click="addToDoTrigger = true">
                    <i class="material-icons-sharp">add</i>
                    Add New To Do
                </button>


                <div class="custom-select">
                    <span class="material-symbols-outlined menu-icon select-icon">visibility</span>
                    <select class="selettore" name="todo-view-mode" id="todo_view_mode" v-model="todo_view_mode">
                        <option :key="'list'" :value="'list'">List</option>
                        <option :key="'grid'" :value="'grid'">Grid</option>
                    </select>
                </div>


                <button class="baseButton" @click="openFilterBox">
                    <i class="material-icons-sharp">filter_list</i>
                    Filter
                </button>

                <button class="baseButton" @click="openSortBox">
                    <i class="material-icons-sharp">sort</i>
                    Sort
                </button>

            </header>

            <div class="content-row" v-if="todo_view_mode == 'list'">
                <!-- Colonna 1: Today To Do -->
                <div class="box max-w-lg w-full rounded-2xl elevated shadow-lg text-center">
                    <h3>Today To Do</h3>
                    <ToDoList :triggerAddToDo="false" :is-sub-list="false" :todos=todayToDoActionsComputed
                        @todoEvent=handleToDoEvent :viewMode="'list'">
                    </ToDoList>
                </div>
                <!-- Colonna 2: Generic To Do -->
                <div class="box max-w-lg w-full rounded-2xl elevated shadow-lg text-center">
                    <h3>Generic To Do</h3>
                    <ToDoList @todoAdded="handleAddToDo" :triggerAddToDo="addToDoTrigger" :is-sub-list="false"
                        @todoEvent=handleToDoEvent :todos=sortedFilteredToDosComputed :viewMode="'list'">
                    </ToDoList>
                </div>
            </div>

            <!-- box con to do grid (settimana, divise per giorno) -->
            <div v-if="todo_view_mode === 'grid'" class="todo-grid-box rounded-2xl elevated shadow-lg text-center">
                <!-- Navigation for weeks -->
                <div class="grid-todo-header week-nav flex justify-between items-center mb-4">
                    <button @click="prevWeek" class="baseButton">«</button>
                    <h3 class="text-lg font-medium">
                        {{ format(currentWeekStart, 'MMM dd, yyyy') }} -
                        {{ format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM dd, yyyy') }}
                    </h3>
                    <button @click="nextWeek" class="baseButton">»</button>
                </div>

                <!-- Grid of days -->
                <div class="todo-grid-container hide-scrollbar">
                    <div v-for="day in weekDays" :key="day.toDateString()" class="day-column flex flex-col">
                        <div class="day-header text-sm font-semibold mb-2">
                            {{ format(day, 'EEEE') }}
                        </div>

                        <div class="todos-wrapper flex-1 overflow-y-auto hide-scrollbar ">
                            <ToDoList @todoAdded="handleAddToDo"
                                :triggerAddToDo="day.getDay() === 1 ? addToDoTrigger : false" :is-sub-list="false"
                                @todoEvent=handleToDoEvent :todos=todosForDay(day) :viewMode="'list'">
                            </ToDoList>
                        </div>

                    </div>
                </div>
            </div>

            <div class="footer elevated p-15 shadow-lg rounded-2xl text-center">
                <h3>Calendar</h3>
                <Calendar @calendarEvent=handleCalendarEvent></Calendar>
            </div>

            <!-- sort box -->
            <div class="modal" v-if="sortBoxOpened">
                <div class="content">
                    <h2 class="sorting_title">Sorting Options</h2>

                    <!-- Opzioni di ordinamento -->
                    <div class="sorting_options custom-scrollbar">
                        <div v-for="(option, index) in tempSortOptions" :key="option.key" class="sorting_option">
                            <label>{{ option.label }}</label>
                            <select v-model="tempSortOptions[index].order" class="sort_selector">
                                <option value="asc">Increasing</option>
                                <option value="desc">Decreasing</option>
                            </select>
                            <input type="number" v-model.number="tempSortOptions[index].priority" min="1"
                                :max="tempSortOptions.length" class="priority_input" placeholder="Priority" />
                        </div>
                    </div>

                    <div class="sorting_actions">
                        <button @click="resetSortOptions" class="reset_button">
                            Reset
                            <span class="material-symbols-outlined menu-icon">reset_settings</span>
                        </button>
                        <button @click="applySortOptions" class="apply_button">
                            Apply
                            <span class="material-symbols-outlined menu-icon">check_circle</span>
                        </button>
                        <button @click="closeSortBox" class="cancel_button">
                            Cancel
                            <span class="material-symbols-outlined menu-icon">close</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- filter box -->
            <div class="modal" v-if="filterBoxOpened">
                <div class="content">
                    <h2 class="filter_title">Filtering Options</h2>

                    <div class="filtering_options custom-scrollbar">
                        <div class="filtering_option">
                            <label>Title/Description Text:</label>
                            <div class="input-group">
                                <input type="text" v-model="tempFilterOptions.textSearch" placeholder="Search text..."
                                    class="filter_input text-input-grow" />
                            </div>
                        </div>

                        <div class="filtering_option">
                            <label>Category:</label>
                            <div class="input-group">
                                <select v-model="tempFilterOptions.category" class="filter_selector">
                                    <option :value="null">All Categories</option>
                                    <option v-for="cat in userInfo.categories" :key="cat.name" :value="cat.name">{{
                                        cat.name }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="filtering_option">
                            <label>Minimum Priority:</label>
                            <div class="input-group">
                                <select v-model="tempFilterOptions.priorityOperator"
                                    class="filter_selector priority-selector">
                                    <option value=">=">Greater than or equal to</option>
                                    <option value=">">Greater than</option>
                                    <option value="==">Equal to</option>
                                    <option value="<">Less than</option>
                                    <option value="<=">Less than or equal to</option>
                                    <option value="!=">Not equal to</option>
                                </select>
                                <input type="number" v-model.number="tempFilterOptions.priorityValue" min="0" max="5"
                                    placeholder="Priority" class="filter_input priority-input" />
                            </div>
                        </div>

                        <div class="filtering_option">
                            <label>Completion Status:</label>
                            <div class="input-group">
                                <select v-model="tempFilterOptions.completed" class="filter_selector">
                                    <option :value="null">All Statuses</option>
                                    <option :value="true">Completed</option>
                                    <option :value="false">Not Completed</option>
                                </select>
                            </div>
                        </div>

                        <div class="filtering_option">
                            <label>Expiration Date Range:</label>
                            <div class="input-group date-range-group">
                                <DatePicker :isDarkMode=isDarkMode v-model="tempFilterOptions.expirationDateStart" />
                                <span>to</span>
                                <DatePicker :isDarkMode=isDarkMode v-model="tempFilterOptions.expirationDateEnd" />
                            </div>
                        </div>

                        <div class="filtering_option">
                            <label>Date Range:</label>
                            <div class="input-group date-range-group">
                                <DatePicker :isDarkMode=isDarkMode v-model="tempFilterOptions.dateStart" />
                                <span>to</span>
                                <DatePicker :isDarkMode=isDarkMode v-model="tempFilterOptions.dateEnd" />
                            </div>
                        </div>

                        <div class="filtering_option">
                            <label>Notification Date Range:</label>
                            <div class="input-group date-range-group">
                                <DatePicker :isDarkMode=isDarkMode v-model="tempFilterOptions.notifyDateStart" />
                                <span>to</span>
                                <DatePicker :isDarkMode=isDarkMode v-model="tempFilterOptions.notifyDateEnd" />
                            </div>
                        </div>

                    </div>

                    <div class="filtering_actions">
                        <button @click="resetFilterOptions" class="reset_button">
                            Reset
                            <span class="material-symbols-outlined menu-icon">reset_settings</span>
                        </button>
                        <button @click="applyFilterOptions" class="apply_button">
                            Apply
                            <span class="material-symbols-outlined menu-icon">check_circle</span>
                        </button>
                        <button @click="closeFilterBox" class="cancel_button">
                            Cancel
                            <span class="material-symbols-outlined menu-icon">close</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>

    </div>

</template>

<script setup lang="ts">
import { startOfWeek, addDays, endOfWeek, format, startOfDay, endOfDay } from 'date-fns';
import { computed, onMounted, ref, toRaw } from 'vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import Calendar from '../components/Calendar.vue';
import Sidebar from '../components/Sidebar.vue';
import { ToDoAction, ToDoHandler, ToDoObj } from '../engine/toDoEngine';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import { userDBentry } from '../types/userTypes';
import { useRouter } from 'vue-router';
import { delay, isToday } from '../utils/generalUtils';
import ToDoList from '../components/ToDoList.vue';
import { parseISO } from 'date-fns';
import { isSameDay } from 'date-fns';
import DatePicker from '../components/DatePicker.vue';


interface SortOption {
    key: keyof ToDoAction | 'dateWithTime'; // Use 'dateWithTime' for creation date
    label: string;
    order: 'asc' | 'desc';
    priority: number;
}

interface FilterOptions {
    textSearch: string | null;
    category: string | null;
    priorityOperator: string | null; // e.g., '>=', '==', '<='
    priorityValue: number | null;
    completed: boolean | null;
    expirationDateStart: string | null; // Using string for date inputs
    expirationDateEnd: string | null; // Using string for date inputs
    dateStart: string | null;
    dateEnd: string | null;
    notifyDateStart: string | null;
    notifyDateEnd: string | null;

}

const notificationManager = ref(null);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const api_gestor = API_gestor.getInstance()
const todoHandler = ToDoHandler.getInstance(api_gestor)
const userHandler = UserHandler.getInstance(api_gestor)
const defaultImagePath = "../../public/user.avif"
const todoCompletedQuantity = ref(0);
const totalToDoQuantity = ref(0);
const totalEventsQuantity = ref(0);
const todayEventsQuantity = ref(0);
const addToDoTrigger = ref(false);
const todo_view_mode = ref<"grid" | "list">("list");
const currentWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 }))
const filterBoxOpened = ref(false);
const sortBoxOpened = ref(false);
const rawToDos = ref<ToDoAction[]>([]); // Mantiene la lista completa non filtrata/ordinata

// Opzioni di sort correnti (usate nel modal)
const tempSortOptions = ref<SortOption[]>([
    { key: 'dateWithTime', label: 'Creation Date', order: 'asc', priority: 0 },
    { key: 'priority', label: 'Priority', order: 'asc', priority: 0 },
    { key: 'expiration', label: 'Expiration Date', order: 'asc', priority: 0 },
    { key: 'title', label: 'Title', order: 'asc', priority: 0 },
    { key: 'category', label: 'Category', order: 'asc', priority: 0 },
    { key: 'notifyDate', label: 'Notify Date', order: 'asc', priority: 0 },
    { key: 'completed', label: 'Completion Status', order: 'asc', priority: 0 },
]);

// Opzioni di sort applicate (usate per l'ordinamento effettivo)
const appliedSortOptions = ref<SortOption[]>(JSON.parse(JSON.stringify(tempSortOptions.value)));

// Stato temporaneo per le opzioni di sort nel modal (per il cancel)
const backSortOptions = ref<SortOption[]>([]);

// Opzioni di filter correnti (usate nel modal)
const tempFilterOptions = ref<FilterOptions>({
    textSearch: null,
    category: null,
    priorityOperator: '>=', // Default operator
    priorityValue: null,
    completed: null,
    expirationDateStart: null,
    expirationDateEnd: null,
    dateStart: null,
    dateEnd: null,
    notifyDateStart: null,
    notifyDateEnd: null,

});

// Opzioni di filter applicate (usate per il filtraggio effettivo)
const appliedFilterOptions = ref<FilterOptions>(JSON.parse(JSON.stringify(tempFilterOptions.value)));

// Stato temporaneo per le opzioni di filter nel modal (per il cancel)
const backFilterOptions = ref<FilterOptions | null>(null);

// Computed properties per il filtraggio e l'ordinamento
const filteredToDosComputed = computed(() => {
    let filtered = rawToDos.value;
    console.log("rawToDos quantity (in filter to do): ", rawToDos.value.length)
    const filters = toRaw(appliedFilterOptions.value);
    console.log("filters:\n", filters)

    // Filtro per testo (Titolo/Descrizione)
    if (filters.textSearch) {
        console.log("filtering for text")
        const searchTerm = filters.textSearch.toLowerCase();
        filtered = filtered.filter(todo =>
            (todo.title?.toLowerCase().includes(searchTerm)) ||
            (todo.description?.toLowerCase().includes(searchTerm))
        );
    }

    // Filtro per Categoria
    if (filters.category !== null) {
        console.log("filtering for category")
        filtered = filtered.filter(todo => todo.category === filters.category);
    }

    // Filtro per Priorità
    if (filters.priorityValue !== null && filters.priorityOperator) {
        console.log("filtering for priority value")
        filtered = filtered.filter(todo => {
            const todoPriority = todo.priority || 0; // Assume 0 if priority is null/undefined
            switch (filters.priorityOperator) {
                case '>=': return todoPriority >= filters.priorityValue!;
                case '>': return todoPriority > filters.priorityValue!;
                case '==': return todoPriority === filters.priorityValue!;
                case '<': return todoPriority < filters.priorityValue!;
                case '<=': return todoPriority <= filters.priorityValue!;
                case '!=': return todoPriority !== filters.priorityValue!;
                default: return true;
            }
        });
    }

    // Filtro per Stato di completamento
    if (filters.completed !== null) {
        console.log("filtering for completed status")
        filtered = filtered.filter(todo => !!todo.completed === filters.completed); // Ensure boolean comparison
    }

    // Filtro per Data di Scadenza
    if (filters.expirationDateStart || filters.expirationDateEnd) {
        console.log("filtering for expiration date")
        filtered = filtered.filter(todo => {
            if (!todo.expiration) return false; // Exclude items without a expiration date if date filter is active
            const expirationDate = todo.expiration

            let isInRange = true;
            if (filters.expirationDateStart) {
                const startDate = parseISO(filters.expirationDateStart);
                // Consider the whole day for the start date
                isInRange = isInRange && (expirationDate >= startDate || isSameDay(expirationDate, startDate));
            }
            if (filters.expirationDateEnd) {
                const endDate = parseISO(filters.expirationDateEnd);
                // Consider the whole day for the end date
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                isInRange = isInRange && (expirationDate <= endOfDay || isSameDay(expirationDate, endOfDay));
            }
            return isInRange;
        });
    }

    if (filters.dateStart || filters.dateEnd) {
        console.log("filtering for date")
        filtered = filtered.filter(todo => {
            if (!todo.dateWithTime) return false; // Assuming dateWithTime is creation date
            try {
                const creationDate = todo.dateWithTime;
                if (isNaN(creationDate.getTime())) return false;

                let isInRange = true;
                if (filters.dateStart) {
                    const startDate = startOfDay(parseISO(filters.dateStart));
                    isInRange = isInRange && (creationDate >= startDate);
                }
                if (filters.dateEnd) {
                    const endDate = endOfDay(parseISO(filters.dateEnd));
                    isInRange = isInRange && (creationDate <= endDate);
                }
                return isInRange;
            } catch (e) {
                console.error("Error parsing creationDate for filter:", todo.dateWithTime, e);
                return false;
            }
        });
    }

    // Filtro per Data di Notifica
    if (filters.notifyDateStart || filters.notifyDateEnd) {
        console.log("filtering for notify date")
        filtered = filtered.filter(todo => {
            if (!todo.notifyDate) return false;
            try {
                const notifyDate = todo.notifyDate;
                if (isNaN(notifyDate.getTime())) return false;

                let isInRange = true;
                if (filters.notifyDateStart) {
                    const startDate = startOfDay(parseISO(filters.notifyDateStart));
                    isInRange = isInRange && (notifyDate >= startDate);
                }
                if (filters.notifyDateEnd) {
                    const endDate = endOfDay(parseISO(filters.notifyDateEnd));
                    isInRange = isInRange && (notifyDate <= endDate);
                }
                return isInRange;
            } catch (e) {
                console.error("Error parsing notifyDate for filter:", todo.notifyDate, e);
                return false;
            }
        });
    }



    // Aggiungi qui la logica per gli altri filtri
    console.log("Filtered ToDos count:", filtered.length); // Debugging line
    return filtered;
});

const sortedFilteredToDosComputed = computed(() => {
    const sorted = [...filteredToDosComputed.value]; // Crea una copia per non modificare l'originale

    // Ordina le opzioni di sort per priorità (decrescente) (7 ha più priorità di 1)
    const sortedSortOptions = [...appliedSortOptions.value].sort((a, b) => b.priority - a.priority);
    console.log("sortedSortOptions:\n", sortedSortOptions)
    // Funzione di comparazione personalizzata che considera le priorità
    sorted.sort((a, b) => {
        for (const option of sortedSortOptions) {
            const key = option.key as keyof ToDoAction; // Type assertion
            let valA = a[key] || null;
            let valB = b[key] || null;

            // Gestione specifica per i valori null/undefined o date non valide PRIMA della comparazione
            const isDateKey = ['dateWithTime', 'expiration', 'notifyDate'].includes(option.key as string);

            if (isDateKey) {
                // Prova a parsare le date. Se non valide o null, trattale come null.
                try {
                    valA = valA ? (valA instanceof Date ? valA : parseISO(valA as string)) : null;
                    if (valA && isNaN(valA.getTime())) valA = null;
                } catch { valA = null; } // In caso di errore di parsing, considera null
                try {
                    valB = valB ? (valB instanceof Date ? valB : parseISO(valB as string)) : null;
                    if (valB && isNaN(valB.getTime())) valB = null;
                } catch { valB = null; }
            }


            if (valA == null && valB == null) continue; // Entrambi null (o date non valide), passa al criterio successivo
            if (valA == null) return option.order === 'asc' ? 1 : -1; // a è null, va dopo in asc, prima in desc
            if (valB == null) return option.order === 'asc' ? -1 : 1; // b è null, va prima in asc, dopo in desc

            // Comparazione per date valide
            if (isDateKey && valA instanceof Date && valB instanceof Date) {
                if (valA.getTime() === valB.getTime()) continue;
                return option.order === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
            }


            // Comparazione standard per altri tipi (string, number, boolean)
            if (valA < valB) {
                return option.order === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return option.order === 'asc' ? 1 : -1;
            }
            // Se sono uguali per questo criterio, passa al criterio successivo
        }
        console.log("tutti i criteri uguali")
        return 0; // Se tutti i criteri sono uguali, l'ordine non cambia (stabile)
    });

    console.log("Sorted (Filtered) ToDos:\n", sorted); // Debugging line
    return sorted;
});
const todayToDoActionsComputed = computed(() => {
    const res = sortedFilteredToDosComputed.value.filter(todo => isToday(todo.dateWithTime))
    console.log("sortedFilteredToDosComputed:\n", res)
    return res;
});

const weekDays = computed(() =>
    Array.from({ length: 7 }).map((_, i) =>
        addDays(currentWeekStart.value, i)
    )
);


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
    karmaBoost : 0,
    frame : ""
});

const router = useRouter();

//sort and filter :
function openFilterBox() {
    // Salva lo stato corrente delle opzioni di filter prima di aprire il modal
    backFilterOptions.value = JSON.parse(JSON.stringify(tempFilterOptions.value));
    filterBoxOpened.value = true;
}

function openSortBox() {
    // Salva lo stato corrente delle opzioni di sort prima di aprire il modal
    backSortOptions.value = JSON.parse(JSON.stringify(tempSortOptions.value));
    sortBoxOpened.value = true;
}

function closeSortBox() {
    // Ripristina le opzioni di sort allo stato salvato all'apertura
    if (backSortOptions.value) {
        tempSortOptions.value = JSON.parse(JSON.stringify(backSortOptions.value));
    }
    sortBoxOpened.value = false;
}

function closeFilterBox() {
    // Ripristina le opzioni di filter allo stato salvato all'apertura
    if (backFilterOptions.value) {
        tempFilterOptions.value = JSON.parse(JSON.stringify(backFilterOptions.value));
    }
    filterBoxOpened.value = false;
}

function resetSortOptions() {
    // Ripristina le opzioni di sort ai valori di default
    tempSortOptions.value = [
        { key: 'dateWithTime', label: 'Creation Date', order: 'asc', priority: 0 },
        { key: 'priority', label: 'Priority', order: 'asc', priority: 0 },
        { key: 'expiration', label: 'Expiration Date', order: 'asc', priority: 0 },
        { key: 'title', label: 'Title', order: 'asc', priority: 0 },
        { key: 'category', label: 'Category', order: 'asc', priority: 0 },
        { key: 'notifyDate', label: 'Notify Date', order: 'asc', priority: 0 },
        { key: 'completed', label: 'Completion Status', order: 'asc', priority: 0 },
    ];
    appliedSortOptions.value = JSON.parse(JSON.stringify(tempSortOptions.value));
    sortBoxOpened.value = false;
    sendNotify("success", "Sorting options resetted");
    localStorage.setItem("sortOptions", JSON.stringify(appliedSortOptions.value))

}

function applySortOptions() {
    // Applica le opzioni di sort correnti salvandole in appliedSortOptions
    // La computed property sortedFilteredToDosComputed si aggiornerà automaticamente
    appliedSortOptions.value = JSON.parse(JSON.stringify(tempSortOptions.value));
    sortBoxOpened.value = false;
    sendNotify("success", "Sorting options applied");
    localStorage.setItem("sortOptions", JSON.stringify(appliedSortOptions.value))
}

function resetFilterOptions() {
    // Ripristina le opzioni di filter ai valori di default
    tempFilterOptions.value = {
        textSearch: null,
        category: null,
        priorityOperator: '>=',
        priorityValue: null,
        completed: null,
        expirationDateStart: null,
        expirationDateEnd: null,
        dateStart: null,
        dateEnd: null,
        notifyDateStart: null,
        notifyDateEnd: null,
    };
    appliedFilterOptions.value = JSON.parse(JSON.stringify(tempFilterOptions.value));
    filterBoxOpened.value = false;
    sendNotify("success", "Filtering options resetted");
    localStorage.setItem("filterOptions", JSON.stringify(appliedFilterOptions.value))


}

function applyFilterOptions() {
    // Applica le opzioni di filter correnti salvandole in appliedFilterOptions
    // La computed property filteredToDosComputed (e di conseguenza sortedFilteredToDosComputed) si aggiornerà automaticamente
    appliedFilterOptions.value = JSON.parse(JSON.stringify(tempFilterOptions.value));
    filterBoxOpened.value = false;
    sendNotify("success", "Filtering options applied");
    localStorage.setItem("filterOptions", JSON.stringify(appliedFilterOptions.value))
}



function prevWeek() {
    currentWeekStart.value = addDays(currentWeekStart.value, -7);
}

function nextWeek() {
    currentWeekStart.value = addDays(currentWeekStart.value, 7);
}

// Questa funzione ora filtra dalla lista ordinata e filtrata globale
const todosForDay = (day: Date) => {
    const dayList = sortedFilteredToDosComputed.value.filter(todo => {
        // Assumiamo che `dateWithTime` sia la data rilevante per la visualizzazione nella griglia settimanale
        if (!todo.dateWithTime) return false; // Non mostrare to-do senza data nella griglia settimanale
        try {
            const todoDate = todo.dateWithTime;
            if (isNaN(todoDate.getTime())) return false; // Data non valida
            return isSameDay(todoDate, day);
        } catch (e) {
            console.error("Error parsing dateWithTime for todosForDay:", todo.dateWithTime, e);
            return false; // Esclude To-Do con date malformate
        }
    });
    // console.log(`ToDos for ${format(day, 'yyyy-MM-dd')} count:`, dayList.length); // Debugging line
    return dayList;
};

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

async function askToDo() {
    try {
        const toDOres = await todoHandler.loadAllToDos(userInfo.value.licenseKey)
        if (toDOres.success) {
            const todoList = toDOres.toDos
            console.log("todoList:\n", todoList)
            const countToDoQuantity = (todo_list: ToDoObj[]): number => {
                let q = 0;
                for (let to_do of todo_list.filter(t => !t.completed)) { //scorro to do non completate 
                    q += 1 //incremento quantity q
                    if (to_do.subActions.length > 0) { //se to do ha sub actions 
                        //incremento q sfruttando ricorsione su sub actions 
                        q += countToDoQuantity(to_do.subActions)
                    }
                }
                return q;
            }

            totalToDoQuantity.value = countToDoQuantity(toDOres.toDos);
            rawToDos.value = []
            todoCompletedQuantity.value = 0

            for (let to_do of todoList) {
                if (to_do.completed) {
                    todoCompletedQuantity.value++
                }
                const toDoAction = todoHandler.fromToDoObj(to_do)
                console.log("toDoAction:\n", toDoAction)
                rawToDos.value.push(toDoAction)
            }
        } else {
            throw new Error(toDOres.errorMessage);
        }
    } catch (error: any) {
        sendNotify("error", `Error obtaining todo actions : ${error.message} `)
    }
}

async function askUserInfo() {
    const userInfoRes = await userHandler.getUserInfo(true)
    console.log("userInfoRes (to do + calendar page):\n", userInfoRes)
    if (!userInfoRes.userInfo_DB) { // => user not logged 
        sendNotify("warning", "Not logged, please log in")
        await delay(1500)
        //redirect to welcome
        router.push("/welcome")
        return;
    }

    userInfo.value = userInfoRes.userInfo_DB
    if (userInfo.value.avatarImagePath == "") {
        userInfo.value.avatarImagePath = defaultImagePath
    }
}

const handleSectionChange = (newSection: any) => {
    console.log(`Navigating to section: ${newSection}`);
};

function handleCalendarEvent(eventContent: { type: string, newEventsQuantity: number, todayEventsQuantity?: number, isToday?: boolean }) {
    console.log("new calendar event : ", eventContent)
    totalEventsQuantity.value = eventContent.newEventsQuantity
    if (eventContent.isToday) {
        if (eventContent.type == "delete") {
            todayEventsQuantity.value--
        } else {
            todayEventsQuantity.value++
        }

    }

    if (eventContent.todayEventsQuantity) {
        todayEventsQuantity.value = eventContent.todayEventsQuantity
    }
}

async function handleToDoEvent(eventContent: { type: string, newToDoQuantity: number, karmaCoinsChange: undefined | number }) {
    console.log("eventContent:\n", eventContent)
    if (eventContent.karmaCoinsChange !== undefined && userInfo.value) {
        userInfo.value.karmaCoinsBalance += eventContent.karmaCoinsChange + (userInfo.value.karmaBoost * eventContent.karmaCoinsChange);
    }
    await askToDo()
}

async function handleAddToDo(result: { success: boolean, error: string }) {
    addToDoTrigger.value = false;

    if (result.success) {
        await askToDo()
    } else {
        console.log("add to do failer or aborted, err: ", result.error);
    }
}

onMounted(async () => {
    if (isDarkMode.value) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    }

    //get sort & filter options by local storage
    const sortOptionsByLocalStorage = localStorage.getItem("sortOptions")
    if (sortOptionsByLocalStorage) {
        appliedSortOptions.value = JSON.parse(sortOptionsByLocalStorage)
    }
    const filterOptionsByLocalStorage = localStorage.getItem("filterOptions")
    if (filterOptionsByLocalStorage) {
        appliedFilterOptions.value = JSON.parse(filterOptionsByLocalStorage)
    }

    await askUserInfo()
    await askToDo()
});
</script>

<style scoped>
.calendar-app {
    display: flex;
    width: 100vw;
    height: 102vh;
    overflow-y: hidden;
    overflow: hidden;
    border: 2px solid #1e1e1e;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 5%;
    box-sizing: border-box;
    overflow: hidden;
    font-family: 'Poppins', sans-serif;
    height: auto;
    min-height: 0;
}

.content-row {
    flex: 1;
    display: flex;
    flex-direction: row;
    gap: 3%;
    height: 20%;
    min-height: 0;
    margin-left: 2%;
    width: 100%;
    margin-bottom: 1%;
}


.box {
    background-color: var(--background);
    padding: 15px;
    border-radius: 8px;
    color: var(--color);
    box-sizing: border-box;
    height: 10%;
    width: 95%;
    display: flex;
    flex-direction: column;
}

.content-row .box {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    min-width: 47%;
}

.header-area {
    flex: 1;
    min-width: 100%;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    overflow-y: auto;
    font-family: 'Poppins', sans-serif;
    height: 20%;
}

.header-section {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    margin-top: 2%;
    width: 97%;
    background-color: var(--background);
    color: var(--text-color);
    flex-wrap: wrap;
    gap: 0.5%;
    margin-left: 2%;
    margin-bottom: 1%;
}


.header-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 0.9em;
}

.header-item .value {
    font-weight: bold;
    margin-left: 3px;
}

.icon {
    font-size: 1.4em;
    margin-right: 2px;
    color: #FFD700;
}

.footer {
    margin-top: 10px;
    background-color: var(--background);
    padding: 15px;
    border-radius: 8px;
    color: var(--color);
    height: 35vh;
    box-sizing: border-box;
    width: 97%;
    margin-left: 2%;
    overflow-y: auto;
    margin-bottom: 2%;
}

.footer::-webkit-scrollbar {
    display: none;
}

.todo-grid-box {
    height: 40%;
    min-height: 0;
    margin-left: 2%;
    width: 97%;
    margin-bottom: 1%;
    display: flex;
    flex-direction: column;
}

.todo-grid-container {
    width: 100%;
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, 23%);
    gap: 6rem;
    min-height: 0;
    overflow-x: auto;
}

.selettore {
    height: 142%;
}

.custom-select {
    position: relative;
    display: flex;
    align-items: center;
}

.menu-icon {
    font-size: 18px;
    display: inline-flex;
}

.select-icon {
    position: absolute;
    right: 10px;
    pointer-events: none;
}

.grid-todo-header {
    /* di default non è flexibile */
    flex: 0 0 auto;
}

.grid-todo-header button {
    margin-top: 1%;
    margin-left: 1%;
    margin-right: 1%;
}

.day-column {
    margin-left: 1%;
    margin-right: 1%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 350px;
}

.todo-grid-box {
    display: flex;
    flex-direction: column;
}

.todos-wrapper {
    flex: 1 1 auto;
    /* occupa tutto lo spazio sotto la testata */
    overflow-y: auto;
    /* abilita scroll verticale */
    min-height: 0;
    /* importantissimo */
}

.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/*sort & filter boxes */
.content {
    background: var(--container-background-color);
    color: var(--text-color);
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    /* Rendi il modal più responsive */
    max-width: 650px;
    /* Larghezza massima aumentata leggermente */
    max-height: 80%;
    /* Altezza massima */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    /* Gestito dalle singole sezioni con custom scrollbar */
    text-align: center;
    border: 1px solid #15b680d4;
    box-sizing: border-box;
}


.content h2 {
    margin-bottom: 20px;
    color: var(--primary-color);
    /* Colore primario per i titoli */
}

/* Stili per le opzioni di sort/filter container */
.sorting_options,
.filtering_options {
    display: flex;
    flex-direction: column;
    gap: 15px;
    flex-grow: 1;
    /* Permette alle opzioni di occupare spazio disponibile */
    overflow-y: auto;
    /* Aggiunge scroll se necessario */
    padding-right: 10px;
    /* Spazio per la scrollbar custom */
    margin-bottom: 20px;
    /* Spazio tra opzioni e azioni */
}

/* Stili per la scrollbar custom */
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: var(--container-background-color);
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #15b680d4;
    border-radius: 4px;
}

.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #15b680d4 var(--container-background-color);
}


.sorting_option,
.filtering_option {
    display: grid;
    /* Definisce due colonne: una per la label (auto) e una per il gruppo di input (1fr) */
    grid-template-columns: auto 1fr;
    gap: 15px;
    /* Spazio tra label e input group */
    align-items: center;
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.3);
}

.sorting_option {
    grid-template-columns: 1fr auto auto auto;
}

.sorting_option label,
.filtering_option label {
    font-size: 1em;
    /* Aumenta leggermente la dimensione della label */
    white-space: nowrap;
    /* Evita che la label vada a capo */
    min-width: 40px;
    max-width: 80px;
    /* Larghezza minima per le label per un migliore allineamento */
}

/* Wrapper per gli input/select per allinearli a destra */
.input-group {
    display: flex;
    gap: 8px;
    /* Spazio tra gli elementi nel gruppo */
    align-items: center;
    justify-content: flex-end;
    /* Allinea gli elementi a destra */
    flex-wrap: wrap;
    /* Permette agli elementi di andare a capo se non c'è spazio */
}

/* Stili per i controlli di input/select */
.sort_selector,
.priority_input,
.filter_selector,
.filter_input,
.filter_input_date {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background: #ffffff00;
    border: 2px solid #15b680d4;
    color: var(--text-color);
    height: 32px;
    /* Aumenta l'altezza */
    padding: 0 10px;
    /* Aumenta il padding */
    border-radius: 4px;
    font-size: 0.95rem;
    /* Aumenta la dimensione del font */
    cursor: pointer;
    outline: none;
    box-sizing: border-box;
}

.sort_selector {
    width: 120px;
    /* Larghezza fissa per il selettore order */
}

.priority_input {
    width: 100px;
    /* Larghezza per input numerico priority */
    text-align: center;
}

.filter_selector {
    width: 140px;
    /* Larghezza per i selettori filtro */
}

.filter_input {
    width: 120px;
    /* Larghezza per input testo/numero */
}

/* Permette all'input testo di occupare più spazio */
.text-input-grow {
    flex-grow: 1;
    /* Permette all'input di espandersi */
    min-width: 100px;
    max-width: 400px;

}


.filter_input_date {
    width: 130px;
    /* Larghezza per input data */
    font-size: 0.95rem;
}

.date-range-group span {
    font-size: 0.9em;
    color: grey;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Stili per i bottoni delle azioni */
.sorting_actions,
.filtering_actions {
    margin-top: 10px;
    /* Riduci spazio sopra */
    display: flex;
    justify-content: flex-end;
    gap: 30px;
    padding-top: 10px;
    border-top: 1px solid rgba(128, 128, 128, 0.3);
    flex-wrap: wrap;
    /* Permette ai bottoni di andare a capo su schermi piccoli */
    justify-content: center;
    /* Centra i bottoni quando vanno a capo */
}


.reset_button,
.apply_button,
.cancel_button {
    height: 38px;
    /* Aumenta l'altezza dei bottoni */
    padding: 0 18px;
    /* Aumenta il padding orizzontale */
    display: flex;
    gap: 0.5rem;
    color: var(--color);
    background: #ffffff00;
    border: 2px solid;
    /* Definisce lo stile del bordo qui */
    cursor: pointer;
    border-radius: 4px;
    align-items: center;
    font-size: 1rem;
    /* Aumenta dimensione font bottone */
    transition: background-color 0.3s ease, border-color 0.3s ease;
    box-sizing: border-box;
}

.reset_button {
    border-color: #f44336;
}

.reset_button:hover {
    background-color: #b6301550;
}

.apply_button {
    border-color: #15b680d4;
}

.apply_button:hover,
.sort_selector:hover,
.filter_selector:hover,
.priority_input:hover,
.filter_input_date:hover,
.filter_input:hover {
    background-color: #15b68044;
}

.cancel_button {
    border-color: #9e9e9e;
}

.cancel_button:hover {
    background-color: #ac98983b;
}

.priority-selector {
    min-width: 200px;
}

</style>