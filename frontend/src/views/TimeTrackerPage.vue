<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="main-app">
        <Sidebar :activeSection="'time_tracker'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">
            <header class="header-section box elevated shadow-lg rounded-2xl">

                <div class="header-item">
                    <span class="material-symbols-outlined icon">paid</span>
                    <span>Karma Points : </span>
                    <span class="value"> {{ userInfo.karmaCoinsBalance }}</span>
                </div>

                <div class="header-item">
                    <span class="material-symbols-outlined icon">developer_guide</span>
                    <span>Total Rules : </span>
                    <span class="value"> {{ totalRules }}</span>
                </div>

                <div class="header-item">
                    <span class="material-symbols-outlined icon">hourglass</span>
                    <span>Total Conceded Time : </span>
                    <span class="value"> {{ totalConcededTimeParsed }}</span>
                </div>

                <div class="header-item">
                    <span class="material-symbols-outlined icon">alarm</span>
                    <span>Total Remaining Time : </span>
                    <span class="value"> {{ totalRemainingTimeParsed }}</span>
                </div>

                <div class="header-item toggle-item">
                    <span class="material-symbols-outlined icon">power_settings_new</span>
                    <span>Time Tracker:</span>
                    <input type="checkbox" id="timeTrackerToggle" v-model="isTimeTrackerActive" class="toggle-checkbox">
                    <label for="timeTrackerToggle" class="toggle-label"></label>
                </div>

            </header>

            <div class="content-area rounded-2xl elevated shadow-lg text-center">
                <h3>Time Tracker Rules</h3>
                <TimeTrackerRuleList :view-mode="'grid'" @tt-rule-list-event="handleTTruleListEvent"></TimeTrackerRuleList>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import { computed, onMounted, ref, toRaw } from 'vue';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import TimeTrackerRuleList from '../components/TimeTrackerRuleList.vue';
import { userDBentry } from '../types/userTypes';
import { TimeTrackerHandler, TimeTrackerRule } from '../engine/timeTracker';
import { delay, minToParsedTime } from '../utils/generalUtils';
import { useRouter } from 'vue-router';
import { ExtComunicator } from '../comunicator/extComunicator';


const notificationManager = ref(null);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const api_gestor = API_gestor.getInstance()
const userHandler = UserHandler.getInstance(api_gestor)
const userInfo = ref<userDBentry>({ // State per le info utente
    username: "",
    avatarImagePath: "", // Usa defaultImagePath se necessario in rendering
    age: 0,
    categories: [],
    createdAt: new Date(),
    email: "",
    firstName: "",
    lastName: "",
    licenseIsValid: false,
    licenseKey: "",
    notifications: false,
    permissions: false, // Assumendo che permissions sia booleano o simile
    phone: "",
    timeTrackerActive: false, // Assumendo che questa proprietà esista
    karmaCoinsBalance: 0,
    friends: [],
    fcmToken: "" // Assumendo che questa proprietà esista
});

const rules = ref<TimeTrackerRule[]>([]); // State per la lista delle regole
const router = useRouter();
const timeTrackerHandler = TimeTrackerHandler.getInstance(api_gestor)
const extComunicator = ExtComunicator.getInstance(timeTrackerHandler, userInfo.value.licenseKey)


// Computed properties per le statistiche dell'header
const totalRules = computed(() => rules.value.length);

const totalConcededTime = computed(() =>
    rules.value.reduce((sum, rule) => sum + rule.minutesDailyLimit, 0)
);
const totalConcededTimeParsed = computed(() => minToParsedTime(totalConcededTime.value));

const totalRemainingTime = computed(() =>
    rules.value.reduce((sum, rule) => sum + rule.remainingTimeMin, 0)
);
const totalRemainingTimeParsed = computed(() => minToParsedTime(totalRemainingTime.value));

// Computed property per il toggle Time Tracker (se implementato)
const isTimeTrackerActive = computed({
    get: () => userInfo.value?.timeTrackerActive ?? false,
    set: async (value: boolean) => {
        try {
            if (userInfo.value) userInfo.value.timeTrackerActive = value;
            let u_info = toRaw(userInfo.value)
            if (u_info) {
                u_info.timeTrackerActive = value;
                console.log("userInfo_DB:\n", u_info)
                const r = await userHandler.updateUserInfo(u_info)
                if (!r.success) {
                    sendNotify("error", "Error updating value : " + r.errorMessage)
                } else {
                    sendNotify('success', `Time Tracker ${value ? 'enabled' : 'disabled'}`);                    
                    extComunicator.notifyPwaReady(userInfo.value) //notify ext with updated user info (updated value of timeTrackerActive)
                }
            } else {
                sendNotify("error", "Error updating value : user info not found in db")
            }
        } catch (error: any) {
            // Gestisci errori di rete o altri errori imprevisti
            if (userInfo.value) userInfo.value.timeTrackerActive = !value; // Revert UI state
            console.error("Error updating Time Tracker status:", error);
            sendNotify('error', `An unexpected error occurred while updating Time Tracker status: ${error.message}`);
        }

    }
});

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

