<template>
    <div class="shop-display">
        <h2>Shop Items</h2>

        <div class="items-carousel custom-scrollbar">
            <div v-for="item in shopItems" :key="item.id" :class="['shop-item-card', `rarity-${item.rarity}`]">
                <img :src="item.imageUrl || '/path/to/default-item-image.png'" :alt="item.name" class="item-image" />
                <div class="item-info">
                    <h3 :class="`rarity-text-${item.rarity}`">{{ item.name }}</h3>
                    <p>{{ item.description }}</p>
                    <p>Cost: {{ item.cost }} Karma Points</p>
                    <p :class="`rarity-text-${item.rarity}`">Rarity: {{ item.rarity }}</p>
                </div>
                <button class="baseButton buy-button" @click="buyItem(item)">Buy</button>
            </div>
        </div>

        <h2>Mystery Boxes</h2>

        <div class="mystery-boxes">
            <div v-for="box in mysteryBoxes" :key="box.id" :class="['mystery-box-card', `rarity-${box.rarity}`]">
                <img :src="getMysteryBoxImage(box.rarity)" :alt="box.name" class="item-image" />
                <div class="item-info">
                    <h3 :class="`rarity-text-${box.rarity}`">{{ box.name }}</h3>
                    <p>Cost: {{ box.cost }} Karma Points</p>
                    <p :class="`rarity-text-${box.rarity}`">Rarity: {{ box.rarity }}</p>
                </div>
                <button class="baseButton buy-button" @click="buyMysteryBox(box)">Buy Mystery Box</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue';
import { API_gestor } from '../backend-comunication/api_comunication'; // Adjust the import path if needed
import { ShopItem, MysteryBoxConfig, UserInventory, ItemRarity } from '../types/shopTypes'; // Adjust the import path if needed
import { userDBentry } from '../types/userTypes'; // Assuming userDBentry is in userTypes.ts

const api_gestor = API_gestor.getInstance();

const shopItems = ref<ShopItem[]>([]);
const mysteryBoxes = ref<MysteryBoxConfig[]>([]);
const props = defineProps<{
    userInfo: userDBentry;
}>();
const userInventory = ref<UserInventory>({ licenseKey: props.userInfo.licenseKey, items: [] })

const emit = defineEmits(['update-karma', 'show-notification']);

function getMysteryBoxImage(rarity: ItemRarity) { //to do to finish
    switch (rarity) {
        case ItemRarity.Mainstream:
            return ""
        case ItemRarity.QuiteCommon:
            return ""
        case ItemRarity.Uncommon:
            return ""
        case ItemRarity.Rare:
            return ""
        case ItemRarity.Special:
            return ""
        case ItemRarity.Legendary:
            return ""
        case ItemRarity.Unique:
            return ""
        default:
            return "" // Default image if rarity is not matched

    }
}

watch(() => props.userInfo, async (updated_info) => { // Watch for changes in props.userInfo
    console.log("new user info shop display:\n", updated_info)
    if (updated_info && updated_info.licenseKey !== "") { // Ensure licenseKey is loaded
        await updateLocalUserInventory();
        console.log("local inventory updated");
    }
}, { immediate: true }); // Immediate: true runs the watcher immediately on component mount


