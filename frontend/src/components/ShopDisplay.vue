<template>
    <div class="shop-display">
        <h2>Shop Items</h2>

        <div class="items-carousel custom-scrollbar">
            <div v-for="item in shopItems" :key="item.id"
                :class="['shop-item-card', `rarity-${item.rarity}`, { 'owned-item': isItemOwned(item.id) }]">
                <img :src="item.imageUrl || '/path/to/default-item-image.png'" :alt="item.name" class="item-image" />
                <div class="item-info">
                    <h3 :class="`rarity-text-${item.rarity}`">{{ item.name }}</h3>
                    <p>{{ item.description }}</p>
                    <p>Cost: {{ item.cost }} Karma Points</p>
                    <p :class="`rarity-text-${item.rarity}`">Rarity: {{ item.rarity }}</p>
                </div>
                <button class="baseButton buy-button" @click="buyItem(item)" :disabled="isItemOwned(item.id)"
                    :class="{ 'disabled-button': isItemOwned(item.id) }">
                    {{ isItemOwned(item.id) ? 'Already Owned' : 'Buy' }}
                </button>
            </div>
        </div>

        <h2>Mystery Boxes</h2>

        <div class="mystery-boxes">
            <div v-for="box in mysteryBoxes" :key="box.id" :class="['mystery-box-card', `rarity-${box.rarity}`]">
                <img :src="box.imageUrl || '/path/to/default-box-image.png'" :alt="box.name" class="item-image" />
                <div class="item-info">
                    <h3 :class="`rarity-text-${box.rarity}`">{{ box.name }}</h3>
                    <p>Cost: {{ box.cost }} Karma Points</p>
                    <p :class="`rarity-text-${box.rarity}`">Rarity: {{ box.rarity }}</p>
                </div>
                <button class="baseButton buy-button" @click="buyMysteryBox(box)">Buy Mystery Box</button>
            </div>
        </div>

        <MysteryBoxOpeningAnimation :box="boxToAnimate" :grantedItem="grantedItem" :isVisible="isAnimationVisible"
            @animation-complete="handleAnimationComplete" @closed="handleAnimationClosed" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue';
import { API_gestor } from '../backend-comunication/api_comunication'; // Adjust the import path if needed
import { ShopItem, MysteryBoxConfig, UserInventory, ItemRarity } from '../types/shopTypes'; // Adjust the import path if needed
import { userDBentry } from '../types/userTypes'; // Assuming userDBentry is in userTypes.ts
import MysteryBoxOpeningAnimation from './MysteryBoxOpeningAnimation.vue';

const api_gestor = API_gestor.getInstance();

const shopItems = ref<ShopItem[]>([]);
const mysteryBoxes = ref<MysteryBoxConfig[]>([]);
const props = defineProps<{
    userInfo: userDBentry;
}>();
const userInventory = ref<UserInventory>({ licenseKey: '', items: [] }) // Initialize with empty licenseKey

// State for the animation
const isAnimationVisible = ref(false);
const defaultGrantedItem = ref<ShopItem>({
    id: "default granted item",
    name: "",
    description: "",
    cost: 9999999,
    rarity: ItemRarity.Unique,
    type: 'avatar'
});
const grantedItem = ref<ShopItem>(defaultGrantedItem.value);
const boxToAnimate = ref<MysteryBoxConfig>({
    id: "",
    name: "",
    cost: 9999999,
    rarity: ItemRarity.Unique,
    imageUrl: "",
    availableItems: []
});


const emit = defineEmits(['update-karma', 'show-notification']);

// Helper function to check if an item is in the user's inventory
function isItemOwned(itemId: string): boolean {
    return userInventory.value.items.some(item => item.item.id === itemId);
}


watch(() => props.userInfo, async (updated_info) => { // Watch for changes in props.userInfo
    console.log("new user info shop display:\n", updated_info)
    if (updated_info && updated_info.licenseKey !== "") { // Ensure licenseKey is loaded
        // Update userInventory ref with the new licenseKey before fetching
        userInventory.value.licenseKey = updated_info.licenseKey;
        await updateLocalUserInventory();
        console.log("local inventory updated");
    }
}, { immediate: true }); // Immediate: true runs the watcher immediately on component mount


