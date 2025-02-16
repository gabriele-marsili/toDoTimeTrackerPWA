<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 class="text-2xl font-bold text-center mb-4">Registrazione</h2>
            <RegistrationForm />
            <p class="text-center text-sm mt-4">
                Hai già un account?
                <router-link to="/login" class="text-blue-500 hover:underline">Accedi</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import RegistrationForm from '../components/RegistrationForm.vue';
</script>