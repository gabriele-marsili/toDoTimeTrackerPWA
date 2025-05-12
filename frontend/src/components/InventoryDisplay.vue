<template>
    <div class="inventory-display">
        <h2>Your Inventory</h2>

        <div v-if="loadingInventory" class="loading-message">
            <p>Loading Inventory...</p>
            <div class="spinner"></div>
        </div>

        <div v-else-if="loadingError" class="error-message">
            <p>Error loading inventory: {{ loadingError }}</p>
        </div>

        <div v-else class="inventory-categories-container custom-scrollbar">
            <div v-if="categorizedInventory.avatar.length > 0" class="inventory-category">
                <h3>Avatars</h3>
                <div class="inventory-grid">
                    <div v-for="inventoryItem in categorizedInventory.avatar" :key="inventoryItem.item.id"
                        :class="['inventory-item-card', `rarity-${inventoryItem.item.rarity}`]">
                        <img :src="inventoryItem.item.imageUrl || '/path/to/default-avatar-image.png'"
                            :alt="inventoryItem.item.name" class="item-image" />
                        <div class="item-info">
                            <h4 :class="`rarity-text-${inventoryItem.item.rarity}`">{{ inventoryItem.item.name }}</h4>
                            <p>{{ inventoryItem.item.description }}</p>
                            <p v-if="inventoryItem.quantity > 1">Quantity: {{ inventoryItem.quantity }}</p>
                        </div>
                        <button class="baseButton apply-button" @click="setAvatar(inventoryItem.item)">Apply</button>
                    </div>
                </div>
            </div>

            <div v-if="categorizedInventory.cosmetic.length > 0" class="inventory-category">
                <h3>Cosmetics</h3>
                <div class="inventory-grid">
                    <div v-for="inventoryItem in categorizedInventory.cosmetic" :key="inventoryItem.item.id"
                        :class="['inventory-item-card', `rarity-${inventoryItem.item.rarity}`]">
                        <img :src="inventoryItem.item.imageUrl || '/path/to/default-cosmetic-image.png'"
                            :alt="inventoryItem.item.name" class="item-image" />
                        <div class="item-info">
                            <h4 :class="`rarity-text-${inventoryItem.item.rarity}`">{{ inventoryItem.item.name }}</h4>
                            <p>{{ inventoryItem.item.description }}</p>
                            <p v-if="inventoryItem.quantity > 1">Quantity: {{ inventoryItem.quantity }}</p>
                        </div>
                        <button class="baseButton apply-button"
                            @click="applyCosmetic(inventoryItem.item)">Apply</button>
                    </div>
                </div>
            </div>

            <div v-if="categorizedInventory.utility.length > 0" class="inventory-category">
                <h3>Utility Items</h3>
                <div class="inventory-grid">
                    <div v-for="inventoryItem in categorizedInventory.utility" :key="inventoryItem.item.id"
                        :class="['inventory-item-card', `rarity-${inventoryItem.item.rarity}`]">
                        <img :src="inventoryItem.item.imageUrl || '/path/to/default-utility-image.png'"
                            :alt="inventoryItem.item.name" class="item-image" />
                        <div class="item-info">
                            <h4 :class="`rarity-text-${inventoryItem.item.rarity}`">{{ inventoryItem.item.name }}</h4>
                            <p>{{ inventoryItem.item.description }}</p>
                            <p v-if="inventoryItem.quantity > 0">Quantity: {{ inventoryItem.quantity }}</p>
                        </div>
                        <button v-if="inventoryItem.quantity > 0" class="baseButton use-button"
                            @click="emitUseItem(inventoryItem.item)">Use ({{ inventoryItem.quantity }})</button>
                        <p v-else>Used Up</p>
                    </div>
                </div>
            </div>

            <div v-if="categorizedInventory.gift.length > 0" class="inventory-category">
                <h3>Gift Items</h3>
                <div class="inventory-grid">
                    <div v-for="inventoryItem in categorizedInventory.gift" :key="inventoryItem.item.id"
                        :class="['inventory-item-card', `rarity-${inventoryItem.item.rarity}`]">
                        <img :src="inventoryItem.item.imageUrl || '/path/to/default-gift-image.png'"
                            :alt="inventoryItem.item.name" class="item-image" />
                        <div class="item-info">
                            <h4 :class="`rarity-text-${inventoryItem.item.rarity}`">{{ inventoryItem.item.name }}</h4>
                            <p>{{ inventoryItem.item.description }}</p>
                            <p v-if="inventoryItem.quantity > 0">Quantity: {{ inventoryItem.quantity }}</p>
                        </div>
                        <button v-if="inventoryItem.quantity > 0" class="baseButton use-button"
                            @click="emitUseItem(inventoryItem.item)">Gift ({{ inventoryItem.quantity }})</button>
                        <p v-else>Used Up</p>
                    </div>
                </div>
            </div>

            <div v-if="categorizedInventory.reminder.length > 0" class="inventory-category">
                <h3>Reminder Items</h3>
                <div class="inventory-grid">
                    <div v-for="inventoryItem in categorizedInventory.reminder" :key="inventoryItem.item.id"
                        :class="['inventory-item-card', `rarity-${inventoryItem.item.rarity}`]">
                        <img :src="inventoryItem.item.imageUrl || '/path/to/default-reminder-image.png'"
                            :alt="inventoryItem.item.name" class="item-image" />
                        <div class="item-info">
                            <h4 :class="`rarity-text-${inventoryItem.item.rarity}`">{{ inventoryItem.item.name }}</h4>
                            <p>{{ inventoryItem.item.description }}</p>
                            <p v-if="inventoryItem.quantity > 0">Quantity: {{ inventoryItem.quantity }}</p>
                        </div>
                        <button v-if="inventoryItem.quantity > 0" class="baseButton use-button"
                            @click="emitUseItem(inventoryItem.item)">Use ({{ inventoryItem.quantity }})</button>
                        <p v-else>Used Up</p>
                    </div>
                </div>
            </div>

            <div v-if="!hasInventoryItems && !loadingInventory && !loadingError" class="empty-inventory-message">
                <p>Your inventory is empty. Visit the shop to acquire items!</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, computed, watch } from 'vue';
