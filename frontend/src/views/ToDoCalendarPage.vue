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
                    <span class="value"> {{ todayToDoActions.length }}</span>
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
                        @todoEvent=handleToDoEvent :todos=genericToDoActionsComputed :viewMode="'list'">
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
                    <div class="sorting_options">
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

                    <div class="filtering_options">
                        <div class="filtering_option">
                            <label>Title/Description Text:</label>
                            <input type="text" v-model="tempFilterOptions.textSearch" placeholder="Search text..."
                                class="filter_input" />
                            <div></div>
                            <div></div>
                        </div>

                        <div class="filtering_option">
                            <label>Category:</label>
                            <select v-model="tempFilterOptions.category" class="filter_selector">
                                <option :value="null">All Categories</option>
                                <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                            <div></div>
                            <div></div>
                        </div>

                        <div class="filtering_option">
                            <label>Minimum Priority:</label>
                            <select v-model="tempFilterOptions.priorityOperator" class="filter_selector">
                                <option value=">=">Greater than or equal to</option>
                                <option value=">">Greater than</option>
                                <option value="==">Equal to</option>
                                <option value="<">Less than</option>
                                <option value="<=">Less than or equal to</option>
                                <option value="!=">Not equal to</option>
                            </select>
                            <input type="number" v-model.number="tempFilterOptions.priorityValue" min="0"
                                placeholder="Priority level" class="filter_input" />
                            <div></div>
                        </div>

                        <div class="filtering_option">
                            <label>Completion Status:</label>
                            <select v-model="tempFilterOptions.completed" class="filter_selector">
                                <option :value="null">All Statuses</option>
                                <option :value="true">Completed</option>
                                <option :value="false">Not Completed</option>
                            </select>
                            <div></div>
                            <div></div>
                        </div>

                        <div class="filtering_option">
                            <label>Expiration Date Range:</label>
                            <input type="date" v-model="tempFilterOptions.expirationDateStart" class="filter_input_date" />
                            <input type="date" v-model="tempFilterOptions.expirationDateEnd" class="filter_input_date" />
                            <div></div>
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
import { startOfWeek, addDays, endOfWeek, format } from 'date-fns';
import { computed, onMounted, ref } from 'vue';
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
    // Add other date/numeric filters as needed
}

const notificationManager = ref(null);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const todayToDoActions = ref<ToDoAction[]>([]);
const genericToDoActions = ref<ToDoAction[]>([]);
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
    { key: 'dateWithTime', label: 'Creation Date', order: 'asc', priority: 1 },
    { key: 'priority', label: 'Priority', order: 'asc', priority: 2 },
    { key: 'expiration', label: 'Expiration Date', order: 'asc', priority: 3 },
    { key: 'title', label: 'Title', order: 'asc', priority: 4 },
    { key: 'category', label: 'Category', order: 'asc', priority: 5 },
    { key: 'notifyDate', label: 'Notify Date', order: 'asc', priority: 6 },
    { key: 'completed', label: 'Completion Status', order: 'asc', priority: 7 },
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
    // Aggiungi qui gli altri filtri
});

// Opzioni di filter applicate (usate per il filtraggio effettivo)
const appliedFilterOptions = ref<FilterOptions>(JSON.parse(JSON.stringify(tempFilterOptions.value)));

// Stato temporaneo per le opzioni di filter nel modal (per il cancel)
const backFilterOptions = ref<FilterOptions | null>(null);

// Categorie disponibili per il filtro (puoi popolarle dalla lista raw o fetcharle separatamente)
const availableCategories = computed(() => {
    const categories = new Set<string>();
    rawToDos.value.forEach(todo => {
        if (todo.category) {
            categories.add(todo.category);
        }
    });
    return Array.from(categories);
});

