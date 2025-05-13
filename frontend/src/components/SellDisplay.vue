<template>
    <div class="sell-display">
        <h2>Sell Items</h2>

        <div v-if="loadingState === 'loading'" class="loading-message">
            <p>Loading Sellable Items...</p>
            <div class="spinner"></div>
        </div>

        <div v-else-if="loadingState === 'error'" class="error-message">
            <p>Error loading sellable items: {{ loadingError }}</p>
            <button class="baseButton" @click="loadSellableItemsFromStorageOrGenerate">Retry</button>
        </div>

        <div v-else-if="sellableItems.length === 0 && loadingState === 'loaded'" class="empty-sell-message">
            <p>No items available for selling today.</p>
            <p v-if="nextRefreshTime">Next refresh in: {{ timeUntilNextRefresh }}</p>
        </div>

        <div v-else class="sellable-items-container custom-scrollbar">
            <p class="refresh-info">Next items refresh in: {{ timeUntilNextRefresh }}</p>

            <div class="sell-grid">
                <div v-for="sellableItem in sellableItems" :key="sellableItem.id"
                    :class="['sell-item-card', `rarity-${sellableItem.rarity}`, { 'sold-item': sellableItem.isSold }]">
                    <img :src="sellableItem.imageUrl || '/path/to/default-item-image.png'" :alt="sellableItem.name"
                        class="item-image" />
                    <div class="item-info">
                        <h4 :class="`rarity-text-${sellableItem.rarity}`">{{ sellableItem.name }}</h4>
                        <p>{{ sellableItem.description }}</p>
                        <p>Original Cost: {{ sellableItem.cost }} Karma Points</p>
                        <p class="sell-price">Sell Price: {{ sellableItem.sellPrice }} Karma Points</p>
                    </div>
                    <button class="baseButton sell-button" @click="openSellConfirmModal(sellableItem)"
                        :disabled="sellableItem.isSold" :class="{ 'disabled-button': sellableItem.isSold }">
                        {{ sellableItem.isSold ? 'Sold' : 'Sell' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="isSellModalVisible && itemToConfirmSell" class="modal">
            <div class="modal-content" :class="`rarity-${itemToConfirmSell.rarity}`">
                <h3>Confirm Sale</h3>
                <p>Are you sure you want to sell this item?</p>
                <div class="item-to-sell-details">
                    <img :src="itemToConfirmSell.imageUrl || '/path/to/default-item-image.png'"
                        :alt="itemToConfirmSell.name" class="item-image" />
                    <div class="item-info">
                        <h4 :class="`rarity-text-${itemToConfirmSell.rarity}`">{{ itemToConfirmSell.name }}</h4>
                        <p>{{ itemToConfirmSell.description }}</p>
                        <p>Sell Price: {{ itemToConfirmSell.sellPrice }} Karma Points</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="baseButton" @click="confirmSell()">Confirm Sell for {{ itemToConfirmSell.sellPrice }}
                        Karma Points</button>
                    <button class="baseButton secondary-button" @click="cancelSell()">Cancel</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits, computed, watch, reactive } from 'vue';
import { UserInventory, ShopItem, ItemRarity } from '../types/shopTypes'; 
import { API_gestor } from '../backend-comunication/api_comunication'; 
import dayjs from 'dayjs'; 
import { userDBentry } from '../types/userTypes';

// Extend ShopItem to include sell price and status
interface SellableItem extends ShopItem {
    sellPrice: number;
    isSold: boolean;
}

const api_gestor = API_gestor.getInstance();


const props = defineProps<{
    userLicenseKey: string;
    userInfo: userDBentry
}>();

// Local State
const userInventory = ref<UserInventory>({ licenseKey: '', items: [] })
const sellableItems = ref<SellableItem[]>([]);
const loadingState = ref<'loading' | 'loaded' | 'error'>('loading');
const loadingError = ref<string | null>(null);

// Local Storage Key
const SELLABLE_ITEMS_STORAGE_KEY = `sellableItems_${props.userLicenseKey}`;
const SELLABLE_ITEMS_TIMESTAMP_KEY = `sellableItemsTimestamp_${props.userLicenseKey}`;

const isSellModalVisible = ref(false);
const itemToConfirmSell = ref<SellableItem | null>(null);

const currentTime = ref(dayjs());
// Timer to update the displayed time until next refresh
let refreshTimer: any = null;

const emit = defineEmits(['update-karma', 'show-notification']);

// --- Computed Properties ---

// Time until the next refresh of sellable items
const nextRefreshTime = computed(() => {
    const timestamp = localStorage.getItem(SELLABLE_ITEMS_TIMESTAMP_KEY);
    if (timestamp) {
        const storedTime = dayjs(timestamp);
        const refreshTime = storedTime.add(24, 'hour');
        if (refreshTime.isAfter(dayjs())) {
            return refreshTime;
        }
    }
    return null; // No valid next refresh time
});

const timeUntilNextRefresh = computed(() => {
    // This computed property now depends on both nextRefreshTime and currentTime
    if (nextRefreshTime.value) {
        // Calculate the difference using the current time ref
        const diffSeconds = nextRefreshTime.value.diff(currentTime.value, 'second');

        // Ensure the countdown doesn't show negative time
        if (diffSeconds <= 0) {
            // If the time has passed, the interval check should trigger regeneration soon.
            return 'Refreshing soon...';
        }

        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;

        // Pad single digits with a leading zero for consistent display
        const paddedMinutes = minutes.toString().padStart(2, '0');
        const paddedSeconds = seconds.toString().padStart(2, '0');

        return `${hours}h ${paddedMinutes}m ${paddedSeconds}s`;
    }
    // If nextRefreshTime is null, don't display a countdown message
    return '';
});


// --- Helper Functions ---

// Function to calculate sell price with random percentage
function calculateSellPrice(originalCost: number): number {
    const percentage = Math.random() * (0.10 - (-0.20)) + (-0.20); // Random percentage between -0.20 and +0.10
    const sellPrice = originalCost * (1 + percentage);
    return Math.max(0, Math.round(sellPrice)); // Ensure sell price is not negative and round
}

// Load sellable items from localStorage or generate new ones
async function loadSellableItemsFromStorageOrGenerate() {
    loadingState.value = 'loading';
    loadingError.value = null;
    sellableItems.value = []; 

    
    await fetchUserInventory();

    if (!userInventory.value) {
        if (!loadingError.value) {
            loadingError.value = "Could not fetch inventory";
        }
        loadingState.value = 'error';
        if (refreshTimer) clearInterval(refreshTimer);
        return;
    }

    const storedItems = localStorage.getItem(SELLABLE_ITEMS_STORAGE_KEY);
    const storedTimestamp = localStorage.getItem(SELLABLE_ITEMS_TIMESTAMP_KEY);

    if (storedItems && storedTimestamp) {
        const timestamp = dayjs(storedTimestamp);
        const now = dayjs();

        // Check if stored data is less than 24 hours old
        if (now.diff(timestamp, 'hour') < 24) {
            try {
                const parsedItems: SellableItem[] = JSON.parse(storedItems);
                const validSellableItems: SellableItem[] = [];

                for (const storedItem of parsedItems) {
                    const ownedItemInCurrentInventory = userInventory.value.items.find(owned => owned.item.id === storedItem.id);

                    if (storedItem.isSold || (ownedItemInCurrentInventory && ownedItemInCurrentInventory.quantity >= 1)) {
                        validSellableItems.push(storedItem);
                    }
                }

                sellableItems.value = validSellableItems;
                console.log("Loaded sellable items from localStorage:", sellableItems.value);
                loadingState.value = 'loaded';
                startRefreshTimer(); 
                return; 
            } catch (e) {
                console.error("Failed to parse sellable items from localStorage:", e);             
            }
        } else {
            console.log("Stored sellable items are older than 24 hours, generating new ones.");            
        }
    }

    // If no valid data in localStorage or it's expired, generate new items
    generateAndStoreSellableItems(); // This will call startRefreshTimer internally
}


// Generate a new set of sellable items and store in localStorage
function generateAndStoreSellableItems() {
    if (!userInventory.value) {
        throw new Error("Undefined user inventory when generating sellable items");
    }
    console.log("Generating new sellable items...");
    const newSellableItems: SellableItem[] = [];
    // Filter out mystery boxes and items with 0 quantity from potential sell items
    const potentialSellItems: ShopItem[] = userInventory.value.items
        .filter(owned => owned.item.type !== "mystery_box" && owned.quantity >= 1)
        .map(owned => owned.item); // Get the ShopItem object


    const selectedItemIds: string[] = []; // To ensure unique items in the sell list

    // Select up to 6 unique random items from the potential sell items pool
    while (newSellableItems.length < 6 && potentialSellItems.length > selectedItemIds.length) {
        const availablePotentialItems = potentialSellItems.filter(item => !selectedItemIds.includes(item.id));
        if (availablePotentialItems.length === 0) break; // No more unique items to select

        const randomIndex = Math.floor(Math.random() * availablePotentialItems.length);
        const selectedShopItem = availablePotentialItems[randomIndex];


        if (selectedShopItem) {
            const sellPrice = calculateSellPrice(selectedShopItem.cost);
            newSellableItems.push({
                ...selectedShopItem,
                sellPrice: sellPrice,
                isSold: false
            });
            selectedItemIds.push(selectedShopItem.id);
        }
    }

    sellableItems.value = newSellableItems;
    localStorage.setItem(SELLABLE_ITEMS_STORAGE_KEY, JSON.stringify(newSellableItems));
    localStorage.setItem(SELLABLE_ITEMS_TIMESTAMP_KEY, dayjs().toISOString()); // Store current time
    loadingState.value = 'loaded';
    console.log("Generated and stored new sellable items:", sellableItems.value);

    // Start a timer to update the time until next refresh displayed in the UI
    startRefreshTimer();
}


function startRefreshTimer() {
    // Clear any existing timer to prevent multiple timers running
    if (refreshTimer) clearInterval(refreshTimer);

    // Get the calculated next refresh time
    const nextTime = nextRefreshTime.value;

    // Only start timer if there is a valid future refresh time
    if (nextTime && nextTime.isAfter(dayjs())) {
        refreshTimer = setInterval(() => {
            // Update the reactive current time every second.
            // This update is what triggers the computed property timeUntilNextRefresh to re-calculate.
            currentTime.value = dayjs();

            // Check if the current time has passed the next refresh time to trigger regeneration
            if (dayjs().isAfter(nextTime)) {
                console.log("24 hours passed, refreshing sellable items...");
                clearInterval(refreshTimer); // Stop the timer
                loadSellableItemsFromStorageOrGenerate(); // Regenerate items
            }
        }, 1000); // Update every second
    } else {
        // If there's no valid next refresh time or it's already passed,
        // ensure the timer is stopped and immediately try to generate new items
        // if we are in the loaded state (i.e., not already loading or error).
        if (refreshTimer) clearInterval(refreshTimer);
        if (loadingState.value === 'loaded') {
            console.log("No valid future refresh time found or time has passed. Regenerating items.");
            // Use a tiny timeout to avoid potential race conditions on mount if inventory isn't fully ready
            setTimeout(() => {
                generateAndStoreSellableItems();
            }, 50);
        }
    }
}



// Fetch user inventory (needed for both initial load and sell action)
async function fetchUserInventory() {
    // Only fetch if license key is available
    if (props.userLicenseKey === "") {
        console.warn("License key is empty, cannot fetch inventory.");
        loadingError.value = "User not logged in or license key missing.";
        return false; // Indicate fetch failed
    }

    try {
        const userInventoryRes = await api_gestor.getUserInventory(props.userLicenseKey);
        if (userInventoryRes.success) {
            userInventory.value = userInventoryRes.userInventory;
            return true; // Indicate fetch successful
        } else {
            loadingError.value = `Failed to fetch user inventory: ${userInventoryRes.errorMessage}`;
            emit("show-notification", "error", loadingError.value);
            console.error(loadingError.value);
            return false; // Indicate fetch failed
        }
    } catch (error: any) {
        loadingError.value = `An unexpected error occurred while fetching inventory: ${error.message}`;
        emit("show-notification", "error", loadingError.value);
        console.error(loadingError.value);
        return false; // Indicate fetch failed
    }
}


// Handle selling an item
async function handleSellItem(itemToSell: SellableItem) {
    if (itemToSell.isSold) {
        console.warn("Item already sold:", itemToSell.name);
        emit('show-notification', 'info', 'This item has already been sold today.');
        return;
    }

    // --- Backend Transaction: Deduct item from inventory and add karma ---
    loadingState.value = 'loading'; // Show loading indicator during transaction

    try {
        // Find the item in the user's current inventory state
        const inventoryItemIndex = userInventory.value?.items.findIndex(owned => owned.item.id === itemToSell.id);

        if (inventoryItemIndex === undefined || inventoryItemIndex === -1 || userInventory.value!.items[inventoryItemIndex].quantity < 1) {
            // This scenario should ideally not happen if UI is updated correctly
            // but it's a safety check.
            emit('show-notification', 'error', 'Item not found in inventory');
            loadingState.value = 'loaded'; // Reset loading state
            await loadSellableItemsFromStorageOrGenerate(); // Reload just in case
            return;
        }

        // Create updated inventory data (reduce quantity)
        const updatedInventory = { ...userInventory.value! };
        updatedInventory.items[inventoryItemIndex] = {
            ...updatedInventory.items[inventoryItemIndex],
            quantity: updatedInventory.items[inventoryItemIndex].quantity - 1
        };

        // Remove item from inventory if quantity becomes 0
        if (updatedInventory.items[inventoryItemIndex].quantity === 0) {
            updatedInventory.items.splice(inventoryItemIndex, 1);
        }

        // 1. Update inventory
        const inventoryUpdateRes = await api_gestor.updateUserInventory(updatedInventory);

        // 2. Update karma balance (assuming you have the current user balance)
        props.userInfo.karmaCoinsBalance += itemToSell.sellPrice;
        const userUpdateRes = await api_gestor.updateUserInfo(props.userInfo);


        if (inventoryUpdateRes.success) {

            if (userUpdateRes.success) {
                emit("update-karma")
            } else {
                const updateErrLog = "Error updating karma balance : " + userUpdateRes.errorMessage
                throw new Error(updateErrLog)
            }

            // Update local state: mark the item as sold in the sellableItems list
            const sellableItemIndex = sellableItems.value.findIndex(i => i.id === itemToSell.id);
            if (sellableItemIndex !== -1) {
                sellableItems.value[sellableItemIndex].isSold = true;
                // Update localStorage to reflect the sold status
                localStorage.setItem(SELLABLE_ITEMS_STORAGE_KEY, JSON.stringify(sellableItems.value));
            }

            emit('show-notification', 'success', `Successfully sold "${itemToSell.name}" for ${itemToSell.sellPrice} Karma Points!`);

            // Update local userInventory ref to reflect the item removal (for immediate UI update)
            userInventory.value = updatedInventory;


        } else {
            emit('show-notification', 'error', `Failed to sell item: ${inventoryUpdateRes.errorMessage}`);
            console.error("Sell failed:", inventoryUpdateRes.errorMessage);
        }

    } catch (error: any) {
        emit('show-notification', 'error', `An unexpected error occurred during sell: ${error.message}`);
        console.error("Sell failed:", error);
    } finally {
        loadingState.value = 'loaded'; // Reset loading state
    }
}

// --- Modal Actions ---
function openSellConfirmModal(item: SellableItem) {
    if (item.isSold) {
        emit('show-notification', 'info', 'This item has already been sold today.');
        return;
    }
    itemToConfirmSell.value = item;
    isSellModalVisible.value = true;
}

function cancelSell() {
    isSellModalVisible.value = false;
    itemToConfirmSell.value = null;
}

async function confirmSell() {
    if (!itemToConfirmSell.value) return;

    const itemToSell = itemToConfirmSell.value;
    cancelSell(); // Close modal immediately after confirming

    // Ensure the item is not already marked as sold in the current sellableItems list state
    const currentSellableItemState = sellableItems.value.find(i => i.id === itemToSell.id);
    if (currentSellableItemState?.isSold) {
        emit('show-notification', 'info', 'This item has already been sold today.');
        return; // Prevent selling if already marked as sold locally
    }

    // --- Backend Transaction: Deduct item from inventory and add karma ---
    loadingState.value = 'loading'; // Show loading indicator during transaction

    try {
        // Fetch the latest inventory state before performing the transaction
        await fetchUserInventory();
        if (!userInventory.value) {
            throw new Error("Could not fetch latest inventory before selling.");
        }

        // Find the item in the user's current inventory state
        const inventoryItemIndex = userInventory.value.items.findIndex(owned => owned.item.id === itemToSell.id);

        if (inventoryItemIndex === -1 || userInventory.value.items[inventoryItemIndex].quantity < 1) {
            // This means the item was likely sold or used elsewhere since the sell list was generated
            emit('show-notification', 'error', `Item "${itemToSell.name}" not found in inventory or insufficient quantity.`);
            // Regenerate the sellable items list as the inventory state is different
            // Use a timeout to allow notification to show before potentially regenerating
            setTimeout(async () => {
                 await loadSellableItemsFromStorageOrGenerate();
                  loadingState.value = 'loaded'; // Ensure state is reset after regeneration
             }, 50); // Short delay
            return;
        }

        // Create updated inventory data (reduce quantity)
        const updatedInventory = { ...userInventory.value! };
        updatedInventory.items[inventoryItemIndex] = {
            ...updatedInventory.items[inventoryItemIndex],
            quantity: updatedInventory.items[inventoryItemIndex].quantity - 1
        };

        // Remove item from inventory if quantity becomes 0
        if (updatedInventory.items[inventoryItemIndex].quantity === 0) {
            updatedInventory.items.splice(inventoryItemIndex, 1);
        }

        // Update inventory and karma balance
        const inventoryUpdateRes = await api_gestor.updateUserInventory(updatedInventory);

        // Update user karma balance using the userInfo prop
        const updatedUserInfo = { ...props.userInfo, karmaCoinsBalance: props.userInfo.karmaCoinsBalance + itemToSell.sellPrice };
        const userUpdateRes = await api_gestor.updateUserInfo(updatedUserInfo);


        if (inventoryUpdateRes.success) {

            if (userUpdateRes.success) {
                // Only mark as sold and notify if both updates succeed
                // Update local state: mark the item as sold in the sellableItems list
                const sellableItemIndex = sellableItems.value.findIndex(i => i.id === itemToSell.id);
                if (sellableItemIndex !== -1) {
                    const updatedSellableItems = [...sellableItems.value]; // Create a copy
                    updatedSellableItems[sellableItemIndex] = { ...updatedSellableItems[sellableItemIndex], isSold: true }; // Update the item in the copy
                    sellableItems.value = updatedSellableItems; // Replace the reactive array

                    // Update localStorage to reflect the sold status
                    localStorage.setItem(SELLABLE_ITEMS_STORAGE_KEY, JSON.stringify(sellableItems.value));
                }

                emit('show-notification', 'success', `Successfully sold "${itemToSell.name}" for ${itemToSell.sellPrice} Karma Points!`);

                // Emit event to parent to update karma balance and potentially refetch inventory
                emit('update-karma', itemToSell.sellPrice); // Pass the amount of karma gained

                // Update local userInventory ref to reflect the item removal (for immediate UI update)
                userInventory.value = updatedInventory;

            } else {
                const updateErrLog = "Error updating karma balance : " + userUpdateRes.errorMessage;
                // If karma update failed, attempt to roll back inventory? Or just log error.
                // For now, just log and notify.
                emit('show-notification', 'error', updateErrLog);
                console.error(updateErrLog);
            }


        } else {
            emit('show-notification', 'error', `Failed to update inventory after sell: ${inventoryUpdateRes.errorMessage}`);
            console.error("Inventory update failed after sell:", inventoryUpdateRes.errorMessage);
            // If inventory update failed, the item wasn't removed.
            // The sellable item might still appear unsold or cause issues.
            // Consider regenerating sellable items or showing a specific error.
        }

    } catch (error: any) {
        emit('show-notification', 'error', `An unexpected error occurred during sell transaction: ${error.message}`);
        console.error("Sell transaction failed:", error);
    } finally {
        loadingState.value = 'loaded'; // Reset loading state
    }
}

// --- Mounted Hook ---

onMounted(async () => {
    await loadSellableItemsFromStorageOrGenerate();

    // Cleanup timer on component unmount
    return () => {
        if (refreshTimer) clearInterval(refreshTimer);
    };
});

// --- Cleanup on component unmount ---
// Done in the onMounted return callback

</script>


<style scoped>
.sell-display {
    padding: 20px;
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    /* Fill parent height */
    box-sizing: border-box;
    width: 73%;
    /* Adjust width as needed for your layout */
    margin: 0 auto;
    /* Center the sell display */
}

.sell-display h2 {
    margin-bottom: 20px;
    color: var(--accent-color);
}

/* Loading, Error, and Empty Messages */
.loading-message,
.error-message,
.empty-sell-message {
    text-align: center;
    margin-top: 50px;
    font-size: 1.1em;
    color: var(--text-color);
}

.loading-message .spinner {
    /* ... spinner styles from before ... */
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--accent-color);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 15px auto;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}


