<template>
    <Notification v-if="currentNotification" :type="currentNotification.type" :message="currentNotification.message"
        :duration="currentNotification.duration" @dismissed="dismissNotification" />
</template>

<script>
import Notification from '../components/Notification.vue';



export default {
    components: { Notification },
    data() {
        return {
            currentNotification: null,
        };
    },
    methods: {
        showNotification(notification) {
            if (this.currentNotification) {
                this.dismissNotification();
            }
            this.currentNotification = notification;
        },
        dismissNotification() {
            if (this.currentNotification != null) {
                this.currentNotification = null;
            }

        },
    },
};
</script>