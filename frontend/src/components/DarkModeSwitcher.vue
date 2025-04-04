<template>
    <div class="row-disposition">
        <p>Theme Mode:</p>
        <button @click="toggleDarkMode" class="baseButton">
            <span v-if="isDark" class="text-yellow-400">Dark 🌙</span>
            <span v-else class="text-gray-900">Light ☀️</span>
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const isDark = ref(localStorage.getItem("theme") === "dark");
const emit = defineEmits(["changeDarkMode"])

const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    localStorage.setItem("theme", isDark.value ? "dark" : "light");
    if (isDark.value) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    }

    emit('changeDarkMode',{isDarkMode : isDark.value})
};

onMounted(() => {
    document.documentElement.classList.toggle("dark", isDark.value);
});
</script>