.sellable-items-container {
    flex-grow: 1;
    /* Allow container to take up available vertical space */
    width: 95%;
    /* Adjust width as needed */
    overflow-y: auto;
    /* Enable vertical scrolling */
    padding-right: 10px;
    /* Space for scrollbar */
    /* Add custom scrollbar styling if using custom-scrollbar class */
}

.refresh-info {
    text-align: center;
    margin-bottom: 20px;
    font-size: 0.9em;
    color: var(--text-color-light);
}


.sell-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    /* Responsive grid */
    gap: 20px;
    /* Space between items */
    padding-bottom: 20px;
    /* Space at the bottom of the grid */
}

.sell-item-card {
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
    /* For button positioning */
    padding-bottom: 60px;
    /* Space for the button */
    transition: opacity 0.3s ease;
    /* Smooth transition for sold items */
}

.sell-item-card.sold-item {
    opacity: 0.6;
    /* Dim sold items */
    filter: grayscale(50%);
    /* Optional: make sold items look less vibrant */
}


.item-image {
    width: 70px;
    /* Slightly smaller image than shop */
    height: 70px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 10px;
}

.item-info {
    margin-top: 2%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex-grow: 1;
    /* Allow item-info to take up available space */
    margin-bottom: 15px;
    /* Space above the button */
    gap: 2px;
}