import { UserInventory, ShopItem, ItemRarity } from '../types/shopTypes'; // Adjust path
import { API_gestor } from '../backend-comunication/api_comunication'; // Adjust the import path if needed

const api_gestor = API_gestor.getInstance();

// Local state for user inventory and loading
const userInventory = ref<UserInventory | null>(null); // Allow null for initial loading state
const loadingInventory = ref(true);
const loadingError = ref<string | null>(null);

const emit = defineEmits(['apply-item', 'use-item', "show-notification","update-user"]);

// Props - Now only receiving licenseKey and allItems
const props = defineProps<{
    userLicenseKey: string;
    userInventoryNeedUpdate: boolean
}>();

// Helper rarity order for sorting
const rarityOrder = [
    ItemRarity.Mainstream,
    ItemRarity.QuiteCommon,
    ItemRarity.Uncommon,
    ItemRarity.Rare,
    ItemRarity.Special,
    ItemRarity.Legendary,
    ItemRarity.Unique,
];

// Function to fetch and update local user inventory
async function updateLocalUserInventory() {
    loadingInventory.value = true;
    loadingError.value = null;
    userInventory.value = null; // Reset inventory while loading

    if (props.userLicenseKey === "") {
        console.warn("License key is empty, cannot fetch inventory.");
        loadingInventory.value = false;
        // You might want to show a message or handle this state in the UI
        // loadingError.value = "User not logged in or license key missing.";
        return;
    }

    try {
        const userInventoryRes = await api_gestor.getUserInventory(props.userLicenseKey);
        if (userInventoryRes.success) {
            userInventory.value = userInventoryRes.userInventory;
            console.log("User inventory loaded:", userInventory.value);
        } else {
            if (userInventoryRes.errorMessage.includes('No user inventory found')) {
                // If no inventory found, it means this is a new user or an issue.
                // Let's create a default empty inventory for the user if it doesn't exist.
                const newInventory: UserInventory = { licenseKey: props.userLicenseKey, items: [] };
                const r = await api_gestor.updateUserInventory(newInventory);
                if (r.success) {
                    userInventory.value = newInventory; // Update local state as well
                    emit("show-notification", "info", "User inventory created");
                    console.log("User inventory created:", userInventory.value);
                } else {
                    loadingError.value = `Failed to create user inventory: ${r.errorMessage}`;
                    emit("show-notification", "error", loadingError.value);
                    console.error(loadingError.value);
                }
            } else {
                loadingError.value = `Failed to load user inventory: ${userInventoryRes.errorMessage}`;
                emit("show-notification", "error", loadingError.value);
                console.error(loadingError.value);
            }
        }
    } catch (error: any) {
        loadingError.value = `An unexpected error occurred while fetching inventory: ${error.message}`;
        emit("show-notification", "error", loadingError.value);
        console.error(loadingError.value);
    } finally {
        loadingInventory.value = false;
    }
}


