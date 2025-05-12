<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="main-app">
        <Sidebar :activeSection="'settings'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">

            <header class="header-section box elevated shadow-lg rounded-2xl">
                <div class="header-content-left">
                    <span class="material-symbols-outlined icon">paid</span>
                    <span>Karma Points : </span>
                    <span class="value"> {{ userInfo.karmaCoinsBalance }}</span>

                    <span class="material-symbols-outlined icon">task</span>
                    <span>Todos : </span>
                    <span class="value"> {{ totalToDoQuantity }}</span>
                </div>

                <div class="header-content-right">
                    <div class="header-item switch-container">
                        <span class="material-symbols-outlined icon">notifications</span>
                        <label for="notifications-toggle" class="switch-label">Notifications</label>
                        <input type="checkbox" id="notifications-toggle" class="switch-input"
                            v-model="userInfo.notifications" @change="toggleNotifications" />
                        <label for="notifications-toggle" class="switch-slider"></label>
                    </div>

                    <div class="header-item switch-container">
                        <span class="material-symbols-outlined icon">power_settings_new</span>
                        <label for="time-tracker-toggle" class="switch-label">Time Tracker</label>
                        <input type="checkbox" id="time-tracker-toggle" class="switch-input"
                            v-model="userInfo.timeTrackerActive" @change="toggleTimeTracker" />
                        <label for="time-tracker-toggle" class="switch-slider"></label>
                    </div>

                    <div class="header-item user-info-display">
                        <span class="user-name">{{ userInfo.username }}</span>
                        <span class="prestige-title">Prestige: {{ userHandler.getUserPrestigeTitle(todoCompletedQuantity).title  }}</span>
                        <div class="avatar-wrapper" :class="selectedFrameClass">
                            <img :src="userInfo.avatarImagePath  || defaultImagePath" alt="User Avatar" class="avatar-image" />
                        </div>                        
                    </div>
                </div>
            </header>

            <div class="categories-section elevated shadow-lg rounded-2xl custom-scrollbar">
                <h2 class="text-2xl font-bold mb-6 category-title">Handle Categories</h2>
                <p class="mb-4 text-sm category-points-info">
                    Please allocate 100 points among the following categories (a category must have at least 1 point),
                    remaining points : <span :class="{'remaining-zero': remainingPoints === 0, 'remaining-positive': remainingPoints > 0, 'remaining-negative': remainingPoints < 0}">{{ remainingPoints }}</span>
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 category-grid">
                    <div v-for="(cat, index) in userInfo.categories" :key="index"
                        class="category-card flex flex-col items-start p-4 rounded-lg shadow box">
                        <label class="text-sm font-semibold mb-2 self-start category-label">{{ cat.name }}</label>
                        <div class="flex items-center gap-2 w-full category-input-group">
                            <input type="number" v-model.number="cat.points" :min="0"
                                :max="cat.points + remainingPointsIfEditing(index)"
                                @input="updateCategoryPoints(index)"
                                class="baseInputField no-spin w-full category-input" />

                            <button v-if="userInfo.categories.length > 1" @click="removeCategory(index)"
                                class="category-remove-button">
                                <span class="material-symbols-outlined g-icon ">delete</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="mt-6 flex gap-2 add-category-section">
                    <input type="text" v-model="newCategoryName" placeholder="Add a new category"
                        class="baseInputField flex-1 category-add-input" />
                    <button @click="addCategory" class="baseButtonHigher category-add-button" :disabled="newCategoryName.trim() === '' || remainingPoints === 0">Add</button>
                </div>

                <div class="saveButton">
                    <button @click="saveCategories" class="baseButtonHigher save-categories-button"
                        :disabled="remainingPoints !== 0">Save Categories</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import Sidebar from '../components/Sidebar.vue';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import { userDBentry, category } from '../types/userTypes'; 
import { useRouter } from 'vue-router';
import { delay } from '../utils/generalUtils';
import { ToDoHandler, ToDoObj,ToDoAction } from '../engine/toDoEngine';

const notificationManager = ref(null);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const api_gestor = API_gestor.getInstance();
const userHandler = UserHandler.getInstance(api_gestor);
const defaultImagePath = "../../public/user.avif";
const todoHandler = ToDoHandler.getInstance(api_gestor)
const genericToDoActions = ref<ToDoAction[]>([]);
const todoCompletedQuantity = ref(0);
const totalToDoQuantity = ref(genericToDoActions.value.length);
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
    karmaBoost : 0
});

const router = useRouter();