async function updateLocalUserInventory() {
    if (userInventory.value.licenseKey == "") {
        console.log("user inventory lk not loaded yet, skipping inventory update");
        return;
    }

    const userInventoryRes = await api_gestor.getUserInventory(userInventory.value.licenseKey);
    if (userInventoryRes.success) {
        userInventory.value = userInventoryRes.userInventory;
    }
    else {
        if (userInventoryRes.errorMessage.includes('No user inventory found')) {
            // If no inventory found, it means this is a new user or an issue.
            // Let's create a default empty inventory for the user if it doesn't exist.
            const newInventory: UserInventory = { licenseKey: userInventory.value.licenseKey, items: [] };
            const r = await api_gestor.updateUserInventory(newInventory);
            if (r.success) {
                userInventory.value = newInventory; // Update local state as well
                emit("show-notification", "info", "User inventory created");
            } else {
                emit("show-notification", "error", `Failed to create user inventory: ${r.errorMessage}`);
            }

        } else {
            emit("show-notification", "error", `Failed to load user inventory: ${userInventoryRes.errorMessage}`);
        }
    }
}


onMounted(async () => {
    await fetchShopContent();
    // updateLocalUserInventory is now called by the watcher with immediate: true
});

async function fetchShopContent() {
    // Use api_gestor.getShopItems() which should handle server/cache logic
    const response = await api_gestor.getShopItems();
    if (response.success) {
        // For the carousel, let's take up to the first 5 items as requested
        shopItems.value = response.items.slice(0, 5);
        mysteryBoxes.value = response.mysteryBoxes;

        console.log("shopItems.value:\n", shopItems.value)
        console.log("mysteryBoxes.value:\n", mysteryBoxes.value)
    } else {
        emit('show-notification', 'error', 'Failed to load shop content: ' + response.errorMessage);
    }
}


async function buyItem(item: ShopItem) {
    // Prevent purchase if already owned
    if (isItemOwned(item.id)) {
        emit('show-notification', 'info', `You already own "${item.name}".`);
        return;
    }

    if (props.userInfo.karmaCoinsBalance < item.cost) {
        emit('show-notification', 'warning', 'Not enough Karma Points to buy this item.');
        return;
    }

    await updateLocalUserInventory() //get last user inventory status (by db)

    // Check if item is already in inventory and update quantity, or add new item
    const existingItemIndex = userInventory.value.items.findIndex(invItem => invItem.item.id === item.id);

    if (existingItemIndex > -1) {
        userInventory.value.items[existingItemIndex].quantity += 1;
    } else {
        userInventory.value.items.push({ item: item, quantity: 1 });
    }


    // Deduct karma points and update inventory in Firestore
    const updatedUserInfo = { ...props.userInfo, karmaCoinsBalance: props.userInfo.karmaCoinsBalance - item.cost };

    //update user's karma coin balance & user's inventory
    const [inventoryUpdateRes, userUpdateRes] = await Promise.all([
        api_gestor.updateUserInventory(userInventory.value),
        api_gestor.updateUserInfo(updatedUserInfo)
    ]);


    if (inventoryUpdateRes.success && userUpdateRes.success) {
        emit('show-notification', 'success', `${item.name} purchased successfully!`);
        emit("update-karma")
    } else {
        // Consider rolling back the changes if one update failed
        emit('show-notification', 'error', 'Failed to purchase item.');
        console.log("Purchase failed:", inventoryUpdateRes.errorMessage, userUpdateRes.errorMessage);
    }
}

