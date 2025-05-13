<template>
    <div v-if="isVisible" class="mystery-box-animation-overlay">
        <div class="animation-container" :class="`rarity-${box.rarity}`">

            <div v-if="animationStep === 'processing'" class="box-state processing">
                  <img :src="box.imageUrl || '/path/to/default-box-image.png'" :alt="box.name" class="box-image processing-animation" />
                  <p class="box-name">Processing...</p>
                  <div class="spinner"></div>
            </div>

            <div v-if="animationStep === 'opening'" class="box-state opening">
                 <img :src="box.imageUrl || '/path/to/default-box-image.png'" :alt="box.name" class="box-image static-image" />
                 <p class="box-name">Opening...</p>
            </div>

            <div v-if="animationStep === 'suspense'" class="box-state suspense">
                 <img :src="box.imageUrl || '/path/to/default-box-image.png'" :alt="box.name" :class="['box-image', `rarity-suspense-animation-${box.rarity}`]" />
                 <p class="box-name">What's inside?</p>
            </div>

            <div v-if="animationStep === 'revealed' && grantedItem" class="box-state revealed">
                <h3>You Got:</h3>
                <img :src="grantedItem.imageUrl || '/path/to/default-item-image.png'" :alt="grantedItem.name" :class="['granted-item-image', `rarity-reveal-animation-${grantedItem.rarity}`]" />
                <h4 :class="`rarity-text-${grantedItem.rarity}`">{{ grantedItem.name }}</h4>
                <p>{{ grantedItem.description }}</p>
                <button class="baseButton awesome-button" @click="closeAnimation">Awesome!</button>
            </div>

             </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { MysteryBoxConfig, ShopItem, ItemRarity } from '../types/shopTypes';

const props = defineProps<{
    box: MysteryBoxConfig; // The mystery box being opened
    grantedItem: ShopItem | null; // The item received (passed after backend confirms)
    isVisible: boolean; // Controls visibility of the overlay
}>();

const emit = defineEmits(['animation-complete', 'closed']); 

const animationStep = ref<'closed' | 'processing' | 'opening' | 'suspense' | 'revealed'>('closed');

watch(() => props.isVisible, (newValue) => {
    if (newValue && props.box) {
        animationStep.value = 'processing'; // Start in processing state
    } else {
        animationStep.value = 'closed'; // Reset when hidden
    }
});

watch(() => props.grantedItem, (newItem) => {
    if (newItem) {
        console.log("Granted item received, starting animation sequence.");        
        setTimeout(() => {
            animationStep.value = 'opening';             
            setTimeout(() => {
                animationStep.value = 'suspense';                
                setTimeout(() => {
                    animationStep.value = 'revealed';
                    emit('animation-complete', newItem);
                }, 2500); 
            }, 1500); 
        }, 500); 
    }
});


const closeAnimation = () => {
    animationStep.value = 'closed';
    emit('closed'); 
};

</script>

<style scoped>
.mystery-box-animation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9); 
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
    animation: fadeInOverlay 0.3s ease-out;
}

@keyframes fadeInOverlay {
    from { opacity: 0; }
    to { opacity: 1; }
}


.animation-container {
    background-color: var(--background);
    padding: 40px;
    border-radius: 15px;
    text-align: center;
    color: var(--text-color);
    box-shadow: var(--shadow);
    max-width: 90%;
    min-width: 300px; 
    max-height: 90%;
    overflow-y: auto;
    position: relative;
    border: 3px solid transparent; 
    animation: scaleInContainer 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); 
}

@keyframes scaleInContainer {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}


/* Rarity based container borders and shadows */
.animation-container.rarity-mainstream { border-color: gray; }
.animation-container.rarity-quite-common { border-color: #a4e4a4; }
.animation-container.rarity-uncommon { border-color: lightgreen; }
.animation-container.rarity-rare { border-color: dodgerblue; }
.animation-container.rarity-special { border-color: violet; }
.animation-container.rarity-legendary {
    border-color: gold;
    box-shadow: 0 0 8px 4px gold; 
}
.animation-container.rarity-unique {
    border-color: #8B0000;
    box-shadow: 0 0 20px 10px #8B0000;
}


.box-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s ease-in-out;
}

.box-state:not(.processing):not(.opening):not(.suspense):not(.revealed) {
    display: none;
}


.box-image {
    width: 120px;
    height: 120px;
    object-fit: contain;
    margin-bottom: 20px;
}

.processing-animation {
     animation: pulse 1.5s infinite ease-in-out; 
}

.spinner {
     border: 4px solid #f3f3f3; 
     border-top: 4px solid var(--accent-color);
     border-radius: 50%;
     width: 30px;
     height: 30px;
     animation: spin 1s linear infinite;
     margin-top: 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}


@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-20px);
    }
    60% {
        transform: translateY(-10px); 
    }
}


.suspense .box-image {
     animation: bounce 1s infinite; 
}

.granted-item-image {
    width: 180px; 
    height: 180px;
    object-fit: contain;
    margin-bottom: 15px;
    animation: fadeInScale 0.5s ease-out; 
}

@keyframes fadeInScale {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
}


.granted-item-image.rarity-reveal-animation-Legendary,
.granted-item-image.rarity-reveal-animation-Unique {
     animation: legendary-reveal 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
}

@keyframes legendary-reveal {
     0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
     80% { opacity: 1; transform: scale(1.1) rotate(5deg); }
     100% { transform: scale(1) rotate(0deg); }
}


.box-name {
    font-size: 1.3em;
    margin-bottom: 15px;
}

.revealed h3 {
    font-size: 1.6em; 
    margin-bottom: 10px;
    color: var(--accent-color);
}

.revealed h4 {
    font-size: 1.4em; 
    margin-bottom: 8px;
    animation: fadeIn 0.6s ease-out 0.2s backwards; 
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}


.revealed p {
     font-size: 1.1em;
     margin-bottom: 25px;
     color: var(--text-color);
      animation: fadeIn 0.6s ease-out 0.4s backwards;
}

/* Rarity text colors (matching ShopDisplay.vue) */
.rarity-text-mainstream { color: gray; }
.rarity-text-quite-common { color: #a4e4a4; }
.rarity-text-uncommon { color: lightgreen; }
.rarity-text-rare { color: dodgerblue; }
.rarity-text-special { color: violet; }
.rarity-text-legendary { color: gold; }
.rarity-text-unique { color: #8B0000; }


.awesome-button {
    margin-top: 20px;
    animation: fadeInScale 0.5s ease-out 0.6s backwards;
}

</style>