// Stato per la gestione delle categorie
const newCategoryName = ref('');

// Computed property per calcolare i punti rimanenti
const remainingPoints = computed(() => {
    const totalPoints = userInfo.value.categories.reduce((sum, cat) => sum + cat.points, 0);
    return 100 - totalPoints;
});

const selectedFrameClass = computed(() => {
    return getFrameClass(userInfo.value.frame);
});

const getFrameClass = (frameId: string) => {
    if(frameId == ""){
        return 'no-frame'
    }
    return `frame-${frameId.replace(/_/g, '-')}`; // Sostituisce underscore con trattino per nomi di classe CSS validi
};

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


            todoCompletedQuantity.value = 0
            for (let to_do of todoList) {
                if (to_do.completed) {
                    todoCompletedQuantity.value++
                }
                const toDoAction = todoHandler.fromToDoObj(to_do)
                console.log("toDoAction:\n", toDoAction)

                genericToDoActions.value.push(toDoAction)
            }
        } else {
            throw new Error(toDOres.errorMessage);
        }
    } catch (error: any) {
        sendNotify("error", `Error obtaining todo actions : ${error.message} `)
    }
}

// Funzione helper per calcolare i punti rimanenti durante l'editing di una categoria
const remainingPointsIfEditing = (index: number) => {    
    const totalPointsExcludingCurrent = userInfo.value.categories.reduce((sum, cat, i) => i === index ? sum : sum + cat.points, 0);
    return 100 - totalPointsExcludingCurrent;
};


// Metodi per la gestione delle categorie
const addCategory = () => {
    if (newCategoryName.value.trim() === '') {
        sendNotify("warning", "The category's name can't be empty");
        return;
    }
    if (userInfo.value.categories.some(cat => cat.name.toLowerCase() === newCategoryName.value.trim().toLowerCase())) {
        sendNotify("warning", "A category with this name already exists");
        return;
    }
    if (remainingPoints.value === 0) {
        sendNotify("warning", "There are no more points available to be awarded");
        return;
    }

    // Assegna 1 punto alla nuova categoria, se disponibile, altrimenti il minimo rimanente
    const pointsToAssign = Math.min(1, remainingPoints.value); 
    userInfo.value.categories.push({ name: newCategoryName.value.trim(), points: pointsToAssign });
    newCategoryName.value = '';
};

const removeCategory = (index: number) => {
    if (userInfo.value.categories.length > 1) {
         userInfo.value.categories.splice(index, 1)[0];
        // I punti della categoria rimossa sono automaticamente ricalcolati in remainingPoints
        // Non è necessario aggiungere manualmente i punti.
    } else {
        sendNotify("warning", "There must be at least one category");
    }
};

const updateCategoryPoints = (index: number) => {
    // Assicurati che i punti non siano negativi
    if (userInfo.value.categories[index].points < 0) {
        userInfo.value.categories[index].points = 0;
    }
    const currentCategoryPoints = userInfo.value.categories[index].points;
    const sumOfOtherCategories = userInfo.value.categories.reduce((sum, cat, i) => i === index ? sum : sum + cat.points, 0);
    
    const maxPointsForThisCategory = 100 - sumOfOtherCategories;

    if (currentCategoryPoints > maxPointsForThisCategory) {
        userInfo.value.categories[index].points = maxPointsForThisCategory;
    }
};

const saveCategories = async () => {
    if (remainingPoints.value !== 0) {
        sendNotify("error", `The sum of category points must be 100. Remaining points:: ${remainingPoints.value}`);
        return;
    }

    try {
        const updatedUinfo = toRaw(userInfo.value);
        const updateRes = await userHandler.updateUserInfo(updatedUinfo); 

        if (updateRes.success) {
            sendNotify("success", "Categories successfully updated!");
        } else {
            sendNotify("error", `Error while saving categories: ${updateRes.errorMessage}`);
        }
    } catch (error: any) {
        sendNotify("error", `Unexpected error while saving: ${error.message}`);
    }
};


// Metodi per gli switcher dell'header
const toggleNotifications = async () => {
    try {
        // Assumi che userHandler.updateUserInfo possa prendere un oggetto parziale
        // per aggiornare solo specifici campi. Se richiede l'intero oggetto,
        // dovrai passare l'intero userInfo.value.
        const updatedUinfo = toRaw(userInfo.value);
        const updateRes = await userHandler.updateUserInfo(updatedUinfo);
        if (updateRes.success) {
            sendNotify("success", `Notifications ${userInfo.value.notifications ? 'enabled' : 'disabled'} successfully.`);
        } else {
            // Ripristina lo stato se l'aggiornamento fallisce
            userInfo.value.notifications = !userInfo.value.notifications;
            sendNotify("error", `Error when updating notifications: ${updateRes.errorMessage}`);
        }
    } catch (error: any) {
        userInfo.value.notifications = !userInfo.value.notifications;
        sendNotify("error", `Unexpected error: ${error.message}`);
    }
};