// Computed properties per il filtraggio e l'ordinamento
const filteredToDosComputed = computed(() => {
    let filtered = rawToDos.value;

    const filters = appliedFilterOptions.value;

    // Filtro per testo (Titolo/Descrizione)
    if (filters.textSearch) {
        const searchTerm = filters.textSearch.toLowerCase();
        filtered = filtered.filter(todo =>
            (todo.title?.toLowerCase().includes(searchTerm)) ||
            (todo.description?.toLowerCase().includes(searchTerm))
        );
    }

    // Filtro per Categoria
    if (filters.category !== null) {
        filtered = filtered.filter(todo => todo.category === filters.category);
    }

    // Filtro per Priorità
    if (filters.priorityValue !== null && filters.priorityOperator) {
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
        filtered = filtered.filter(todo => !!todo.completed === filters.completed); // Ensure boolean comparison
    }

    // Filtro per Data di Scadenza
    if (filters.expirationDateStart || filters.expirationDateEnd) {
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


    // Aggiungi qui la logica per gli altri filtri

    return filtered;
});

const sortedFilteredToDosComputed = computed(() => {
    const sorted = [...filteredToDosComputed.value]; // Crea una copia per non modificare l'originale

    // Ordina le opzioni di sort per priorità (crescente)
    const sortedSortOptions = [...appliedSortOptions.value].sort((a, b) => a.priority - b.priority);

    // Funzione di comparazione personalizzata che considera le priorità
    sorted.sort((a, b) => {
        for (const option of sortedSortOptions) {
            const key = option.key as keyof ToDoAction; // Type assertion
            const valA = a[key];
            const valB = b[key];

            // Gestione speciale per i valori null/undefined o date non valide
            if (valA == null && valB == null) continue; // Entrambi null, passa al criterio successivo
            if (valA == null) return option.order === 'asc' ? 1 : -1; // a è null, va dopo in asc, prima in desc
            if (valB == null) return option.order === 'asc' ? -1 : 1; // b è null, va prima in asc, dopo in desc

            // Gestione specifica per le date (assicurati siano oggetti Date)
            if (['dateWithTime', 'expiration', 'notifyDate'].includes(option.key as string)) {
                const dateA = valA ? (valA instanceof Date ? valA : parseISO(valA as string)) : null;
                const dateB = valB ? (valB instanceof Date ? valB : parseISO(valB as string)) : null;

                if (dateA && dateB) {
                    if (dateA.getTime() === dateB.getTime()) continue;
                    return option.order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
                } else if (dateA) {
                    return option.order === 'asc' ? -1 : 1; // dateA valido, dateB no
                } else if (dateB) {
                    return option.order === 'asc' ? 1 : -1; // dateB valido, dateA no
                } else {
                    continue; // Entrambe non valide, passa al criterio successivo
                }
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
        return 0; // Se tutti i criteri sono uguali, l'ordine non cambia (stabile)
    });

    return sorted;
});

const todayToDoActionsComputed = computed(() => {
    // Filtra dalla lista ordinata e filtrata globale quelle di oggi
    return sortedFilteredToDosComputed.value.filter(todo => isToday(todo.dateWithTime));
});

const genericToDoActionsComputed = computed(() => {
    // Filtra dalla lista ordinata e filtrata globale quelle NON di oggi
    // Assumiamo che "Generic" siano tutte quelle non "Today"
    return sortedFilteredToDosComputed.value.filter(todo => !isToday(todo.dateWithTime));
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
    fcmToken: ""
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
        { key: 'dateWithTime', label: 'Creation Date', order: 'asc', priority: 1 },
        { key: 'priority', label: 'Priority', order: 'asc', priority: 2 },
        { key: 'expiration', label: 'Expiration Date', order: 'asc', priority: 3 },
        { key: 'title', label: 'Title', order: 'asc', priority: 4 },
        { key: 'category', label: 'Category', order: 'asc', priority: 5 },
        { key: 'notifyDate', label: 'Notify Date', order: 'asc', priority: 6 },
        { key: 'completed', label: 'Completion Status', order: 'asc', priority: 7 },
    ];
}

function applySortOptions() {
    // Applica le opzioni di sort correnti salvandole in appliedSortOptions
    // La computed property sortedFilteredToDosComputed si aggiornerà automaticamente
    appliedSortOptions.value = JSON.parse(JSON.stringify(tempSortOptions.value));
    sortBoxOpened.value = false;
    sendNotify("success", "Sorting options applied.");
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
        // Resetta qui gli altri filtri
    };
}

function applyFilterOptions() {
    // Applica le opzioni di filter correnti salvandole in appliedFilterOptions
    // La computed property filteredToDosComputed (e di conseguenza sortedFilteredToDosComputed) si aggiornerà automaticamente
    appliedFilterOptions.value = JSON.parse(JSON.stringify(tempFilterOptions.value));
    filterBoxOpened.value = false;
    sendNotify("success", "Filtering options applied.");
}



function prevWeek() {
    currentWeekStart.value = addDays(currentWeekStart.value, -7);
}

function nextWeek() {
    currentWeekStart.value = addDays(currentWeekStart.value, 7);
}

// Questa funzione ora filtra dalla lista ordinata e filtrata globale
const todosForDay = (day: Date) => {
    return sortedFilteredToDosComputed.value.filter(todo => {
        // Assumiamo che `dateWithTime` sia la data rilevante per la visualizzazione nella griglia settimanale
        if (!todo.dateWithTime) return false; // Non mostrare to-do senza data nella griglia
        const todoDate = new Date(todo.dateWithTime);
        return isSameDay(todoDate, day);
    });
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

            todayToDoActions.value = []
            genericToDoActions.value = []
            todoCompletedQuantity.value = 0

            for (let to_do of todoList) {
                if (to_do.completed) {
                    todoCompletedQuantity.value++
                }
                const toDoAction = todoHandler.fromToDoObj(to_do)
                console.log("toDoAction:\n", toDoAction)
                if (isToday(toDoAction.dateWithTime)) {
                    todayToDoActions.value.push(toDoAction)
                }
                genericToDoActions.value.push(toDoAction)
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
        userInfo.value.karmaCoinsBalance += eventContent.karmaCoinsChange;
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
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: #ffffff;
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
    background-color: var(--background-dark);
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
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: #ffffff;
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
    gap: 1rem;
    min-height: 0;
    overflow-x: auto;
}

.selettore {
    height: 31px;
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
    background: #212121;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    /* Rendi il modal più responsive */
    max-width: 520px;
    /* Larghezza massima */
    max-height: 80%;
    /* Altezza massima */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;
    text-align: center;
    border: 1px solid #15b680d4;
    box-sizing: border-box;
}

.content h2 {
    margin-bottom: 10px;
}

.content::-webkit-scrollbar {
    width: 8px;
}

.content::-webkit-scrollbar-track {
    background: #333;
    border-radius: 4px;
}

.content::-webkit-scrollbar-thumb {
    background: #15b680d4;
    border-radius: 4px;
}


.sorting_title,
.filter_title {
    margin-top: 0.5%;
    font-size: 25px;
    text-align: center;
    font-family: sans-serif;
}


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
    /* Spazio per la scrollbar */
}

/* Nasconde la scrollbar nel modal content per Firefox e IE */
.sorting_options,
.filtering_options {
    scrollbar-width: thin;
    scrollbar-color: #15b680d4 #333;
}

.sorting_option,
.filtering_option {
    display: grid;
    /* Usa repeat per definire le colonne in base al contenuto o una dimensione fissa */
    grid-template-columns: 1fr auto auto auto;
    /* Esempio: Label | Select/Input | Input/Select | Icon (se presente) */
    gap: 10px;
    align-items: center;
    text-align: left;
    padding: 10px;
    border-radius: 8px;
    border-bottom: 1px solid grey;
}

.sorting_option label,
.filtering_option label {
    font-size: 0.9rem;
    white-space: nowrap;
    /* Evita che la label vada a capo */
}


/* Adatta le larghezze per i controlli nei modal */
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
    color: white;
    height: 26px;
    /* Aggiusta altezza */
    padding: 0 8px;
    /* Riduci padding per adattare */
    border-radius: 4px;
    font-size: 0.85rem;
    /* Riduci dimensione font */
    cursor: pointer;
    outline: none;
    box-sizing: border-box;
    /* Include border e padding nella dimensione */
}

.sort_selector {
    width: 100px;
    /* Larghezza fissa o auto */
}

.priority_input {
    width: 60px;
    /* Larghezza per input numerico */
    text-align: center;
}

.filter_selector {
    width: 120px;
    /* Larghezza per select box */
}

.filter_input {
    width: 100px;
    /* Larghezza per input testo/numero */
}

.filter_input_date {
    width: 120px;
    /* Larghezza per input data */
    font-size: 0.85rem;
    /* Assicurati la dimensione del font sia coerente */
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Stili per i bottoni delle azioni */
.sorting_actions,
.filtering_actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    /* Allinea i bottoni a destra */
    gap: 30px;
    /* Spazio tra i bottoni */
    padding-top: 10px;
    border-top: 1px solid grey;
}


.reset_button,
.apply_button,
.cancel_button {
    height: 35px;
    /* Aumenta l'altezza dei bottoni */
    padding: 0 15px;
    /* Aumenta il padding orizzontale */
    display: flex;
    gap: 0.5rem;
    /* Spazio tra icona e testo */
    color: white;
    background: #ffffff00;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    align-items: center;
    font-size: 0.9rem;
    transition: background-color 0.3s ease, border-color 0.3s ease;
    box-sizing: border-box;
    /* Include border e padding nella dimensione */
}

.reset_button {
    border: 2px solid #f44336;
}

.reset_button:hover {
    background-color: #b6301550;
}

.apply_button {
    border: 2px solid #15b680d4;
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
    border: 2px solid #9e9e9e;
}

.cancel_button:hover {
    background-color: #ac98983b;
}
</style>