const handleSectionChange = (newSection: any) => {
    console.log(`Navigating to section: ${newSection}`);
};

async function handleTTruleListEvent(TT_event: { action: string, needUpdate: boolean }) {
    console.log("new tt rule list event:\n", TT_event)
    if (TT_event.needUpdate) {
        await askTimeTrackerRules()
    }
}

async function askTimeTrackerRules() {
    try {
        if (userInfo.value.licenseKey == "") {
            throw new Error("invalid license key")
        }
        const response = await timeTrackerHandler.loadAllRules(userInfo.value.licenseKey)
        if (response.success) {
            rules.value = [];
            for (let r of response.rules) {
                rules.value.push(timeTrackerHandler.fromRuleObj((r)));
            }
        }
        else {
            throw new Error(response.errorMessage)
        }
    } catch (error: any) {
        sendNotify("error", "Error obtaining time tracker rules: " + error.message)
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

    // Carica info utente per ottenere la license key e lo stato del time tracker
    const userInfoRes = await userHandler.getUserInfo(true);
    console.log("userInfoRes (time tracker page):\n", userInfoRes);
    if (!userInfoRes.userInfo_DB) { // => user not logged
        sendNotify("warning", "Not logged in, please log in");
        await delay(1500);
        router.push("/welcome");
        return;
    }

    userInfo.value = userInfoRes.userInfo_DB as userDBentry;
    extComunicator.licenseKey = userInfo.value.licenseKey
    await askTimeTrackerRules()


});

</script>

<style scoped>
.main-app {
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

/* Stile specifico per l'item che contiene il toggle */
.header-item.toggle-item {
    display: flex;
    /* Assicura flexbox per icona, label e switch */
    align-items: center;
    gap: 8px;
    /* Spazio tra gli elementi nell'item toggle */
}

.header-item .value {
    font-weight: bold;
    margin-left: 3px;
}

.toggle-checkbox {
    display: none;
}

/* Stile per il label (lo "switch") */
.toggle-label {
    display: block;
    width: 40px;
    /* Larghezza dello switch */
    height: 20px;
    /* Altezza dello switch */
    /* Usa variabile per colore spento, potrebbe essere un colore neutro del tema */
    background-color: var(--input-field-border);
    /* Esempio: usa il colore del bordo input come colore spento */
    border-radius: 20px;
    /* Rendi lo switch arrotondato */
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

/* Stile per il "pomello" (pseudo-elemento) */
.toggle-label::before {
    content: '';
    display: block;
    width: 16px;
    /* Dimensione del pomello */
    height: 16px;
    /* Dimensione del pomello */
    /* Usa variabile per il colore del pomello */
    background-color: var(--background);
    /* Il pomello ha il colore dello sfondo (nero o bianco) */
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: left 0.3s ease;
}

/* Stato "acceso": cambia colore sfondo e posizione pomello */
.toggle-checkbox:checked+.toggle-label {
    background-color: var(--accent-color);
    /* Colore acceso (verde del tema) */
}

/* Stato "acceso": posizione pomello */
.toggle-checkbox:checked+.toggle-label::before {
    left: 22px;
    /* Posizione orizzontale (stato acceso) */
}

.icon {
    font-size: 1.4em;
    margin-right: 2px;
    color: #FFD700;
}

.content-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2%;
    margin-left: 2%;
    width: 97%;
    min-height: 80%;
    overflow: hidden;
    margin-bottom: 2%;
}

.content-area h3 {
    margin-top: 2%;
    font-size: 25px;
}


/* Stili per il box delle regole */
.rules-box {
    flex: 1;
    /* Permette al box regole di crescere */
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: var(--text-color);
    box-sizing: border-box;
    min-width: 0;
    /* Importante per flex items */
    display: flex;
    flex-direction: column;
}

.rules-box h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--primary-color);
}
</style>