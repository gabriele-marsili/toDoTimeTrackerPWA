"use strict";
// In your backend logic file (where loadShopItems and loadMysteyBoxes are)
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadShopItems = loadShopItems;
exports.loadMysteyBoxes = loadMysteyBoxes;
exports.updateDailyShop = updateDailyShop;
const firebase_1 = require("../firebase/firebase");
const shopTypes_1 = require("../types/shopTypes"); // Adjust import path
const db = firebase_1.initializedFirestonAdmin.firestore();
// Your existing load functions
async function loadShopItems(items) {
    try {
        const shopDocRef = db.collection('shop').doc('items');
        await shopDocRef.set({
            items: items
        }, { merge: true });
        console.log("successfully loaded " + items.length + " items in the shop");
    }
    catch (error) {
        console.log("error in load shop items:\n", error);
    }
}
async function loadMysteyBoxes(mysteryBoxes) {
    try {
        const shopDocRef = db.collection('shop').doc('mysteryBoxes');
        await shopDocRef.set({
            mysteryBoxes: mysteryBoxes
        }, { merge: true });
        console.log("successfully loaded " + mysteryBoxes.length + " mysteryBoxes in the shop");
    }
    catch (error) {
        console.log("error in load mysteryBoxes:\n", error);
    }
}
// --- Larger Pool of Shop Items ---
const allAvailableShopItems = [
    // Cosmetic Items
    { id: "cosmetic_frame_001", name: "Golden Frame", description: "A prestigious golden frame.", cost: 500, rarity: shopTypes_1.ItemRarity.Legendary, imageUrl: "url_golden_frame.png", type: "cosmetic" },
    { id: "cosmetic_frame_002", name: "Silver Frame", description: "A sleek silver frame.", cost: 300, rarity: shopTypes_1.ItemRarity.Rare, imageUrl: "url_silver_frame.png", type: "cosmetic" },
    { id: "cosmetic_frame_003", name: "Bronze Frame", description: "A humble bronze frame.", cost: 100, rarity: shopTypes_1.ItemRarity.QuiteCommon, imageUrl: "url_bronze_frame.png", type: "cosmetic" },
    { id: "cosmetic_background_001", name: "Starry Night Background", description: "A beautiful starry sky background.", cost: 400, rarity: shopTypes_1.ItemRarity.Special, imageUrl: "url_starry_background.png", type: "cosmetic" },
    { id: "cosmetic_background_002", name: "Forest Dawn Background", description: "A peaceful forest at dawn.", cost: 250, rarity: shopTypes_1.ItemRarity.Uncommon, imageUrl: "url_forest_background.png", type: "cosmetic" },
    { id: "cosmetic_icon_001", name: "Dragon Icon", description: "A fierce dragon icon.", cost: 350, rarity: shopTypes_1.ItemRarity.Rare, imageUrl: "url_dragon_icon.png", type: "cosmetic" },
    { id: "cosmetic_theme_001", name: "Ocean Breeze Theme", description: "A refreshing ocean-themed app skin.", cost: 600, rarity: shopTypes_1.ItemRarity.Legendary, imageUrl: "url_ocean_theme.png", type: "cosmetic" },
    // Utility Items
    { id: "utility_karmaboost_001", name: "Small Karma Boost", description: "Increases karma earned by 10% for 1 hour.", cost: 150, rarity: shopTypes_1.ItemRarity.QuiteCommon, imageUrl: "url_small_boost.png", type: "utility" },
    { id: "utility_karmaboost_002", name: "Medium Karma Boost", description: "Increases karma earned by 15% for 3 hours.", cost: 300, rarity: shopTypes_1.ItemRarity.Uncommon, imageUrl: "url_medium_boost.png", type: "utility" },
    { id: "utility_karmaboost_003", name: "Large Karma Boost", description: "Increases karma earned by 25% for 6 hours.", cost: 500, rarity: shopTypes_1.ItemRarity.Rare, imageUrl: "url_large_boost.png", type: "utility" },
    { id: "utility_slot_todo_001", name: "Extra To-Do Slot", description: "Adds one more slot to your To-Do categories.", cost: 200, rarity: shopTypes_1.ItemRarity.Rare, imageUrl: "url_todo_slot.png", type: "utility" },
    { id: "utility_skip_001", name: "Skip Task Token", description: "Skip one To-Do task.", cost: 100, rarity: shopTypes_1.ItemRarity.QuiteCommon, imageUrl: "url_skip_token.png", type: "utility" },
    // Gift Items (Assuming these are purchasable as gifts)
    { id: "gift_karmaboost_small_001", name: "Gift: Small Karma Boost", description: "Gift a small karma boost to a friend.", cost: 180, rarity: shopTypes_1.ItemRarity.QuiteCommon, imageUrl: "url_gift_small_boost.png", type: "gift" }, // Example linking to utility item
    { id: "gift_frame_bronze_001", name: "Gift: Bronze Frame", description: "Gift a bronze frame to a friend.", cost: 120, rarity: shopTypes_1.ItemRarity.QuiteCommon, imageUrl: "url_gift_bronze_frame.png", type: "gift" },
    // Reminder Items (Assuming these are purchasable templates or credits)
    { id: "reminder_template_001", name: "Motiviation Reminder Template", description: "A template for sending motivational reminders.", cost: 50, rarity: shopTypes_1.ItemRarity.Mainstream, imageUrl: "url_motiviation_reminder.png", type: "reminder" },
    { id: "reminder_credit_001", name: "Custom Reminder Credit", description: "Allows sending one custom reminder to a friend.", cost: 80, rarity: shopTypes_1.ItemRarity.Mainstream, imageUrl: "url_reminder_credit.png", type: "reminder" },
];
// --- Pool of Mystery Boxes ---
const allAvailableMysteryBoxes = [
    {
        id: "box_bronze_001", name: "Bronze Mystery Box", cost: 150, rarity: shopTypes_1.ItemRarity.QuiteCommon,
        availableItems: [
            { itemId: "cosmetic_frame_003", probability: 0.3 }, // Bronze Frame
            { itemId: "utility_karmaboost_001", probability: 0.4 }, // Small Karma Boost
            { itemId: "utility_skip_001", probability: 0.2 }, // Skip Task Token
            { itemId: "reminder_template_001", probability: 0.1 }, // Motivation Reminder Template
        ]
    },
    {
        id: "box_silver_001", name: "Silver Mystery Box", cost: 300, rarity: shopTypes_1.ItemRarity.Uncommon,
        availableItems: [
            { itemId: "cosmetic_frame_002", probability: 0.25 }, // Silver Frame
            { itemId: "cosmetic_background_002", probability: 0.2 }, // Forest Dawn Background
            { itemId: "utility_karmaboost_002", probability: 0.3 }, // Medium Karma Boost
            { itemId: "utility_slot_todo_001", probability: 0.15 }, // Extra To-Do Slot
            { itemId: "gift_karmaboost_small_001", probability: 0.1 }, // Gift Small Karma Boost
        ]
    },
    {
        id: "box_gold_001", name: "Gold Mystery Box", cost: 500, rarity: shopTypes_1.ItemRarity.Rare,
        availableItems: [
            { itemId: "cosmetic_frame_001", probability: 0.15 }, // Golden Frame
            { itemId: "cosmetic_background_001", probability: 0.2 }, // Starry Night Background
            { itemId: "cosmetic_icon_001", probability: 0.2 }, // Dragon Icon
            { itemId: "utility_karmaboost_003", probability: 0.25 }, // Large Karma Boost
            { itemId: "box_silver_001", probability: 0.1 }, // Silver Box (nested chance!)
            { itemId: "gift_frame_bronze_001", probability: 0.1 }, // Gift Bronze Frame
        ]
    },
    {
        id: "box_legendary_001", name: "Legendary Mystery Box", cost: 1000, rarity: shopTypes_1.ItemRarity.Legendary,
        availableItems: [
            { itemId: "cosmetic_theme_001", probability: 0.2 }, // Ocean Breeze Theme (Legendary)
            { itemId: "cosmetic_frame_001", probability: 0.2 }, // Golden Frame (Legendary)
            { itemId: "cosmetic_background_001", probability: 0.15 }, // Starry Night (Special)
            { itemId: "utility_karmaboost_003", probability: 0.15 }, // Large Karma Boost (Rare)
            { itemId: "box_gold_001", probability: 0.1 }, // Gold Box (Rare)
            { itemId: "utility_slot_todo_001", probability: 0.1 }, // Extra To-Do Slot (Rare)
            { itemId: "cosmetic_frame_002", probability: 0.1 }, // Silver Frame (Rare)
        ]
    }
];
// --- Function to get the shop inventory for a specific day ---
// Helper to get the start of the week (Monday) for a given date
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}
// Helper to get the number of days between two dates
function daysBetween(d1, d2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((d1.getTime() - d2.getTime()) / oneDay));
    return diffDays;
}
// Define the start date for your weekly rotation.
// This could be a fixed date or dynamically set the first time the shop is populated.
// For this example, let's use a fixed date.
const rotationStartDate = new Date(Date.now());
function getDailyShopInventory(forDate) {
    // Calculate the number of days since the rotation start date
    const daysSinceStart = daysBetween(rotationStartDate, forDate);
    // Determine the week and day within the week
    const weekNumber = Math.floor(daysSinceStart / 7);
    const dayOfWeek = daysSinceStart % 7; // 0 for day 1 of the week, 1 for day 2, etc.
    let dailyItems = [];
    let dailyMysteryBoxes = [];
    // --- Logic to select items and boxes based on the day of the week ---
    // This is a simple example. You can create more complex selection logic
    // involving different sets for each day, ensuring variety.
    switch (dayOfWeek) {
        case 0: // Day 1 (e.g., Monday)
            dailyItems = allAvailableShopItems.filter(item => item.rarity === shopTypes_1.ItemRarity.Mainstream || item.rarity === shopTypes_1.ItemRarity.QuiteCommon).slice(0, 5);
            dailyMysteryBoxes = allAvailableMysteryBoxes.filter(box => box.rarity === shopTypes_1.ItemRarity.QuiteCommon || box.rarity === shopTypes_1.ItemRarity.Uncommon).slice(0, 2);
            break;
        case 1: // Day 2
            dailyItems = allAvailableShopItems.filter(item => item.rarity === shopTypes_1.ItemRarity.QuiteCommon || item.rarity === shopTypes_1.ItemRarity.Uncommon).slice(0, 5);
            dailyMysteryBoxes = allAvailableMysteryBoxes.filter(box => box.rarity === shopTypes_1.ItemRarity.Uncommon || box.rarity === shopTypes_1.ItemRarity.Rare).slice(0, 2);
            break;
        case 2: // Day 3
            dailyItems = allAvailableShopItems.filter(item => item.rarity === shopTypes_1.ItemRarity.Uncommon || item.rarity === shopTypes_1.ItemRarity.Rare).slice(0, 5);
            dailyMysteryBoxes = allAvailableMysteryBoxes.filter(box => box.rarity === shopTypes_1.ItemRarity.Rare || box.rarity === shopTypes_1.ItemRarity.Special).slice(0, 2);
            break;
        case 3: // Day 4
            dailyItems = allAvailableShopItems.filter(item => item.rarity === shopTypes_1.ItemRarity.Rare || item.rarity === shopTypes_1.ItemRarity.Special).slice(0, 5);
            dailyMysteryBoxes = allAvailableMysteryBoxes.filter(box => box.rarity === shopTypes_1.ItemRarity.Special || box.rarity === shopTypes_1.ItemRarity.Legendary).slice(0, 2);
            break;
        case 4: // Day 5
            dailyItems = allAvailableShopItems.filter(item => item.rarity === shopTypes_1.ItemRarity.Special || item.rarity === shopTypes_1.ItemRarity.Legendary).slice(0, 5);
            dailyMysteryBoxes = allAvailableMysteryBoxes.filter(box => box.rarity === shopTypes_1.ItemRarity.Legendary || box.rarity === shopTypes_1.ItemRarity.Unique).slice(0, 2);
            break;
        case 5: // Day 6
            // Mix of rarities
            dailyItems = allAvailableShopItems.filter(item => item.rarity === shopTypes_1.ItemRarity.Mainstream ||
                item.rarity === shopTypes_1.ItemRarity.Uncommon ||
                item.rarity === shopTypes_1.ItemRarity.Rare ||
                item.rarity === shopTypes_1.ItemRarity.Legendary).sort(() => 0.5 - Math.random()).slice(0, 5); // Shuffle and take 5
            dailyMysteryBoxes = allAvailableMysteryBoxes.filter(box => box.rarity === shopTypes_1.ItemRarity.Rare ||
                box.rarity === shopTypes_1.ItemRarity.Legendary).sort(() => 0.5 - Math.random()).slice(0, 2); // Shuffle and take 2
            break;
        case 6: // Day 7 (e.g., Sunday)
            // Higher chance for rarer items/boxes
            dailyItems = allAvailableShopItems.filter(item => item.rarity === shopTypes_1.ItemRarity.Rare ||
                item.rarity === shopTypes_1.ItemRarity.Special ||
                item.rarity === shopTypes_1.ItemRarity.Legendary ||
                item.rarity === shopTypes_1.ItemRarity.Unique).sort(() => 0.5 - Math.random()).slice(0, 5); // Shuffle and take 5
            dailyMysteryBoxes = allAvailableMysteryBoxes.filter(box => box.rarity === shopTypes_1.ItemRarity.Special ||
                box.rarity === shopTypes_1.ItemRarity.Legendary ||
                box.rarity === shopTypes_1.ItemRarity.Unique).sort(() => 0.5 - Math.random()).slice(0, 2); // Shuffle and take 2
            break;
    }
    // Fallback in case filtering doesn't return enough items
    while (dailyItems.length < 5 && allAvailableShopItems.length > dailyItems.length) {
        const randomItem = allAvailableShopItems[Math.floor(Math.random() * allAvailableShopItems.length)];
        if (!dailyItems.find(item => item.id === randomItem.id)) {
            dailyItems.push(randomItem);
        }
    }
    while (dailyMysteryBoxes.length < 2 && allAvailableMysteryBoxes.length > dailyMysteryBoxes.length) {
        const randomBox = allAvailableMysteryBoxes[Math.floor(Math.random() * allAvailableMysteryBoxes.length)];
        if (!dailyMysteryBoxes.find(box => box.id === randomBox.id)) {
            dailyMysteryBoxes.push(randomBox);
        }
    }
    return { dailyItems, dailyMysteryBoxes };
}
// --- Function to update the shop inventory for the current day ---
async function updateDailyShop() {
    const today = new Date();
    const { dailyItems, dailyMysteryBoxes } = getDailyShopInventory(today);
    console.log(`Updating shop for ${today.toDateString()}`);
    console.log("Daily Items:", dailyItems.map(item => item.name));
    console.log("Daily Mystery Boxes:", dailyMysteryBoxes.map(box => box.name));
    await loadShopItems(dailyItems);
    await loadMysteyBoxes(dailyMysteryBoxes);
}
// --- How to trigger updateDailyShop daily ---
// The `test()` function you had can now be used to manually trigger the daily update
// for testing purposes.
async function test() {
    await updateDailyShop();
}
