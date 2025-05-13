<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">

    <NotificationManager ref="notificationManager" />
    <div class="carousel-container">
        <div class="carousel">
            <!-- Step 1: Personal Information -->
            <div class="carousel-slide">
                <h2 class="text-2xl font-bold mb-4 text-center">Welcome to the Registration</h2>
                <p class="text-center text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                    To complete your registration, you need to go through all three sections of this form.
                    You can navigate between sections by swiping left or right.
                    Make sure to fill in all required fields before submitting.
                </p>
                <p class="text-center text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                    This application is a to-do app with an integrated time tracker and a point system linked to
                    activity categories.
                    Activities can belong to multiple categories, allowing you to track and optimize your time
                    effectively.
                </p>
                <p class="text-center text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                    In the questionnaire, you are encouraged to select activity categories that align with your
                    lifestyle and goals.
                    By distributing points among these categories, you define their importance based on your personal
                    priorities,
                    ensuring a balanced and goal-oriented time management experience.
                </p>
                <div class="swipe-indicator">Swipe right to continue <span class="material-symbols-outlined">arrow_forward</span></div>
            </div>

            <div class="carousel-slide">
                <h2 class="text-2xl font-bold mb-6 text-center">Personal Information :</h2>
                <div class="grid grid-cols-2 gap-4">
                    <input type="text" autocomplete="off" v-model="form.username" placeholder="Username"
                        class="baseInputField" />
                    <input type="email" autocomplete="off" v-model="form.email" placeholder="Email"
                        class="baseInputField" />

                    <input type="text" autocomplete="off" v-model="form.firstName" placeholder="First Name"
                        class="baseInputField" />
                    <input type="text" autocomplete="off" v-model="form.lastName" placeholder="Last Name"
                        class="baseInputField" />

                    <input type="number" autocomplete="off" v-model="form.age" placeholder="Age"
                        class="baseInputField no-spin" />
                    <input type="tel" autocomplete="off" v-model="form.phone" placeholder="Phone Number"
                        class="baseInputField" />
                </div>
                <div class="swipe-indicator">Swipe right to continue <span class="material-symbols-outlined">arrow_forward</span></div>
            </div>

            <!-- Step 2: Questionnaire -->
            <div class="carousel-slide">

                <h2 class="text-2xl font-bold mb-2">Quick questionnaire:</h2>
                <p class="mb-4 text-sm">
                    Please allocate 100 points among the following categories (a category must have at least 1 point),
                    remaining points : {{ remainingPoints }}
                </p>

                <!-- Griglia per le categorie (2 per riga) -->
                <div class="grid grid-cols-5 gap-4">
                    <div v-for="(cat, index) in form.categories" :key="index"
                        class="flex flex-col items-start p-2 rounded-lg shadow">

                        <!-- Label allineata a sinistra -->
                        <label class="text-sm font-semibold mb-1 self-start">{{ cat.name }}</label>

                        <div class="flex items-center gap-2 w-26">
                            <input type="number" v-model.number="cat.points" :min="0"
                                :max="cat.points + remainingPoints" class="baseInputField no-spin w-full" />

                            <button v-if="form.categories.length > 1" @click="removeCategory(index)">
                                <span class="material-symbols-outlined g-icon ">delete</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Aggiunta di una nuova categoria -->
                <div class="mt-6 flex gap-2">
                    <input type="text" v-model="newCategoryName" placeholder="Add new category"
                        class="baseInputField flex-1" />
                    <button @click="addCategory" class="baseButtonHigher">Add</button>
                </div>

                <div class="swipe-indicator">Swipe right to continue <span class="material-symbols-outlined">arrow_forward</span></div>

            </div>

            <!-- Step 3: Preferences and Terms -->
            <div class="carousel-slide">
                <h2 class="text-2xl font-bold mb-6">Preferences and Terms</h2>
                <div class="space-y-4">                    
                    <div>
                        <label class="flex items-center gap-2">
                            <input class="baseCheckbox" type="checkbox" v-model="form.timeTrackerActive" />
                            Enable Time Tracker
                        </label>
                    </div>
                    <div class="mt-4">
                        <p class="text-sm mb-2">Terms and Conditions:</p>
                        <div class="p-2 border rounded h-18 overflow-auto text-sm ">
                            <p>
                                By registering, you agree that your sensitive data will be handled in compliance with
                                current regulations,
                                encrypted during transmission, and securely stored. Please read our privacy policy for
                                more details.
                            </p>
                        </div>
                        <label class="flex items-center mt-2 gap-2">
                            <input class="baseCheckbox" type="checkbox" v-model="form.acceptTerms" />
                            I accept the terms and conditions.
                        </label>
                    </div>
                </div>
                <div class="mt-6">
                    <button @click="submitForm" class="baseButton w-full">Submit Registration</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import { API_gestor } from '../backend-comunication/api_comunication';
import { delay } from '../utils/generalUtils';
import { useRouter } from 'vue-router';
const router = useRouter()
const totalPoints = 100;
const isOnline = ref(navigator.onLine)
const form = reactive({
    // Personal Information
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    phone: '',
    // Questionnaire Categories (default ones)
    categories: [
        { name: 'Sport', points: 1 },
        { name: 'Work', points: 1 },
        { name: 'Study', points: 1 },
        { name: 'Social', points: 1 },
        { name: 'Movies', points: 1 },
        { name: 'Reading', points: 1 },
        { name: 'New Skills', points: 1 },
        { name: 'New Interests', points: 1 },
        { name: 'Travel', points: 1 },
        { name: 'Music', points: 1 }
    ],
    // Preferences and Terms
    notifications: true,
    permissions: false,
    timeTracker: false,
    acceptTerms: false,
});