const toggleTimeTracker = async () => {
    try {
        const updatedUinfo = toRaw(userInfo.value);
        const updateRes = await userHandler.updateUserInfo(updatedUinfo);
        if (updateRes.success) {
            sendNotify("success", `Time Tracker ${userInfo.value.timeTrackerActive ? 'activated' : 'deactivated'} successfully`);
        } else {
            userInfo.value.timeTrackerActive = !userInfo.value.timeTrackerActive;
            sendNotify("error", `Error while updating Time Tracker: ${updateRes.errorMessage}`);
        }
    } catch (error: any) {
        userInfo.value.timeTrackerActive = !userInfo.value.timeTrackerActive;
        sendNotify("error", `Unexpected error: ${error.message}`);
    }
};


function sendNotify(type: "info" | "warning" | "error" | "success", text: string) {
    if (notificationManager.value) {
        (notificationManager.value as any).showNotification({
            type: type,
            message: text,
        });
    } else {
        console.log("notification manager not found");
    }
}

async function askUserInfo() {
    const userInfoRes = await userHandler.getUserInfo(true);
    console.log("userInfoRes (settings page):\n", userInfoRes); // Modificato il log
    if (!userInfoRes.userInfo_DB) {
        sendNotify("warning", "Not logged in, please log in");
        await delay(1500);
        router.push("/welcome");
        return;
    }

    userInfo.value = userInfoRes.userInfo_DB;
    if (userInfo.value.avatarImagePath === "") {
        userInfo.value.avatarImagePath = defaultImagePath;
    }
    // Assicurati che ci sia almeno una categoria se l'array è vuoto
    if (userInfo.value.categories.length === 0) {
        userInfo.value.categories.push({ name: "Generale", points: 100 });
    }
}

const handleSectionChange = (newSection: any) => {
    console.log(`Navigando alla sezione: ${newSection}`);
    // Qui potresti implementare la logica per la navigazione,
    // ad esempio con `router.push` se il Sidebar gestisce la navigazione
};

onMounted(async () => {
    if (isDarkMode.value) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    }

    await askUserInfo();
    await askToDo()
});
</script>

<style scoped>
/* Import del foglio di stile principale se non già importato globalmente */
/* @import '../assets/css/style.css'; // Se style.css non è globale, importa qui */

/* STILE PUNTO 1 & 2: Header */
.header-section {
    display: flex;
    /* Sovrascrive column, imposta riga */
    flex-direction: row;
    justify-content: space-between;
    /* Spazia gli elementi ai bordi */
    align-items: center;
    /* Allinea verticalmente al centro */
    width: 97%;
    /* Mantieni la larghezza */
    margin-top: 2%;
    margin-left: 2%;
    margin-bottom: 1%;
    padding: 15px 20px;
    /* Padding per respirare */
    gap: 1%;
    /* Riduci il gap se gli elementi sono troppi */
    flex-wrap: nowrap; /* Evita che gli elementi vadano a capo, forza lo scroll se necessario */
    overflow: hidden;
}

.header-content-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0; /* Previene il restringimento */
}

.header-content-right {
    display: flex;
    align-items: center;
    gap: 15px; /* Spazio tra i blocchi (switcher, info utente) */
    flex-shrink: 0; /* Previene il restringimento */
}

.header-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 0.9rem; /* Riduci la dimensione del font per far stare più cose */
    gap: 5px;
    white-space: nowrap; /* Impedisce che il testo vada a capo */
}

.user-info-display {
    flex-direction: row; /* Da destra a sinistra: username, titolo, avatar */
    align-items: center;
    gap: 10px;
    justify-content: flex-end; /* Allinea gli elementi a destra all'interno del contenitore */
    order: 3; /* Assicurati che sia l'ultimo elemento nel flusso */
}

.user-name {
    font-weight: bold;
    color: var(--text-color); /* Colore del testo definito nel tema */
}

.prestige-title {        
    font-size: 1em;
    margin-right: 4px;
    color: #FFD700;
}

.avatar-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-wrapper{
    width: 40px;
    height: 40px;
}