async function updateLocalUserInventory() {
    if (props.userInfo.licenseKey == "") {
        console.log("user info lk not loaded yet, skipping inventory update");
        return;
    }

    const userInventoryRes = await api_gestor.getUserInventory(props.userInfo.licenseKey);
    if (userInventoryRes.success) {
        userInventory.value = userInventoryRes.userInventory;
    }
    else {
        if (userInventoryRes.errorMessage.includes('No user inventory found')) {
            // If no inventory found, it means this is a new user or an issue.
            // Let's create a default empty inventory for the user if it doesn't exist.
            const newInventory: UserInventory = { licenseKey: props.userInfo.licenseKey, items: [] };
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
    if (props.userInfo.karmaCoinsBalance < item.cost) {
        emit('show-notification', 'warning', 'Not enough Karma Points to buy this item.');
        return;
    }

    await updateLocalUserInventory() //get last user inventory status (by db)

    // Check if item is already in inventory and update quantity, or add new item
    const existingItemIndex = userInventory.value.items.findIndex(invItem => invItem.itemId === item.id);

    if (existingItemIndex > -1) {
        userInventory.value.items[existingItemIndex].quantity += 1;
    } else {
        userInventory.value.items.push({ itemId: item.id, quantity: 1 });
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
        emit('update-karma', updatedUserInfo.karmaCoinsBalance);

    } else {
        // Consider rolling back the changes if one update failed
        emit('show-notification', 'error', 'Failed to purchase item.');
        console.log("Purchase failed:", inventoryUpdateRes.errorMessage, userUpdateRes.errorMessage);
    }
}

async function buyMysteryBox(box: MysteryBoxConfig) {
    if (props.userInfo.karmaCoinsBalance < box.cost) {
        emit('show-notification', 'warning', 'Not enough Karma Points to buy this mystery box.');
        return;
    }

    await updateLocalUserInventory() //get last user inventory status (by db)

    // --- Mystery Box Logic ---
    // 1. Select a random item based on probabilities
    const grantedItem = selectRandomItemFromBox(box);

    if (!grantedItem) {
        emit('show-notification', 'error', 'Could not open the mystery box.');
        return;
    }


    const existingItemIndex = userInventory.value.items.findIndex(invItem => invItem.itemId === grantedItem.id);

    if (existingItemIndex > -1) {
        userInventory.value.items[existingItemIndex].quantity += 1;
    } else {
        userInventory.value.items.push({ itemId: grantedItem.id, quantity: 1 });
    }

    // 3. Deduct karma points and update inventory
    const updatedUserInfo = { ...props.userInfo, karmaCoinsBalance: props.userInfo.karmaCoinsBalance - box.cost };

    const [inventoryUpdateRes, userUpdateRes] = await Promise.all([
        api_gestor.updateUserInventory(userInventory.value),
        api_gestor.updateUserInfo(updatedUserInfo)
    ]);


    if (inventoryUpdateRes.success && userUpdateRes.success) {
        emit('show-notification', 'success', `You opened a ${box.name} and found: ${grantedItem.name}!`);
        emit('update-karma', updatedUserInfo.karmaCoinsBalance);
    } else {
        emit('show-notification', 'error', 'Failed to open mystery box.');
        console.log("Mystery box purchase failed:", inventoryUpdateRes.errorMessage, userUpdateRes.errorMessage);
    }
}

// Helper function to select a random item from a mystery box based on probabilities
function selectRandomItemFromBox(box: MysteryBoxConfig): ShopItem | null {
    const totalProbability = box.availableItems.reduce((sum, item) => sum + item.probability, 0);
    let randomValue = Math.random() * totalProbability;

    for (const itemConfig of box.availableItems) {
        randomValue -= itemConfig.probability;
        if (randomValue <= 0) {
            // Find the actual ShopItem object for the granted item id
            // Search in both fetched shop items and mystery boxes available items
            const allPossibleItems: ShopItem[] = [
                ...shopItems.value,
                ...mysteryBoxes.value.flatMap(mb => mb.availableItems.map(ai => {
                    // Attempt to find the actual item details in shopItems first
                    const itemDetail = shopItems.value.find(item => item.id === ai.itemId);
                    if (itemDetail) return itemDetail;

                    // If not found in shopItems, return a basic item structure
                    return {
                        id: ai.itemId,
                        name: 'Unknown Item', // Placeholder name
                        description: 'Details unavailable', // Placeholder description
                        cost: 0, // Placeholder cost
                        rarity: ItemRarity.Mainstream, // Default rarity
                        type: 'utility' // Default type
                    } as ShopItem;
                }))
            ];

            const grantedItem = allPossibleItems.find(item => item.id === itemConfig.itemId);
            return grantedItem || null;
        }
    }

    return null; // Should not happen if totalProbability is > 0
}

import { doc } from "firebase/firestore"; // Import doc for fetching specific documents

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
    background-color: var(--background-dark);
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
    justify-content: center;
    flex-grow: 1;
    /* Allow item-info to take up available space */
    margin-bottom: 10px;
    /* Add space above the button */
}


.item-info h3 {
    font-size: 1.1em;
    margin-bottom: 5px;
    /* color: var(--color);  // This will be overridden by rarity classes */
}

.item-info p {
    font-size: 0.9em;
    /* color: var(--text-color); // This will be overridden by rarity classes for rarity text */
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


/* Rarity Borders (Keeping your existing border colors) */
.rarity-mainstream {
    border-color: gray;
}

.rarity-quite-common {
    border-color: whitesmoke;
}

/* Verdolina */
.rarity-uncommon {
    border-color: lightgreen;
}

/* Verde light */
.rarity-rare {
    border-color: dodgerblue;
}

/* Blu elettrico */
.rarity-special {
    border-color: violet;
}

/* Viola chiaro */
.rarity-legendary {
    border-color: gold;
}

/* Gialla acceso */
.rarity-unique {
    border-color: #8B0000;
    /* Bordeoux */
    box-shadow: 0 0 10px 5px #8B0000;
    /* Glow effect */
    background: linear-gradient(45deg, #8B0000, #C0C0C0, #8B0000);
    /* Chromed effect */
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
    /* Matching bordeoux color for unique text */
}


.mystery-boxes {
    display: flex;
    gap: 20px;
    margin-top: 20px;
    flex-wrap: wrap;
    /* Allow wrapping for multiple boxes */
}

/* Added some minor adjustments for better layout */
.shop-item-card .item-info,
.mystery-box-card .item-info {
    justify-content: flex-start;
    /* Align info to the top */
}
</style>