.item-info h4 {
    font-size: 1em;
    /* Smaller title */
    margin-bottom: 5px;
}

.item-info p {
    font-size: 0.8em;
    /* Smaller text */
    color: var(--text-color);
    margin-bottom: 5px;
}

.item-info .sell-price {
    font-size: 0.9em;
    font-weight: bold;
    color: var(--accent-color);
    /* Highlight sell price */
    margin-top: 5px;
}

/* Action Buttons (Sell) */
.baseButton.sell-button {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    /* Button width */
    font-size: 0.9em;
    /* Smaller button text */
    padding: 8px 12px;
}

.baseButton.sell-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}


/* Rarity Borders (matching ShopDisplay.vue) */
.rarity-mainstream {
    border-color: gray;
}

.rarity-quite-common {
    border-color: #a4e4a4;
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
}

.rarity-unique {
    border-color: #8B0000;
    box-shadow: 0 0 10px 5px #8B0000;
}

/* Rarity Text Colors (matching ShopDisplay.vue) */
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


/* Custom Scrollbar (if using the custom-scrollbar class) */
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    /* Vertical scrollbar width */
    height: 8px;
    /* Horizontal scrollbar height (not used here, but good to have) */
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    /* Track color */
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--accent-color);
    /* Thumb color */
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--accent-color-dark);
    /* Darker thumb on hover */
}

