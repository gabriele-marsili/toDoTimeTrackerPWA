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
import { MysteryBoxConfig, ShopItem, ItemRarity } from '../types/shopTypes'; // Adjust path

const props = defineProps<{
    box: MysteryBoxConfig; // The mystery box being opened
    grantedItem: ShopItem | null; // The item received (passed after backend confirms)
    isVisible: boolean; // Controls visibility of the overlay
}>();

const emit = defineEmits(['animation-complete', 'closed']); // Emit when animation is done/user closes

const animationStep = ref<'closed' | 'processing' | 'opening' | 'suspense' | 'revealed'>('closed');

watch(() => props.isVisible, (newValue) => {
    if (newValue && props.box) {
        animationStep.value = 'processing'; // Start in processing state
    } else {
        animationStep.value = 'closed'; // Reset when hidden
        // Ensure grantedItem is also reset when closing
        // Note: Depending on how parent manages state, parent might also clear grantedItem
        // If not, you might want to add grantedItem.value = null; here.
    }
});

watch(() => props.grantedItem, (newItem) => {
    // Start the animation sequence only when a valid grantedItem is received
    // Check for newItem and ensure it's not just a default/initial null state
    if (newItem) {
        console.log("Granted item received, starting animation sequence.");
        // Delay before starting the "opening" animation
        setTimeout(() => {
            animationStep.value = 'opening';
             // Duration of the opening animation (adjust CSS animation duration too)
            setTimeout(() => {
                animationStep.value = 'suspense';
                // Duration of the suspense screen (longer as requested)
                setTimeout(() => {
                    animationStep.value = 'revealed';
                    emit('animation-complete', newItem); // Notify parent animation is done
                }, 2500); // Suspense duration (2.5 seconds)
            }, 1500); // Opening duration (1.5 seconds - adjust to match your CSS animation)
        }, 500); // Processing duration (0.5 seconds extra delay)
    }
});


const closeAnimation = () => {
    animationStep.value = 'closed';
    emit('closed'); // Notify parent to hide the component and reset state
};

// You would implement CSS animations/transitions using @keyframes and classes here.
// For more complex or chained animations, consider using JavaScript animation libraries
// or listening to CSS animationend events.

</script>

<style scoped>
.mystery-box-animation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9); /* Slightly darker overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(8px); /* More blur */
    animation: fadeInOverlay 0.3s ease-out; /* Fade in the overlay */
}

@keyframes fadeInOverlay {
    from { opacity: 0; }
    to { opacity: 1; }
}


.animation-container {
    background-color: var(--background-dark);
    padding: 40px;
    border-radius: 15px;
    text-align: center;
    color: var(--text-color);
    box-shadow: var(--shadow);
    max-width: 90%;
    min-width: 300px; /* Ensure a minimum width */
    max-height: 90%;
    overflow-y: auto;
    position: relative;
    border: 3px solid transparent; /* Base border */
    animation: scaleInContainer 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); /* Pop-in effect */
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
    box-shadow: 0 0 8px 4px gold; /* Slightly stronger glow */
}
.animation-container.rarity-unique {
    border-color: #8B0000;
    box-shadow: 0 0 20px 10px #8B0000; /* More pronounced glow */
    /* Add background animations if desired, similar to shop display */
}


.box-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* Add transitions for state changes */
    transition: opacity 0.3s ease-in-out;
}

/* Hide states that are not active */
.box-state:not(.processing):not(.opening):not(.suspense):not(.revealed) {
    display: none;
}


.box-image {
    width: 120px; /* Slightly larger image */
    height: 120px;
    object-fit: contain;
    margin-bottom: 20px;
}

/* Processing state animation */
.processing-animation {
     animation: pulse 1.5s infinite ease-in-out; /* Keep pulse or change */
}

.spinner {
     border: 4px solid #f3f3f3; /* Light grey */
     border-top: 4px solid var(--accent-color); /* Accent color */
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



/* Suspense state animation - Applied to the image directly in this state */
/* New Bounce Keyframes */
@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-20px); /* How high the bounce is */
    }
    60% {
        transform: translateY(-10px); /* Slightly less bounce */
    }
}


/* Apply bounce animation to the image during the suspense state */
.suspense .box-image {
     animation: bounce 1s infinite; /* Apply the bounce animation */
}


/* You can still add rarity-specific *variations* to the bounce if desired,
   e.g., different speed or height based on rarity classes, but the base is bounce. */
/* Example (optional): */
/* .suspense .box-image.rarity-Legendary { animation-duration: 0.8s; } */


.granted-item-image {
    width: 180px; /* Larger item image */
    height: 180px;
    object-fit: contain;
    margin-bottom: 15px;
    animation: fadeInScale 0.5s ease-out; /* Fade in the item */
}

@keyframes fadeInScale {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
}


/* Item reveal animation based on rarity (optional, adds flair) */
.granted-item-image.rarity-reveal-animation-Legendary,
.granted-item-image.rarity-reveal-animation-Unique {
     animation: legendary-reveal 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; /* Pop-out effect */
}

@keyframes legendary-reveal {
     0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
     80% { opacity: 1; transform: scale(1.1) rotate(5deg); }
     100% { transform: scale(1) rotate(0deg); }
}


.box-name {
    font-size: 1.3em; /* Slightly larger text */
    margin-bottom: 15px;
}

.revealed h3 {
    font-size: 1.6em; /* Slightly larger */
    margin-bottom: 10px;
    color: var(--accent-color);
}

.revealed h4 {
    font-size: 1.4em; /* Slightly larger */
    margin-bottom: 8px;
    animation: fadeIn 0.6s ease-out 0.2s backwards; /* Fade in with a slight delay */
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}


.revealed p {
     font-size: 1.1em; /* Slightly larger */
     margin-bottom: 25px; /* More space before button */
     color: var(--text-color);
      animation: fadeIn 0.6s ease-out 0.4s backwards; /* Fade in with more delay */
}

/* Rarity text colors (matching ShopDisplay.vue) */
.rarity-text-mainstream { color: gray; }
.rarity-text-quite-common { color: #a4e4a4; }
.rarity-text-uncommon { color: lightgreen; }
.rarity-text-rare { color: dodgerblue; }
.rarity-text-special { color: violet; }
.rarity-text-legendary { color: gold; }
.rarity-text-unique { color: #8B0000; }


/* Style for the button to close the revealed state */
.awesome-button {
    margin-top: 20px;
    /* Add some entrance animation */
    animation: fadeInScale 0.5s ease-out 0.6s backwards; /* Fade in and scale slightly */
}

/* Ensure baseButton styles are defined elsewhere or included here */
/* .baseButton { ... } */

</style>