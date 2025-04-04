<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">

    <div class="sidebar" :class="{ expanded: isHovered }" @mouseenter="isHovered = true"
        @mouseleave="isHovered = false">
        <!-- Logo -->
        <div class="logo-container">
            <img src="../assets/logos/mainLogo.png" alt="TTT Logo" class="logo w-12 h-12 rounded-full" />
            <span v-if="isHovered" class="logo-text">TTT App</span>
        </div>
        <!-- Sections -->
        <nav class="menu">
            <div v-for="section in sections" :key="section.name" class="menu-item"
                :class="{ active: section.name === activeSection }" @click="navigateTo(section.name)">
                <span class="material-symbols-outlined menu-icon">{{ section.icon }}</span>
                <span v-if="isHovered" class="menu-text">{{ section.label }}</span>
            </div>
        </nav>
        <!-- Logout -->
        <div class="menu-item logout" @click="logout" :class="{ active: activeSection === 'logout' }">
            <span class="material-symbols-outlined menu-icon">logout</span>
            <span v-if="isHovered" class="menu-text">Logout</span>
        </div>
    </div>
</template>


<script>
import { ref } from 'vue';

export default {
    name: 'Sidebar',
    props: {
        activeSection: {
            type: String,
            required: true, // Deve essere passato dinamicamente dalla pagina
        },
    },
    setup(props, { emit }) {
        const isHovered = ref(false);

        const sections = [
            { name: 'home', label: 'Home', icon: 'home' },
            { name: 'calendar', label: 'Calendar', icon: 'calendar_month' },
            { name: 'time_tracker', label: 'Time Tracker', icon: 'schedule' },
            { name: 'stats', label: 'Stats', icon: 'analytics' },
            { name: 'shop', label: 'Shop', icon: 'store' },
            { name: 'profile', label: 'Profile', icon: 'account_circle' },
            { name: 'settings', label: 'Settings', icon: 'settings' },
        ];

        const navigateTo = async (section) => {

            console.log("going to navigate to ", section)
            try {
                //to do
                
            } catch (error) {
                console.error('Errore nella navigazione:', error);
            }

        };

        const logout = async () => {
            // to do
            console.log("logout res = ", r)
        };

        return {
            isHovered,
            sections,
            navigateTo,
            logout,
        };
    },
};
</script>

<style scoped>
.logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
    width: 100%;
    transition: all 0.3s ease;
    overflow: hidden;
    overflow-y: hidden;
}

.logo-text {
    margin-right: 5px;
    margin-left: 5px;
    font-size: 1.2em;
    font-weight: bold;
}


.sidebar {
    width: 6%;
    height: 100vh;
    background-color: #131212;
    border-right: 2px solid #1e1e1e;
    
    color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: width 0.3s ease, align-items 0.3s ease;
    position: fixed;
    z-index: 10;
    overflow: hidden;
}

.sidebar.expanded {
    width: 180px;
}

.menu {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    width: 100%;
    transition: align-items 0.3s ease;
}

.sidebar.expanded .menu-item {
    margin-left: 20%;
}

.sidebar.expanded .logout {
    margin-left: 50%;
}

.menu-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    /* Allinea l'icona e il testo a sinistra */
    padding: 10px;
    margin-left: 50%;
    width: 100%;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, padding 0.3s ease;
}


.menu-item.active {
    width: 100%;
    color: #10B981;
    margin-left: 25%;
}

.menu-item.active::before {
    content: '';
    width: 6px;
    height: 18px;
    background-color: #10B981;
}

.menu-item.active span {
    color: #ffffff;
    margin-left: calc(1rem - 7px);
}

.menu-item:hover {
    width: 90%;
    transition: 0.2s ease;
}

.menu-icon {
    font-size: 24px;
}

.menu-text {
    margin-left: 10px;
    font-size: 1em;
}

.logout {
    margin-bottom: 20px;
    padding-top: 10px;
    
    display: flex;
    
    align-items: center;
    align-self: center;
    align-content: center;
}
</style>
