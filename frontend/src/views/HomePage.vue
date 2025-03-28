<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">


    <div class="home-app">        
        <Sidebar :activeSection="'home'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">

           
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import NotificationManager from '../gestors/NotificationManager.vue';

export default {
    components: { Sidebar, NotificationManager },
    setup() {
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
    
        const user = ref({
            name: "UserName",
            image: "", //to do : insert default photo image
        });
        
        const notificationManager = ref(null); // Riferimento per NotificationManager

        const handleSectionChange = (newSection) => {
            console.log(`Navigating to section: ${newSection}`);
        };

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
                if (notificationManager.value) {
                    notificationManager.value.showNotification({
                        type: 'info',
                        message: `Welcome back in TTT App`,
                    });
                }
            }, 300); 
        });

        return {
            user,
            isDarkMode,
            handleSectionChange,
            notificationManager
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
    height: 100%;
    overflow-y: hidden;
    overflow: hidden;
}

.main-content {
    border: 2px solid #1e1e1e;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    margin-left: 5%;
    height: 91.1vh;
    font-family: 'Poppins', sans-serif;
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

.apply_button:hover{
    background-color: #15b68044;
}

.cancel_button {
    border: 2px solid #9e9e9e;
}

.cancel_button:hover {
    background-color: #ac98983b;
}
</style>