/* Stili per gli switcher (ispirati a un design pulito) */
.switch-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 10px;
    /* Spazio tra gli switcher e l'info utente */
    order: 1; /* Posiziona gli switcher a sinistra dell'info utente */
}

.switch-label {
    font-size: 0.9rem;
    color: var(--text-color);
    cursor: pointer;
}

.switch-input {
    display: none;
}

.switch-slider {
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 20px;
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s;
}

.switch-slider::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: white;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
}

.switch-input:checked + .switch-slider {
    background-color: var(--accent-color-dark);
}

.switch-input:checked + .switch-slider::before {
    transform: translateX(20px);
}

/* STILE PUNTO 3: Gestione Categorie */
.categories-section {
    width: 97%;
    margin-left: 2%;
    margin-bottom: 2%;
    padding: 20px;
    background-color: var(--background-dark);    
    border-radius: 8px;
    color: #ffffff;
    box-sizing: border-box;
    min-height: 80%;
    max-height: 90%;
    width: 97%;
    display: flex;
    flex-direction: column;
    overflow : auto;
}

.category-title {
    color: var(--text-color);
    text-align: center;
    margin-bottom: 1rem;
}

.category-points-info {
    color: var(--text-color);
    text-align: center;
    margin-bottom: 1.5rem;
}

.remaining-zero {
    color: var(--accent-color-dark); /* Verde brillante quando i punti sono 0 */
    font-weight: bold;
}
.remaining-positive {
    color: var(--accent-color-light); /* Verde per punti > 0 */
    font-weight: bold;
}
.remaining-negative {
    color: #e74c3c; /* Rosso per punti < 0 */
    font-weight: bold;
}


.category-grid {
    gap: 1rem; /* Spazio tra le card delle categorie */
}

.category-card {
    background-color: var(--background-dark-lighter); /* Un colore leggermente più chiaro per la card, se esiste */
    color: var(--text-color);
    border: 1px solid rgba(255, 255, 255, 0.1); /* Bordo sottile */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: stretch; /* Per allineare input e pulsante */
    height: 100%; /* Assicurati che le card abbiano altezza uniforme in una riga */
}

.category-label {
    color: var(--text-color);
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%; /* Occupare tutta la larghezza disponibile */
}

.category-input-group {
    display: flex;
    align-items: center;
    gap: 8px; /* Spazio tra input e pulsante delete */
}

.category-input {
    flex-grow: 1; /* L'input occupa lo spazio rimanente */
    text-align: center; /* Centra il testo nell'input */
}

.category-remove-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e74c3c; /* Colore rosso per l'icona elimina */
}

.category-remove-button:hover {
    background-color: #fb041c41;
    border-color: #bd2130;
    border-radius:10%;
}

.g-icon {
    font-size: 1.5rem; /* Dimensione dell'icona elimina */
}

.add-category-section {
    display: flex;
    flex-direction: row;
    margin-top: 1.5rem;
    justify-content: center;
    align-items: center;
    gap: 10px;
    min-width: 50%;
    align-self: center;
}

.category-add-input {
    flex-grow: 1;
}

.category-add-button {
    /* Utilizza lo stile baseButtonHigher da style.css */
    padding: 10px 20px; /* Aumenta il padding del bottone */
}

.saveButton{
    display: flex;
    flex-direction: row;
    margin-top: 1.5rem;
    justify-content: center;
    align-items: center;
    gap: 10px;
    min-width: 50%;
    align-self: center;

}

.save-categories-button {
    /* Utilizza lo stile baseButtonHigher da style.css */
    padding: 12px 25px; /* Rendi il bottone più grande e evidente */
    font-size: 1.1rem;
}


/* Responsive adjustments */
@media (max-width: 768px) {
    .header-section {
        flex-wrap: wrap; /* Permetti al contenuto di andare a capo su schermi piccoli */
        justify-content: center;
        gap: 10px; /* Aumenta il gap per chiarezza */
    }

    .header-content-right {
        order: -1; /* Sposta gli switch e info utente sopra su schermi piccoli */
        width: 100%;
        justify-content: space-around;
        margin-bottom: 10px;
    }

    .user-info-display {
        order: 2; /* Dopo gli switch */
        width: 100%;
        justify-content: center;
    }

    .switch-container {
        margin-right: 0;
    }

    .categories-section {
        padding: 15px;
    }
    .category-card {
        padding: 10px;
    }
    .category-input {
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .category-grid {
        grid-template-columns: 1fr; /* Una colonna su schermi molto piccoli */
    }
}
</style>