const newCategoryName = ref('');
const notificationManager = ref(null);
const apiGestor = API_gestor.getInstance()

const totalAllocated = computed(() => {
    return form.categories.reduce((sum, cat) => sum + (cat.points || 0), 0);
});

const remainingPoints = computed(() => {
    return Math.max(totalPoints - totalAllocated.value, 0);
});


const addCategory = () => {
    if (newCategoryName.value.trim() === '') return;
    form.categories.push({ name: newCategoryName.value.trim(), points: 1 });
    newCategoryName.value = '';
};

const removeCategory = (index) => {
    if (form.categories.length > 1) {
        form.categories.splice(index, 1);
    }
};

const submitForm = async () => {
    try {


        let errors = [];

        // Controllo campi obbligatori
        if (!form.username.trim()) errors.push("Username is required.");
        if (!form.firstName.trim()) errors.push("First Name is required.");
        if (!form.lastName.trim()) errors.push("Last Name is required.");
        if (!form.email.trim()) errors.push("Email is required.");
        if (!form.age) errors.push("Age is required.");
        if (!form.phone.trim()) errors.push("Phone Number is required.");

        // Validazione email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            errors.push("Please enter a valid email address.");
        }

        // Controllo età (deve essere un numero valido e positivo)
        if (isNaN(form.age) || form.age <= 0) {
            errors.push("Please enter a valid age.");
        }

        // Controllo numero di telefono (almeno 8 cifre)
        const phoneRegex = /^\d{8,}$/;
        if (!phoneRegex.test(form.phone)) {
            errors.push("Phone Number must be at least 8 digits long.");
        }

        // Controllo allocazione dei punti
        if (remainingPoints.value !== 0) {
            errors.push(`You must allocate exactly ${totalPoints} points. Remaining points: ${remainingPoints.value}`);
        }

        //controllo punti negativi:
        for (let c of form.categories) {
            if (c.points < 1) {
                errors.push(`A category can't have less than 1 point (${c.name})`)
                break;
            }

            if (c.points > (totalPoints - form.categories.length + 1)) {
                errors.push(`Having ${form.categories.length} you can't add more than ${(totalPoints - form.categories.length + 1)} points to a single category (${c.name})`)
                break;
            }
        }

        // Controllo accettazione termini e condizioni
        if (!form.acceptTerms) {
            errors.push("You must accept the terms and conditions.");
        }

        // Se ci sono errori, mostra il primo nella notifica
        if (errors.length > 0) {
            notificationManager.value?.showNotification({
                type: "error",
                message: errors[0], // Mostra il primo errore
            });
            return;
        }

        //check username && email
        const checkResponse = await apiGestor.checkUniqueEmailAndUsername(form.email, form.username);
        console.log("checkResponse:\n", checkResponse)
        if (!checkResponse.success) {
            let e_msg = checkResponse.errorMessage
            if (!isOnline.value) {
                e_msg = "Bad connection, please try again when you're online"
            }

            notificationManager.value?.showNotification({
                type: "error",
                message: e_msg,
            });
            return;
        }

        // Se tutto è valido, invia il form
        console.log("Registration Form Submitted:", form);
        notificationManager.value?.showNotification({
            type: "info",
            message: "Submitting registration...",
        });

        //registration :
        const registrationEsit = await apiGestor.registerUser(form)
        if (registrationEsit.success) {
            notificationManager.value?.showNotification({
                type: "success",
                message: "Successfully registered as " + form.username,
            });
            await delay(1500)
            notificationManager.value?.showNotification({
                type: "info",
                message: "We've sent you the license key via email, please check also the spam",
            });
            await delay(1500)
            router.push("/login") //load login page 

        } else {
            let e_msg = registrationEsit.errorMessage
            if (!isOnline.value) {
                e_msg = "Bad connection, please try again when you're online"
            }

            console.log("error in registation:\n", e_msg)
            notificationManager.value?.showNotification({
                type: "error",
                message: e_msg,
            });

        }


    } catch (error) {
        console.log("error in submit form:\n", error)
        notificationManager.value?.showNotification({
            type: "error",
            message: "An error occured while submitting form, please try again",
        });
    }

};



</script>

<style scoped>
/* Carosello a swipe con scroll-snap */
.carousel-container {
    overflow: hidden;
    width: 100%;
    position: relative;
}

.carousel {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 1rem;
}

.carousel-slide {
    flex: 0 0 100%;
    scroll-snap-align: start;
    padding: 1rem;
}

/* Nasconde la scrollbar su desktop */
.carousel::-webkit-scrollbar {
    display: none;
}

.no-spin {
    -moz-appearance: textfield;
}

/* STILE PER L'INDICATORE DI SCORRIMENTO */
.swipe-indicator {
    margin-top: auto;
    /* Spinge l'indicatore in fondo nel contenitore flex */
    text-align: center;
    /* Centra il testo */
    font-size: 0.9rem;
    color: var(--text-color-secondary, gray);
    /* Colore discreto */
    padding: 10px 0;
    /* Spazio sopra e sotto */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px; /* Spazio tra testo e icona */
    /* Puoi aggiungere una leggera animazione se vuoi che lampeggi o si muova */
}

.swipe-indicator .material-symbols-outlined {
    font-size: 1.2em; /* Dimensione dell'icona */
    /* Opzionale: animazione per far muovere l'icona */
     animation: swipe-arrow 1.5s infinite ease-in-out;
}

@keyframes swipe-arrow {
    0%, 100% {
        transform: translateX(0);
    }
    50% {
        transform: translateX(5px); /* Sposta l'icona a destra */
    }
}
</style>