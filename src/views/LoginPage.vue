<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 class="text-2xl font-bold text-center mb-4">Login</h2>
            <LoginForm />
            <p class="text-center text-sm mt-4">
                Non hai un account?
                <router-link to="/register" class="text-blue-500 hover:underline">Registrati</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import LoginForm from '../components/LoginForm.vue';
</script>