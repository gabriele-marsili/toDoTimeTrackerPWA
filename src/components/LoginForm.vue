<template>
    <form @submit.prevent="login">
        <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Email</label>
            <input v-model="email" type="email" required
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Password</label>
            <input v-model="password" type="password" required
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition">
            Accedi
        </button>
    </form>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");
const password = ref("");

const login = () => {
    console.log("Login con:", email.value, password.value);
};
</script>