async function buyMysteryBox(box: MysteryBoxConfig) {
    boxToAnimate.value = box;
    grantedItem.value = defaultGrantedItem.value; // Reset granted item
    isAnimationVisible.value = true;


    if (props.userInfo.karmaCoinsBalance < box.cost) {
        emit('show-notification', 'warning', 'Not enough Karma Points to buy this mystery box.');
        isAnimationVisible.value = false;
        return;
    }

    await updateLocalUserInventory() //get last user inventory status (by db)

    // --- Mystery Box Logic ---
    // 1. Select a random item based on probabilities
    const itemReceived = selectRandomItemFromBox(box);

    if (!itemReceived) {
        emit('show-notification', 'error', 'Could not open the mystery box.');
        isAnimationVisible.value = false;
        return;
    }

    let inventoryUpdateRes: { success: boolean; errorMessage?: string } | null = null;
    let userUpdateRes: { success: boolean; errorMessage?: string } | null = null;
    let updatedUserInfo = { ...props.userInfo, karmaCoinsBalance: props.userInfo.karmaCoinsBalance - box.cost }; // Deduct box cost first

    // Check if the granted item is already in the user's inventory
    const existingItemInInventory = userInventory.value.items.find(invItem => invItem.item.id === itemReceived.id);

    if (existingItemInInventory && (itemReceived.type == "avatar" || itemReceived.type == "cosmetic" )) {
        // User already owns the item, grant karma points instead
        const karmaRefund = itemReceived.cost; // Amount of karma to grant (cost of the item)
        updatedUserInfo.karmaCoinsBalance += karmaRefund; // Add karma points

        // Only update user karma balance, no inventory update needed for this item
        userUpdateRes = await api_gestor.updateUserInfo(updatedUserInfo);
        // Simulate a successful inventory update since the item wasn't added
        inventoryUpdateRes = { success: true };

        // Set the granted item. The animation component will watch this prop and proceed.
        grantedItem.value = itemReceived;
        // Notification will be shown after animation complete
        // emit('show-notification', 'info', `You already own "${itemReceived.name}". You received ${karmaRefund} Karma Points instead.`);

    } else {
        // User does not own the item, add it to inventory
        userInventory.value.items.push({ item: itemReceived, quantity: 1 });

        // Deduct box cost and update inventory and user karma
        [inventoryUpdateRes, userUpdateRes] = await Promise.all([
            api_gestor.updateUserInventory(userInventory.value),
            api_gestor.updateUserInfo(updatedUserInfo)
        ]);

        // Set the granted item. The animation component will watch this prop and proceed.
        grantedItem.value = itemReceived;
        // Notification will be shown after animation complete
        // emit('show-notification', 'success', `You opened a ${box.name} and found: ${itemReceived.name}!`);
    }


    if (inventoryUpdateRes?.success && userUpdateRes?.success) {
        //emit("update-karma")
        // Do NOT hide animation or show final notification here.
        // The animation component will handle showing the result based on grantedItem.value
        // The final notification is handled in handleAnimationComplete.
        // The parent will handle updating the main userInfo prop, triggering the inventory update.

    } else {
        // Consider rolling back the changes if an update failed
        emit('show-notification', 'error', 'Failed to complete mystery box transaction.');
        console.log("Mystery box transaction failed:", inventoryUpdateRes?.errorMessage, userUpdateRes?.errorMessage);
        isAnimationVisible.value = false;

    }
}

// Helper function to select a random item from a mystery box based on probabilities
function selectRandomItemFromBox(box: MysteryBoxConfig): ShopItem | null {
    const totalProbability = box.availableItems.reduce((sum, entry) => sum + entry.probability, 0);

    // Handle case where total probability is zero or no items available
    if (totalProbability <= 0 || box.availableItems.length === 0) {
        console.warn("Mystery box has no available items or total probability is zero.");
        return null;
    }

    let randomValue = Math.random() * totalProbability;

    for (const entry of box.availableItems) {
        randomValue -= entry.probability;
        if (randomValue <= 0) {
            // The selected item is directly available in the entry object
            // We no longer need to look it up by ID
            console.log("Selected item from mystery box:", entry.item.name);
            return entry.item;
        }
    }

    // Fallback: Should ideally not be reached if totalProbability > 0
    console.error("Weighted selection did not select an item from the mystery box.");
    // As a last resort, return a random item if the loop somehow fails
    const randomIndex = Math.floor(Math.random() * box.availableItems.length);
    return box.availableItems[randomIndex]?.item || null;
}

