<template>
    <transition name="fade">
        <div v-if="visible" class="notification" :class="typeClass" @mouseover="pauseTimer" @mouseleave="resumeTimer">
            <div class="icon">{{ icon }}</div>
            <div class="message">{{ message }}</div>
        </div>
    </transition>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => ["success", "error", "warning", "info"].includes(value),
        },
        message: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            default: 10000, // Durata in millisecondi
        },
    },
    data() {
        return {
            visible: true,
            timer: null,
        };
    },
    computed: {
        typeClass() {
            return `notification--${this.type}`;
        },
        icon() {
            const icons = {
                success: "✔️",
                error: "❌",
                warning: "⚠️",
                info: "ℹ️",
            };
            return icons[this.type] || "";
        },
    },
    methods: {
        pauseTimer() {
            clearTimeout(this.timer);
        },
        resumeTimer() {
            this.startTimer();
        },
        startTimer() {
            this.timer = setTimeout(() => {
                this.visible = false;
                this.$emit("dismissed");
            }, this.duration);
        },
    },
    mounted() {
        this.startTimer();
    },
    beforeDestroy() {
        clearTimeout(this.timer);
    },
};
</script>

<style scoped>
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 1rem;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-family: "Arial", sans-serif;
    opacity: 0.9;
    transition: all 0.3s ease-in-out;
    z-index: 9999;
}

.notification--success {
    border-left: 5px solid #00c853;
    /* Verde */
}

.notification--error {
    border-left: 5px solid #d50000;
    /* Rosso */
}

.notification--warning {
    border-left: 5px solid #ffab00;
    /* Arancione/Giallo */
}

.notification--info {
    border-left: 5px solid #2962ff;
    /* Blu */
}

.icon {
    margin-right: 10px;
    font-size: 1.5rem;
}

.message {
    flex: 1;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>