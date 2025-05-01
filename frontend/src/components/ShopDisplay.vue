<template>
    <div class="shop-display">
        <h2>Shop Items</h2>

        <div class="items-carousel custom-scrollbar">
            <div v-for="item in shopItems" :key="item.id" :class="['shop-item-card', `rarity-${item.rarity}`, { 'owned-item': isItemOwned(item.id) }]">
                <img :src="item.imageUrl || '/path/to/default-item-image.png'" :alt="item.name" class="item-image" />
                <div class="item-info">
                    <h3 :class="`rarity-text-${item.rarity}`">{{ item.name }}</h3>
                    <p>{{ item.description }}</p>
                    <p>Cost: {{ item.cost }} Karma Points</p>
                    <p :class="`rarity-text-${item.rarity}`">Rarity: {{ item.rarity }}</p>
                </div>
                 <button
                    class="baseButton buy-button"
                    @click="buyItem(item)"
                    :disabled="isItemOwned(item.id)"
                    :class="{ 'disabled-button': isItemOwned(item.id) }"
                >
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
const userInventory = ref<UserInventory>({ licenseKey: '', items: [] }) // Initialize with empty licenseKey


const emit = defineEmits(['update-karma', 'show-notification']);

// Helper function to check if an item is in the user's inventory
function isItemOwned(itemId: string): boolean {
    return userInventory.value.items.some(item => item.itemId === itemId);
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
        emit("update-karma")
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

    let inventoryUpdateRes: { success: boolean; errorMessage?: string } | null = null;
    let userUpdateRes: { success: boolean; errorMessage?: string } | null = null;
    let updatedUserInfo = { ...props.userInfo, karmaCoinsBalance: props.userInfo.karmaCoinsBalance - box.cost }; // Deduct box cost first

    // Check if the granted item is already in the user's inventory
    const existingItemInInventory = userInventory.value.items.find(invItem => invItem.itemId === grantedItem.id);

    if (existingItemInInventory) {
        // User already owns the item, grant karma points instead
        const karmaRefund = grantedItem.cost; // Amount of karma to grant (cost of the item)
        updatedUserInfo.karmaCoinsBalance += karmaRefund; // Add karma points

         emit('show-notification', 'info', `You already own "${grantedItem.name}". You received ${karmaRefund} Karma Points instead.`);

         // Only update user karma balance, no inventory update needed for this item
         userUpdateRes = await api_gestor.updateUserInfo(updatedUserInfo);
         // Simulate a successful inventory update since the item wasn't added
         inventoryUpdateRes = { success: true };

    } else {
        // User does not own the item, add it to inventory
        userInventory.value.items.push({ itemId: grantedItem.id, quantity: 1 });

        // Deduct box cost and update inventory and user karma
        [inventoryUpdateRes, userUpdateRes] = await Promise.all([
            api_gestor.updateUserInventory(userInventory.value),
            api_gestor.updateUserInfo(updatedUserInfo)
        ]);

         emit('show-notification', 'success', `You opened a ${box.name} and found: ${grantedItem.name}!`);
    }


    if (inventoryUpdateRes?.success && userUpdateRes?.success) {
        emit("update-karma")
    } else {
        // Consider rolling back the changes if an update failed
        emit('show-notification', 'error', 'Failed to complete mystery box transaction.');
        console.log("Mystery box transaction failed:", inventoryUpdateRes?.errorMessage, userUpdateRes?.errorMessage);
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
            // Search in all available shop items (assuming generateMysteryBoxes populates allAvailableShopItems)
            // Access the global allAvailableShopItems directly if available in this scope
            // If not, you might need to fetch all items or pass them down.
            // For this context, let's assume allAvailableShopItems is accessible or can be fetched.
             // *** IMPORTANT: This implementation requires `allAvailableShopItems` to be available here.
             // If `allAvailableShopItems` is only defined in your backend function,
             // you will need a way to fetch the full list of items in your frontend or pass it down.
             // A better approach might be for the backend to return the granted item's details
             // as part of the mystery box opening API call. ***

             // Placeholder lookup (assuming you have a way to get the item details by ID)
            const grantedItem = shopItems.value.find(item => item.id === itemConfig.itemId) // Check items currently in the shop display
                 // Fallback: You would ideally have a comprehensive list of all items here or a backend lookup
                 // For demonstration, let's assume all shop items are accessible
                 // const allItemsPool: ShopItem[] = /* get all possible items */;
                 // const grantedItem = allItemsPool.find(item => item.id === itemConfig.itemId);


            if (!grantedItem) {
                 console.error("Granted item details not found for ID:", itemConfig.itemId);
                 // You might want to search in the mysteryBoxes availableItems list itself as a last resort,
                 // although that only has ID and probability, not full item details.
                 // For a proper solution, ensure you can get full item details.
                 return null;
            }
            return grantedItem;
        }
    }

    return null; // Should not happen if totalProbability is > 0
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
    transition: opacity 0.3s ease; /* Add transition for opacity */
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

/* Style for disabled button */
.buy-button:disabled {
    cursor: not-allowed;
    opacity: 0.6; /* Make it slightly transparent */
}

/* Visual indication for owned items */
.owned-item {
    opacity: 0.7; /* Slightly dim the card */
     /* You can add more styles, e.g., a border or an "Owned" badge */
}


/* Rarity Borders (Keeping your existing border colors) */
.rarity-mainstream { border-color: gray; }
.rarity-quite-common { border-color: whitesmoke; }
.rarity-uncommon { border-color: lightgreen; }
.rarity-rare { border-color: dodgerblue; }
.rarity-special { border-color: violet; }
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
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* Rarity Text Colors */
.rarity-text-mainstream { color: gray; }
.rarity-text-quite-common { color: #a4e4a4; }
.rarity-text-uncommon { color: lightgreen; }
.rarity-text-rare { color: dodgerblue; }
.rarity-text-special { color: violet; }
.rarity-text-legendary { color: gold; }
.rarity-text-unique { color: #8B0000; }

.mystery-boxes {
    display: flex;
    gap: 20px;
    margin-top: 20px;
    flex-wrap: wrap;
}
</style>