// Handle animation completion (item revealed)
function handleAnimationComplete(item: ShopItem) {
    console.log("Mystery box animation complete. Item received:", item);
    // Now show the appropriate notification based on if it was a duplicate or new
    const existingItemInInventory = userInventory.value.items.find(invItem => invItem.item.id === item.id);

    if (existingItemInInventory && (item.type == "avatar" || item.type == "cosmetic" )) { // Need a flag to track if it was a duplicate
        const karmaRefund = item.cost; // Assuming item cost is available
        emit('show-notification', 'info', `You already own "${item.name}". You received ${karmaRefund} Karma Points instead.`);
    } else if(item && item.name != ""){
        emit('show-notification', 'success', `You opened a mystery box and found: ${item.name}!`);
    }

    // The watcher on props.userInfo in this component should handle updating
    // the local userInventory ref after the backend update in buyMysteryBox completes.
    // This will automatically disable the buy button if the item was new and single-purchase.
}

// Handle animation closed by user
function handleAnimationClosed() {
    isAnimationVisible.value = false;
    boxToAnimate.value = {
        id: "",
        name: "",
        cost: 9999999,
        rarity: ItemRarity.Unique,
        imageUrl: "",
        availableItems: []
    };
    grantedItem.value = defaultGrantedItem.value; // Clear granted item data
}

</script>

<style scoped>
.shop-display {
    padding: 20px;
    color: var(--text-color);
}

.shop-display h2 {
    margin-top: 20px;
    margin-bottom: 15px;
    color: var(--accent-color);
}

.items-carousel {
    display: flex;
    overflow-x: auto;
    /* Enable horizontal scrolling */
    gap: 20px;
    padding-bottom: 15px;
    /* Add some padding for the scrollbar */
}

.shop-item-card,
.mystery-box-card {
    flex: 0 0 auto;
    /* Prevent shrinking */
    width: 200px;
    /* Fixed width for carousel items */
    background-color: var(--background);
    border: 2px solid transparent;
    /* Base border */
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: var(--shadow);
    position: relative;
    /* Needed for absolute positioning of the button */
    padding-bottom: 50px;
    /* Add padding to make space for the button */
    transition: opacity 0.3s ease;
    /* Add transition for opacity */
}

.mystery-box-card {
    width: 250px;
    /* Slightly larger width for mystery boxes */
}


.item-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 10px;
}

.item-info {
    display: flex;
    gap: 2px;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex-grow: 1;
    /* Allow item-info to take up available space */
    margin-bottom: 10px;
    /* Add space above the button */
}


.item-info h3 {
    font-size: 1.1em;
    margin-bottom: 5px;
}

.item-info p {
    font-size: 0.9em;
    margin-bottom: 5px;
}

/* Absolute positioned Buy Button */
.buy-button {
    position: absolute;
    bottom: 10px;
    /* Adjust distance from the bottom */
    left: 50%;
    transform: translateX(-50%);
    /* Center the button horizontally */
    width: 80%;
    /* Adjust button width */
}

/* Style for disabled button */
.buy-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    /* Make it slightly transparent */
}

/* Visual indication for owned items */
.owned-item {
    opacity: 0.7;
    /* Slightly dim the card */
    /* You can add more styles, e.g., a border or an "Owned" badge */
}


/* Rarity Borders (Keeping your existing border colors) */
.rarity-mainstream {
    border-color: gray;
}

.rarity-quite-common {
    border-color: whitesmoke;
}

.rarity-uncommon {
    border-color: lightgreen;
}

.rarity-rare {
    border-color: dodgerblue;
}

.rarity-special {
    border-color: violet;
}

.rarity-legendary {
    border-color: gold;
    box-shadow: 0 0 6px 3px gold;
    background-size: 100% 100%;
    animation: chrome-effect 3s linear infinite;
}

.rarity-unique {
    border-color: #8B0000;
    box-shadow: 0 0 10px 5px #8B0000;
    background: linear-gradient(45deg, #8B0000, #C0C0C0, #8B0000);
    background-size: 200% 200%;
    animation: chrome-effect 3s linear infinite;
}

@keyframes chrome-effect {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

/* Rarity Text Colors */
.rarity-text-mainstream {
    color: gray;
}

.rarity-text-quite-common {
    color: #a4e4a4;
}

.rarity-text-uncommon {
    color: lightgreen;
}

.rarity-text-rare {
    color: dodgerblue;
}

.rarity-text-special {
    color: violet;
}

.rarity-text-legendary {
    color: gold;
}

.rarity-text-unique {
    color: #8B0000;
}

.mystery-boxes {
    display: flex;
    gap: 20px;
    margin-top: 20px;
    flex-wrap: wrap;
}
</style>