.modal-content {
    background-color: var(--container-background-color);
    /* Use theme background */
    padding: 30px;
    border-radius: 8px;
    text-align: center;
    color: var(--text-color);
    /* Use theme text color */
    box-shadow: var(--shadow);
    /* Use theme shadow */
    max-width: 400px;
    /* Limit modal width */
    width: 90%;
    border: 2px solid transparent;
    /* Base border, rarity will override */
}

/* Rarity borders for the modal content, matching item cards */
.modal-content.rarity-mainstream {
    border-color: gray;
}

.modal-content.rarity-quite-common {
    border-color: #a4e4a4;
}

.modal-content.rarity-uncommon {
    border-color: lightgreen;
}

.modal-content.rarity-rare {
    border-color: dodgerblue;
}

.modal-content.rarity-special {
    border-color: violet;
}

.modal-content.rarity-legendary {
    border-color: gold;
    box-shadow: 0 0 6px 3px gold;
}

.modal-content.rarity-unique {
    border-color: #8B0000;
    box-shadow: 0 0 10px 5px #8B0000;
}


.modal-content h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--accent-color);
    /* Use accent color for modal title */
}

.item-to-sell-details {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    text-align: left;
}

.item-to-sell-details .item-image {
    width: 60px;
    /* Smaller image in modal */
    height: 60px;
    flex-shrink: 0;
    /* Prevent image from shrinking */
    margin-bottom: 0;
    /* Remove bottom margin */
}

.item-to-sell-details .item-info {
    flex-grow: 1;
    margin-bottom: 0;
    align-items: flex-start;
    /* Align text to the left */
}

.item-to-sell-details h4 {
    margin-top: 0;
    margin-bottom: 4px;
}

.item-to-sell-details p {
    margin-bottom: 4px;
    font-size: 0.9em;
}

.modal-actions {
    flex-direction: column;
    display: flex;
    justify-content: center;
    /* Center buttons */
    gap: 10px;
    /* Space between buttons */
    margin-top: 20px;
}

.modal-actions .baseButton {
    width: auto;
    /* Allow buttons to size based on content */
    padding: 10px 20px;
}

.modal-actions .secondary-button {
    background-color: transparent;
    border-color: var(--text-color);
    /* Secondary button border */
    color: var(--text-color);
}

.modal-actions .secondary-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    /* Subtle hover for secondary */
    border-color: var(--text-color-light);
}


/* Custom Scrollbar from style.css - ensure it's applied to the scrolling container */
/* .custom-scrollbar styles are already present in style.css */
</style>