// Categorize inventory items by type - Now a computed property reacting to userInventory and allItems
const categorizedInventory = computed(() => {
    const categories: Record<string, { item: ShopItem; quantity: number }[]> = {
        cosmetic: [],
        utility: [],
        // mystery_box: [], // Mystery boxes are not kept in inventory
        gift: [],
        reminder: [],
        avatar: [],
    };

    // Ensure both userInventory and allItems are available before processing
    if (!userInventory.value) {
        return categories; // Return empty categories if data is not ready
    }


    userInventory.value.items.forEach(ownedItem => {
        // Find the full item details from the allItems prop
        const itemDetails = ownedItem.item

        // Only include items that exist in the allItems pool and are not mystery boxes
        if (itemDetails && itemDetails.type !== 'mystery_box') {
            // Assuming itemDetails.type corresponds to the category keys
            if (categories[itemDetails.type]) {
                categories[itemDetails.type].push({
                    item: itemDetails,
                    quantity: ownedItem.quantity
                });
            } else {
                // Handle unexpected item types if necessary
                console.warn(`Item with ID ${itemDetails.id} has unexpected type: ${itemDetails.type}`);
            }
        } else if (!itemDetails) {
            console.warn(`Owned item with ID ${ownedItem.item.id} not found in allItems pool.`);
        }
    });

    //Sort items within each category by rarity
    for (const category in categories) {
        // Only sort if the category has items
        if (categories[category].length > 0) {
            categories[category].sort((a, b) => {
                // Check if rarity exists before comparing
                const rarityAIndex = rarityOrder.indexOf(a.item.rarity);
                const rarityBIndex = rarityOrder.indexOf(b.item.rarity);

                // Handle cases where rarity might not be in rarityOrder (shouldn't happen if ItemRarity is strict)
                if (rarityAIndex === -1 || rarityBIndex === -1) {
                    console.warn(`Item with unexpected rarity found: ${a.item.id} or ${b.item.id}`);
                    return 0; // Don't sort if rarity is unknown
                }

                return rarityAIndex - rarityBIndex;
            });
        }
    }


    return categories;
});

// Check if there are any items in the categorized inventory to display
const hasInventoryItems = computed(() => {
    // Check categorizedInventory.value after it has been computed
    return Object.values(categorizedInventory.value).some(categoryItems => categoryItems.length > 0);
});


// Emit events for parent component
const applyCosmetic = async (item: ShopItem) => {
    if(item.type == "cosmetic"){
        try {            
            const res = await api_gestor.setAvatarFrame(item.id, props.userLicenseKey)
            if(!res.success)throw new Error(res.errorMessage);
            emit("show-notification","success",`Item ${item.name} applied successfully`)
        } catch (error:any) {
            emit("show-notification","error",error.message);
        }
    }else{
        emit("show-notification","error",`Item ${item.name} is not a cosmetic`);
    }
};

