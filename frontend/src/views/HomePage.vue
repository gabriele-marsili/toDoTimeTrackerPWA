<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="home-app">
        <Sidebar :activeSection="'home'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">

            <div class="content-grid">
                <!-- Colonna 1: Today To Do -->
                <div class="box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center">
                    <h3>Today To Do</h3>
                    <ToDoList :todos=todayToDoActions viewMode="grid"></ToDoList>
                </div>
                <!-- Colonna 2: Generic To Do -->
                <div class="box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center">
                    <h3>Generic To Do</h3>
                    <ToDoList :todos=todayToDoActions viewMode="grid"></ToDoList>

                </div>
                <!-- Colonna 3: Info Utente + Time Tracker -->
                <div class="last-box">
                    <div class="sub-box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center">
                        <h3>User Info</h3>
                        <!-- Inserisci il componente o contenuto Info Utente -->


                        <div class="avatar-wrapper">
                            <img :src="userInfo.avatarImagePath" alt="User Avatar" class="avatar" />
                        </div>
                        <div class="info-details">
                            <div class="username">{{ userInfo.username }}</div>
                            <div class="prestige-badge">
                                <span class="material-symbols-outlined badge-icon">star</span>
                                <span class="prestige-text">{{ userInfo.prestigeStatus }}</span>
                            </div>
                            <div class="karma-coins">
                                <span class="material-symbols-outlined karma-coins-icon">coin</span>
                                <span>{{ userInfo.karmaCoins }} Karma Coins</span>
                            </div>
                            <div class="friend-count">
                                <span class="material-symbols-outlined friend-icon">people</span>
                                <span>{{ userInfo.friendCount }} Friends</span>
                            </div>
                        </div>

                    </div>

                    <div class="sub-box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center">
                        <h3>Time Tracker</h3>
                        <!-- Inserisci il componente o contenuto Time Tracker -->
                    </div>

                </div>
            </div>

            <div class="footer  p-15 rounded-2xl elevated shadow-lg text-center">
                <h3>Calendar</h3>
                <!-- Inserisci il componente calendario o il contenuto degli eventi -->
            </div>

        </div>

    </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import ToDoList from '../components/ToDoList.vue'
import { ToDoAction, ToDoPriority } from '../types/utilityTypes';

export default {
    components: { Sidebar, NotificationManager, ConnectionStatus, ToDoList },
    setup() {
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
        const todayToDoActions = ref<ToDoAction[]>([])

        const userInfo = ref({
            username: "user name",
            avatarImagePath: "",
            prestigeStatus: "Shoe insole",
            friendCount: 0,
            karmaCoins: 42
        });

        const notificationManager = ref(null); // Riferimento per NotificationManager

        const handleSectionChange = (newSection: any) => {
            console.log(`Navigating to section: ${newSection}`);
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


        onMounted(() => {
            if (isDarkMode.value) {
                document.body.classList.add('dark');
                document.body.classList.remove('light');
            } else {
                document.body.classList.add('light');
                document.body.classList.remove('dark');
            }

            // Mostra una notifica di benvenuto dopo il montaggio
            setTimeout(() => {
                sendNotify("info", "Welcome back in TTT App")
            }, 300);

            //construct fake to to for testing :
            let i = 0;
            let today = new Date().getDay()
            while (i < 10) {
                i++
                let t = new ToDoAction(
                    `TdA ${i}`,
                    `TdA ${i}`,
                    i as ToDoPriority,
                    new Date(),
                    new Date(today + 1),
                    new Date(),
                    'description of the action',
                )
                if (i % 2 == 0) {
                    let s = new ToDoAction(
                        `sub TdA ${i}`,
                        `sub TdA ${i}`,
                        i as ToDoPriority,
                        new Date(),
                        new Date(today + 1),
                        new Date(),
                        'description of the sub to do action',
                    )
                    t.addOrUpdateSubToDoAction(s)
                }
                todayToDoActions.value.push(t)
            }

            //to do : ask to do by api / cache
        });

        return {
            userInfo,
            isDarkMode,
            handleSectionChange,
            notificationManager,
            sendNotify,
            todayToDoActions
        };
    },
};
</script>

<style scoped>
/*
Verde dettagli : #10B981
grigio : #1e1e1e

*/

.home-app {
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
    padding: 20px;
    margin-left: 5%;
    box-sizing: border-box;
    overflow: hidden;
    font-family: 'Poppins', sans-serif;
    height: 100%;
}

.custom-select {
    position: relative;
    display: flex;
    align-items: center;
}

.user-menu {
    display: flex;
    align-items: center;
}

.user-menu img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
}


.bottone {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    /* Spazio tra l'icona e il testo */
    color: white;
    background: #ffffff00;
    border: 2px solid #15b680d4;
    height: 36px;
    /* Altezza standard per allineamento */
    padding: 0 15px;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

.bottone:hover {
    background-color: #15b68020;
    border-color: #10b981;
}


.selettore {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background: #ffffff00;
    border: 2px solid #15b680d4;
    color: white;
    height: 36px;
    /* Altezza standard per allineamento */
    padding: 0 30px 0 10px;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    outline: none;
}

.selettore:hover {
    background-color: #15b68020;
    border-color: #10b981;
}

.select-icon {
    position: absolute;
    right: 10px;
    pointer-events: none;
    color: #15b680;
}

.menu-icon {
    font-size: 18px;
    display: inline-flex;
}


.text-default {
    color: #ffffff;
    /* Testo standard grigio scuro */
}

.text-green {
    color: #22c55e;
    /* Verde vivace */
}

.text-red {
    color: #ef4444;
    /* Rosso vivace */
}

.reset_button,
.apply_button,
.cancel_button {
    height: 30px;
    width: 90px;
    display: flex;
    gap: 0.3rem;
    color: white;
    background: #ffffff00;
    padding: 0px 15px;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    text-align: center;
    align-items: center;
    font-size: 0.9rem;
    transition: background-color 0.3s ease, border-color 0.3s ease;
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

.apply_button:hover {
    background-color: #15b68044;
}

.cancel_button {
    border: 2px solid #9e9e9e;
}

.cancel_button:hover {
    background-color: #ac98983b;
}


/* Griglia con 3 colonne per i box */
.content-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    height: 50%;
}


/* Stile base per i box */
.box {
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: #ffffff;
    box-sizing: border-box;
    height: 60%;
    display: flex;
    flex-direction: column;
}

.last-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 20px
}

.sub-box {
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: #ffffff;
    box-sizing: border-box;
    display: flex;
    height: 28%;
    flex-direction: column;
}

/* Footer (Calendario/Eventi): occupa quasi tutta la larghezza del main content */
.footer {
    margin-top: 10px;
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: #ffffff;
    height: 35vh;
    box-sizing: border-box;
    width: 100%;
}


.user-info {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    background: var(--background-dark, #212121);
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.avatar-wrapper {
    flex-shrink: 0;
}

.avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid var(--avatar-border-color, #10B981);
    /* personalizzabile via variabile CSS */
    object-fit: cover;
}

.info-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #fff;
}

.username {
    font-size: 1.2em;
    font-weight: 600;
}

.prestige-badge,
.friend-count,
.karma-coins {
    display: flex;
    align-items: center;
    font-size: 0.9em;
    margin-top: 4px;
}

.badge-icon,
.friend-icon,
.karma-coins-icon {
    font-size: 1em;
    margin-right: 4px;
    color: #FFD700;
    /* colore oro per il badge, personalizzabile */
}
</style>