const emitUseItem = (item: ShopItem) => {
    emit('use-item', item);
};

async function setAvatar(item: ShopItem) {
    if (item.type != "avatar") {
        emit("show-notification", "error", "Choose an avatar item to update avatar image")
        return;
    }
    if (!item.imageUrl) {
        emit("show-notification", "error", "Choose an avatar with and image url to update avatar image")
        return;
    }
    const updateRes = await api_gestor.setAvatarImage(item.imageUrl, props.userLicenseKey)
    if (!updateRes.success) {
        emit("show-notification", "error", updateRes.errorMessage)
        return;
    }
    emit("show-notification", "success", `Set Avatar Image : ${item.name}`)
    emit("update-user")


}

// Watch the userLicenseKey prop to load inventory when it becomes available or changes
watch(() => props.userLicenseKey, async (newLicenseKey, oldLicenseKey) => {
    if (newLicenseKey !== oldLicenseKey && newLicenseKey !== "") {
        console.log("License key changed, fetching inventory...");
        await updateLocalUserInventory();
    } else if (newLicenseKey === "" && userInventory.value !== null) {
        // Clear inventory if license key becomes empty (e.g., user logs out)
        console.log("License key became empty, clearing inventory...");
        userInventory.value = null;
        loadingInventory.value = false; // Stop loading state
        loadingError.value = null;
    }
}, { immediate: true }); // Fetch inventory immediately if license key is available on mount

watch(() => props.userInventoryNeedUpdate, async (newUserInventoryNeedUpdate, oldUserInventoryNeedUpdate) => {
    if (newUserInventoryNeedUpdate !== oldUserInventoryNeedUpdate && newUserInventoryNeedUpdate) {
        await updateLocalUserInventory();
    }
}, { immediate: true }); // Fetch inventory immediately if license key is available on mount




</script>

<style scoped>
.inventory-display {
    padding: 20px;
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    /* Fill parent height */
    box-sizing: border-box;
    width: 100%;
}

.inventory-display h2 {
    margin-bottom: 20px;
    color: var(--accent-color);
}

/* Loading and Error Messages */
.loading-message,
.error-message {
    text-align: center;
    margin-top: 50px;
    font-size: 1.1em;
    color: var(--text-color);
}

.loading-message .spinner {
    border: 4px solid #f3f3f3;
    /* Light grey */
    border-top: 4px solid var(--accent-color);
    /* Accent color */
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 15px auto;
    /* Center spinner */
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}


.inventory-categories-container {
    flex-grow: 1;
    /* Allow container to take up available vertical space */
    width: 95%;
    /* Adjust width as needed */
    overflow-y: auto;
    /* Enable vertical scrolling */
    padding-right: 10px;
    /* Space for scrollbar */
    /* Add custom scrollbar styling if using custom-scrollbar class */
    /* Only apply overflow/padding if not loading/error/empty */
    /* You might need conditional classes or v-if/v-else around this div */
}

.inventory-category {
    margin-bottom: 30px;
    /* Space between categories */
}

.inventory-category h3 {
    margin-bottom: 15px;
    color: var(--color);
    /* Or a different color for category titles */
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    /* Separator line */
    padding-bottom: 5px;
}

.inventory-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    /* Responsive grid */
    gap: 20px;
    /* Space between items */
    padding-bottom: 20px;
    /* Space at the bottom of the grid */
}

.inventory-item-card {
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
    /* For button positioning */
    padding-bottom: 60px;
    /* Space for the button */
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

/* Action Buttons (Apply/Use/Gift) */
.baseButton.apply-button,
.baseButton.use-button {
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
    /* Consider keeping the unique background/animation if applicable */
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


.empty-inventory-message {
    text-align: center;
    margin-top: 50px;
    font-size: 1.1em;
    color: var(--text-color);
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
</style>