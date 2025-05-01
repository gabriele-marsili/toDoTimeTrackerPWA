// In your backend logic file (where loadShopItems and loadMysteyBoxes are)

import { initializedFirestonAdmin } from "../firebase/firebase";
import { ItemRarity, MysterBoxImageUrls, MysteryBoxConfig, ShopItem } from "../types/shopTypes"; // Adjust import path

const db = initializedFirestonAdmin.firestore();

// Your existing load functions
export async function loadShopItems(items: ShopItem[]): Promise<void> {
    try {
        console.log("loading items:\n", items)
        const shopDocRef = db.collection('shop').doc('items');
        await shopDocRef.set({
            items: items
        }, { merge: true });
        console.log("successfully loaded " + items.length + " items in the shop");
    } catch (error: any) {
        console.log("error in load shop items:\n", error);
    }
}

export async function loadMysteyBoxes(mysteryBoxes: MysteryBoxConfig[]): Promise<void> {
    try {
        const shopDocRef = db.collection('shop').doc('mysteryBoxes');
        await shopDocRef.set({
            mysteryBoxes: mysteryBoxes
        }, { merge: true });
        console.log("successfully loaded " + mysteryBoxes.length + " mysteryBoxes in the shop");
    } catch (error: any) {
        console.log("error in load mysteryBoxes:\n", error);
    }
}


// Centralized image URLs for all shop items
const ALL_ITEM_IMAGE_URLS: Record<string, string> = {
    // Karma Boosts 
    "utility_karmaboost_001": "https://i.imgur.com/v95NpaP.jpeg", // Small Karma Boost
    "utility_karmaboost_002": "https://i.imgur.com/zaQ32DE.jpeg", // Medium Karma Boost
    "utility_karmaboost_003": "https://i.imgur.com/l6c63hW.jpeg", // Large Karma Boost
    "utility_karmaboost_004": "https://i.imgur.com/Yj0NtpH.jpeg", // Legendary Karma Boost 

    // Frames
    "cosmetic_frame_001": "",
    "cosmetic_frame_002": "",
    "cosmetic_frame_003": "",
    "cosmetic_frame_004": "",
    "cosmetic_frame_005": "",
    "cosmetic_frame_006": "",
    "cosmetic_frame_007": "",


    // Gift Items
    "gift_karmaboost_small_001": "url_gift_small_boost.png",
    "gift_frame_bronze_001": "url_gift_bronze_frame.png",

    // Reminder Items
    "reminder_template_001": "url_motiviation_reminder.png",
    "reminder_credit_001": "url_reminder_credit.png",

    // Avatar Items (PLACEHOLDERS - REPLACE WITH ACTUAL HOSTED URLs)
    "avatar_icon_001": "url_avatar_001.png",
    "avatar_icon_002": "url_avatar_002.png",
    "avatar_icon_003": "url_avatar_003.png",
    "avatar_icon_004": "url_avatar_004.png",
    "avatar_icon_005": "url_avatar_005.png",
    "avatar_icon_006": "url_avatar_006.png",
    "avatar_icon_007": "url_avatar_007.png", // Used for Bored Guy
    "avatar_icon_008": "url_avatar_008.png", // Used for Bored Girl
    "avatar_icon_009": "url_avatar_009.png", // Used for Concentrated Guy 
    "avatar_icon_010": "url_avatar_010.png", // Used for Concentrated Girl 
    "avatar_icon_011": "url_avatar_011.png", // Used for Nerd Guy
    "avatar_icon_012": "url_avatar_012.png", // Used for Nerd Girl
    "avatar_icon_013": "url_avatar_013.png", // Used for Cheeky Monkey
    "avatar_icon_014": "url_avatar_014.png", // Used for Fake Cool Guy
    "avatar_icon_015": "url_avatar_015.png", // Used for Fake Cool Girl
    "avatar_icon_016": "url_avatar_016.png", // Used for Sleepy Student Girl and Guy
    "avatar_icon_017": "url_avatar_017.png", // Used for Caffeine Addict Guy and Girl
    "avatar_icon_018": "url_avatar_018.png", // Used for Just Chillin' Guy and Girl 
    "avatar_icon_019": "url_avatar_019.png", // Used for Sporty Guy
    "avatar_icon_020": "url_avatar_020.png", // Used for Sporty Girl 
    "avatar_icon_021": "url_avatar_021.png", // Used for Mysterious Stranger 
    "avatar_icon_022": "url_avatar_022.png", // Used for Bookworm 
    "avatar_icon_023": "url_avatar_023.png", // Used for Night Owl Girl and Guy 
    "avatar_icon_024": "url_avatar_024.png", // Used for Early Bird Girl and Guy 
    "avatar_icon_025": "url_avatar_025.png", // Used for Zen Cat 
    "avatar_icon_026": "url_avatar_026.png", // Used for Minimalist Girl and Guy 
    "avatar_icon_027": "url_avatar_027.png", // Used for The Shadow 
    "avatar_icon_028": "url_avatar_028.png", // Used for Robot Assistant 
    "avatar_icon_029": "url_avatar_029.png", // Used for Nature Entity 
    "avatar_icon_030": "url_avatar_030.png", // Used for Knight of Focus 
    "avatar_icon_031": "url_avatar_031.png", // Used for Task Wizard 
    "avatar_icon_032": "url_avatar_032.png", // Used for Futurist 
    "avatar_icon_033": "url_avatar_033.png", // Used for Desert Wolf 
    "avatar_icon_034": "url_avatar_034.png", // Used for Lady Noir 
    "avatar_icon_035": "url_avatar_035.png", // Used for Mountain Hermit 
    "avatar_icon_036": "url_avatar_036.png", // Used for The Masked Planner 
    "avatar_icon_037": "url_avatar_037.png", // Used for Digital Elf 
    "avatar_icon_038": "url_avatar_038.png", // Used for Star Commander 
    "avatar_icon_039": "url_avatar_039.png", // Used for Mind Reader 
    "avatar_icon_040": "url_avatar_040.png", // Used for Phoenix Soul 
    "avatar_icon_041": "url_avatar_041.png", // Used for The Time Bender 
    "avatar_icon_042": "url_avatar_042.png", // Used for Cosmic Entity 
    "avatar_icon_043": "url_avatar_043.png", // Used for Chrono Panther 
    "avatar_icon_044": "url_avatar_044.png", // Used for Lord of Time 
    "avatar_icon_045": "url_avatar_045.png", // Used for The Architect (M) 
    "avatar_icon_046": "url_avatar_046.png", // Used for The Oracle (F) 
    "avatar_icon_047": "",
    "avatar_icon_048": "",
    "avatar_icon_049": "",
    "avatar_icon_050": "",
    "avatar_icon_051": "",
    "avatar_icon_052": "",

};

// --- Larger Pool of Shop Items (using the centralized URLs) ---
const allAvailableShopItems: ShopItem[] = [
    // Cosmetic Items
    { id: "cosmetic_frame_001", name: "Basic Frame", description: "A basic frame, nothing so special.", cost: 20, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["cosmetic_frame_001"], type: "cosmetic" },
    { id: "cosmetic_frame_002", name: "Classic Frame", description: "A boring and common frame.", cost: 60, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["cosmetic_frame_002"], type: "cosmetic" },
    { id: "cosmetic_frame_003", name: "Unusual Frame", description: "An unusual frame, not so cool but not so bad.", cost: 100, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["cosmetic_frame_003"], type: "cosmetic" },
    { id: "cosmetic_frame_007", name: "Electric Frame", description: "Not everyone has it, but some do", cost: 150, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["cosmetic_frame_007"], type: "cosmetic" }, // Corrected ID
    { id: "cosmetic_frame_004", name: "Princess Frame", description: "Like a true princess or like a valid prince", cost: 225, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["cosmetic_frame_004"], type: "cosmetic" },
    { id: "cosmetic_frame_005", name: "Golden Frame", description: "A prestigious golden frame", cost: 300, rarity: ItemRarity.Legendary, imageUrl: ALL_ITEM_IMAGE_URLS["cosmetic_frame_005"], type: "cosmetic" },
    { id: "cosmetic_frame_006", name: "The Unique Frame", description: "The unique frame that can surround a God", cost: 500, rarity: ItemRarity.Unique, imageUrl: ALL_ITEM_IMAGE_URLS["cosmetic_frame_006"], type: "cosmetic" },

    // Utility Items
    { id: "utility_karmaboost_001", name: "Small Karma Boost", description: "Increases karma earned by 10% for 1 hour.", cost: 150, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["utility_karmaboost_001"], type: "utility" },
    { id: "utility_karmaboost_002", name: "Medium Karma Boost", description: "Increases karma earned by 15% for 3 hours.", cost: 300, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["utility_karmaboost_002"], type: "utility" },
    { id: "utility_karmaboost_003", name: "Large Karma Boost", description: "Increases karma earned by 25% for 6 hours.", cost: 500, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["utility_karmaboost_003"], type: "utility" },
    { id: "utility_karmaboost_004", name: "Legendary Karma Boost", description: "Increases karma earned by 35% for 8 hours.", cost: 700, rarity: ItemRarity.Legendary, imageUrl: ALL_ITEM_IMAGE_URLS["utility_karmaboost_004"], type: "utility" }, // Corrected ID

    // Gift Items (Assuming these are purchasable as gifts)
    // Note: You might want specific gift box images
    { id: "gift_karmaboost_small_001", name: "Gift: Small Karma Boost", description: "Gift a small karma boost to a friend.", cost: 180, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["gift_karmaboost_small_001"], type: "gift" },
    { id: "gift_frame_bronze_001", name: "Gift: Bronze Frame", description: "Gift a bronze frame to a friend.", cost: 120, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["gift_frame_bronze_001"], type: "gift" },

    // Reminder Items (Assuming these are purchasable templates or credits)
    // Note: You might want specific reminder icons
    { id: "reminder_template_001", name: "Motiviation Reminder Template", description: "A template for sending motivational reminders.", cost: 50, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["reminder_template_001"], type: "reminder" },
    { id: "reminder_credit_001", name: "Custom Reminder Credit", description: "Allows sending one custom reminder to a friend.", cost: 80, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["reminder_credit_001"], type: "reminder" },

    // Avatars (Using URLs from the centralized object)
    // --- Mainstream (15 items) ---
    { id: "avatar_icon_001", name: "Basic User", description: "A simple, default profile icon.", cost: 5, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_001"], type: "avatar" },
    { id: "avatar_icon_002", name: "Happy Face", description: "Smile, sometimes.", cost: 10, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_002"], type: "avatar" },
    { id: "avatar_icon_003", name: "Smiling Cat", description: "Who doesn't love a smiling cat?", cost: 20, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_003"], type: "avatar" },
    { id: "avatar_icon_004", name: "Cool Dog", description: "Dogs >> cats and cool dogs >> dogs, that's simple math", cost: 20, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_004"], type: "avatar" },
    { id: "avatar_icon_005", name: "Mainstream Girl", description: "A standard female profile, a little boring", cost: 20, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_005"], type: "avatar" },
    { id: "avatar_icon_006", name: "Mainstream Guy", description: "A standard male profile, a little boring", cost: 20, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_006"], type: "avatar" },
    { id: "avatar_icon_007", name: "A Bored Guy", description: "Just a bored guy", cost: 25, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_007"], type: "avatar" },
    { id: "avatar_icon_008", name: "A Bored Girl", description: "Just a bored girl", cost: 25, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_008"], type: "avatar" },
    { id: "avatar_icon_009", name: "A Concentrated Guy", description: "sssh, I'm trying to concentrate", cost: 30, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_009"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_icon_010", name: "A Concentrated Girl", description: "sssh, I'm trying to concentrate", cost: 30, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_010"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_icon_011", name: "The Nerd Guy", description: "I like studying and I wear glasses, but that doesn't mean I'm a nerd", cost: 30, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_011"], type: "avatar" },
    { id: "avatar_icon_012", name: "The Nerd Girl", description: "I like studying and I wear glasses, but that doesn't mean I'm a nerd", cost: 30, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_012"], type: "avatar" },
    { id: "avatar_icon_013", name: "Cheeky Monkey", description: "A playful monkey face.", cost: 40, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_013"], type: "avatar" },
    { id: "avatar_icon_014", name: "The (fake) Cool Guy", description: "Where's the party?", cost: 40, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_014"], type: "avatar" },
    { id: "avatar_icon_015", name: "The (fake) Cool Girl", description: "Do you think I'm pretty? Of course, everyone thinks so", cost: 40, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_015"], type: "avatar" },

    // --- Quite Common (10 items) ---
    { id: "avatar_icon_016", name: "Sleepy Student Girl", description: "Too many late-night study sessions.", cost: 60, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_016"], type: "avatar" },
    { id: "avatar_icon_017", name: "Sleepy Student Guy", description: "Too many late-night study sessions.", cost: 60, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_017"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_icon_018", name: "Caffeine Addict Guy", description: "Runs on coffee and anxiety.", cost: 60, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_018"], type: "avatar" },
    { id: "avatar_icon_019", name: "Caffeine Addict Girl", description: "Runs on coffee and anxiety.", cost: 60, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_019"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_icon_020", name: "Just Chillin' Guy", description: "Productivity? Maybe later.", cost: 75, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_020"], type: "avatar" },
    { id: "avatar_icon_021", name: "Just Chillin' Girl", description: "Productivity? Maybe later.", cost: 75, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_021"], type: "avatar" }, // Corrected ID
    { id: "avatar_icon_022", name: "Sporty Guy", description: "Break time is gym time.", cost: 75, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_022"], type: "avatar" },
    { id: "avatar_icon_023", name: "Sporty Girl", description: "Active, focused, unstoppable.", cost: 75, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_023"], type: "avatar" },
    { id: "avatar_icon_024", name: "Mysterious Stranger", description: "Nobody really knows him.", cost: 80, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_024"], type: "avatar" },
    { id: "avatar_icon_025", name: "Bookworm", description: "She knows too much.", cost: 80, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_025"], type: "avatar" },


    // --- Uncommon (10 items) ---
    { id: "avatar_icon_026", name: "Night Owl Girl", description: "Productive only after midnight.", cost: 100, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_026"], type: "avatar" },
    { id: "avatar_icon_027", name: "Night Owl Guy", description: "Productive only after midnight.", cost: 100, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_027"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_icon_028", name: "Early Bird Girl", description: "Wakes up at 5AM. By choice.", cost: 100, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_028"], type: "avatar" },
    { id: "avatar_icon_029", name: "Early Bird Guy", description: "Wakes up at 5AM. By choice.", cost: 100, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_029"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_icon_030", name: "Zen Cat", description: "Meditates between tasks.", cost: 115, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_030"], type: "avatar" },
    { id: "avatar_icon_031", name: "Minimalist Girl", description: "Less is more.", cost: 120, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_031"], type: "avatar" }, // Corrected ID
    { id: "avatar_icon_032", name: "Minimalist Guy", description: "Less is more.", cost: 120, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_032"], type: "avatar" },
    { id: "avatar_icon_033", name: "The Shadow", description: "Silent but efficient.", cost: 130, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_033"], type: "avatar" }, // Corrected ID
    { id: "avatar_icon_034", name: "Robot Assistant", description: "Not sentient... yet.", cost: 135, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_034"], type: "avatar" },
    { id: "avatar_icon_035", name: "Nature Entity", description: "Feeling the wind", cost: 145, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_035"], type: "avatar" },


    // --- Rare (7 items) ---
    { id: "avatar_icon_036", name: "Knight of Focus", description: "Defender of deadlines.", cost: 200, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_036"], type: "avatar" },
    { id: "avatar_icon_037", name: "Task Wizard", description: "Turns to-dos into done.", cost: 220, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_037"], type: "avatar" },
    { id: "avatar_icon_038", name: "Futurist", description: "Already planning for next year.", cost: 230, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_038"], type: "avatar" },
    { id: "avatar_icon_039", name: "Desert Wolf", description: "Alone, but never idle.", cost: 240, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_039"], type: "avatar" },
    { id: "avatar_icon_040", name: "Lady Noir", description: "Elegant, focused, untouchable.", cost: 250, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_040"], type: "avatar" },
    { id: "avatar_icon_041", name: "Mountain Hermit", description: "Lives alone. Works a lot.", cost: 260, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_041"], type: "avatar" },
    { id: "avatar_icon_042", name: "The Masked Planner", description: "Has a plan for everything.", cost: 270, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_042"], type: "avatar" },


    // --- Special (5 items) ---
    { id: "avatar_icon_043", name: "Digital Elf", description: "Boosts your motivation with magic.", cost: 400, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_043"], type: "avatar" },
    { id: "avatar_icon_044", name: "Star Commander", description: "Leads galactic productivity fleets.", cost: 420, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_044"], type: "avatar" },
    { id: "avatar_icon_045", name: "Mind Reader", description: "Knows your tasks before you do.", cost: 440, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_045"], type: "avatar" },
    { id: "avatar_icon_046", name: "Phoenix Soul", description: "Rises from procrastination ashes.", cost: 460, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_046"], type: "avatar" },
    { id: "avatar_icon_047", name: "The Time Bender", description: "Can manipulate time... for deadlines.", cost: 480, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_047"], type: "avatar" },


    // --- Legendary (3 items) ---
    { id: "avatar_icon_048", name: "Cosmic Entity", description: "A being of immense power.", cost: 2500, rarity: ItemRarity.Legendary, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_048"], type: "avatar" },
    { id: "avatar_icon_049", name: "Chrono Panther", description: "A legendary creature of absolute punctuality.", cost: 3000, rarity: ItemRarity.Legendary, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_049"], type: "avatar" },
    { id: "avatar_icon_050", name: "Lord of Time", description: "Absolute control over chronology.", cost: 2800, rarity: ItemRarity.Legendary, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_050"], type: "avatar" },

    // --- Unique (2 items - Male/Female) ---
    { id: "avatar_icon_051", name: "The Architect (M)", description: "The master builder of realities.", cost: 5000, rarity: ItemRarity.Unique, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_051"], type: "avatar" },
    { id: "avatar_icon_052", name: "The Oracle (F)", description: "Possessing unparalleled insight.", cost: 5000, rarity: ItemRarity.Unique, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_icon_052"], type: "avatar" },

];


// --- Pool of Mystery Boxes ---
const allAvailableMysteryBoxes: MysteryBoxConfig[] = [
    {
        id: "box_bronze_001", name: "Mainstream Mystery Box", cost: 150, rarity: ItemRarity.Special,
        availableItems: [
            { itemId: "cosmetic_frame_003", probability: 0.3 }, // Bronze Frame
            { itemId: "utility_karmaboost_001", probability: 0.4 }, // Small Karma Boost
            { itemId: "utility_skip_001", probability: 0.2 }, // Skip Task Token
            { itemId: "reminder_template_001", probability: 0.1 }, // Motivation Reminder Template
        ],
        imageUrl: MysterBoxImageUrls.Mainstream
    },
    {
        id: "box_silver_001", name: "Silver Mystery Box", cost: 300, rarity: ItemRarity.Mainstream,
        availableItems: [
            { itemId: "cosmetic_frame_002", probability: 0.25 }, // Silver Frame
            { itemId: "cosmetic_background_002", probability: 0.2 }, // Forest Dawn Background
            { itemId: "utility_karmaboost_002", probability: 0.3 }, // Medium Karma Boost
            { itemId: "utility_slot_todo_001", probability: 0.15 }, // Extra To-Do Slot
            { itemId: "gift_karmaboost_small_001", probability: 0.1 }, // Gift Small Karma Boost
        ],
        imageUrl: MysterBoxImageUrls.Mainstream
    },
    {
        id: "box_gold_001", name: "Gold Mystery Box", cost: 500, rarity: ItemRarity.Rare,
        availableItems: [
            { itemId: "cosmetic_frame_001", probability: 0.15 }, // Golden Frame
            { itemId: "cosmetic_background_001", probability: 0.2 }, // Starry Night Background
            { itemId: "cosmetic_icon_001", probability: 0.2 }, // Dragon Icon
            { itemId: "utility_karmaboost_003", probability: 0.25 }, // Large Karma Boost
            { itemId: "box_silver_001", probability: 0.1 }, // Silver Box (nested chance!)
            { itemId: "gift_frame_bronze_001", probability: 0.1 }, // Gift Bronze Frame
        ],
        imageUrl: MysterBoxImageUrls.Rare
    },
    {
        id: "box_legendary_001", name: "Legendary Mystery Box", cost: 1000, rarity: ItemRarity.Legendary,
        availableItems: [
            { itemId: "cosmetic_theme_001", probability: 0.2 }, // Ocean Breeze Theme (Legendary)
            { itemId: "cosmetic_frame_001", probability: 0.2 }, // Golden Frame (Legendary)
            { itemId: "cosmetic_background_001", probability: 0.15 }, // Starry Night (Special)
            { itemId: "utility_karmaboost_003", probability: 0.15 }, // Large Karma Boost (Rare)
            { itemId: "box_gold_001", probability: 0.1 }, // Gold Box (Rare)
            { itemId: "utility_slot_todo_001", probability: 0.1 }, // Extra To-Do Slot (Rare)
            { itemId: "cosmetic_frame_002", probability: 0.1 }, // Silver Frame (Rare)
        ],
        imageUrl: MysterBoxImageUrls.Legendary
    }
];

const rarityOrder = [
    ItemRarity.Mainstream,
    ItemRarity.QuiteCommon,
    ItemRarity.Uncommon,
    ItemRarity.Rare,
    ItemRarity.Special,
    ItemRarity.Legendary,
    ItemRarity.Unique,
];

// Define the rarity probabilities for weighted selection
const RARITY_PROBABILITIES: Record<ItemRarity, number> = {
    [ItemRarity.Mainstream]: 0.30,
    [ItemRarity.QuiteCommon]: 0.25,
    [ItemRarity.Uncommon]: 0.22,
    [ItemRarity.Rare]: 0.11,
    [ItemRarity.Special]: 0.075,
    [ItemRarity.Legendary]: 0.035,
    [ItemRarity.Unique]: 0.01,
};

// --- Function to get the shop inventory for a specific day ---

// Helper to get items by rarity
function getItemsByRarity(rarity: ItemRarity, items: ShopItem[]): ShopItem[] {
    return items.filter(item => item.rarity === rarity);
}

// Helper to get the next rarity in order
function getNextRarity(currentRarity: ItemRarity): ItemRarity | undefined {
    const currentIndex = rarityOrder.indexOf(currentRarity);
    if (currentIndex === -1 || currentIndex === rarityOrder.length - 1) {
        return undefined; // No next rarity
    }
    return rarityOrder[currentIndex + 1];
}

// Helper to get the previous rarity in order
function getPreviousRarity(currentRarity: ItemRarity): ItemRarity | undefined {
    const currentIndex = rarityOrder.indexOf(currentRarity);
    if (currentIndex === -1 || currentIndex === 0) {
        return undefined; // No previous rarity
    }
    return rarityOrder[currentIndex - 1];
}

// Helper to get a random item from a list, excluding certain IDs
function getRandomItem<T extends { id: string }>(items: T[], excludeIds: string[] = []): T | undefined {
    const availableItems = items.filter(item => !excludeIds.includes(item.id));
    if (availableItems.length === 0) {
        return undefined;
    }
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    return availableItems[randomIndex];
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
}

function selectRandomByRarity<T extends { rarity: ItemRarity }>(items: T[]): T | null {
    if (items.length === 0) {
        return null;
    }

    // Filter items to only include those with defined probabilities
    const selectableItems = items.filter(item => RARITY_PROBABILITIES[item.rarity] !== undefined);

    if (selectableItems.length === 0) {
         console.warn("No selectable items with defined rarity probabilities found.");
         // Fallback: if no items have defined probabilities, just pick one randomly
         return shuffleArray(items)[0];
    }


    // Calculate the total weight of all selectable items
    const totalWeight = selectableItems.reduce((sum, item) => sum + RARITY_PROBABILITIES[item.rarity], 0);

    if (totalWeight === 0) {
         console.warn("Total weight of selectable items is zero. Falling back to random selection.");
         return shuffleArray(selectableItems)[0] || null;
    }


    // Generate a random value between 0 and the total weight
    let randomValue = Math.random() * totalWeight;

    // Iterate through the items, subtracting their weight until the random value is <= 0
    for (const item of selectableItems) {
        randomValue -= RARITY_PROBABILITIES[item.rarity];
        if (randomValue <= 0) {
            return item; // This item is selected
        }
    }

     // Fallback: Should not be reached if totalWeight > 0, but return a random item just in case
     console.warn("Weighted selection did not select an item. Falling back to random selection.");
     return shuffleArray(selectableItems)[0] || null;
}


function generateMysteryBoxes(allItems: ShopItem[]): MysteryBoxConfig[] {
    const mysteryBoxes: MysteryBoxConfig[] = [];

    // Group items by rarity for easier access
    const itemsByRarity: Record<ItemRarity, ShopItem[]> = allItems.reduce((acc, item) => {
        if (!acc[item.rarity]) {
            acc[item.rarity] = [];
        }
        acc[item.rarity].push(item);
        return acc;
    }, {} as Record<ItemRarity, ShopItem[]>);

    console.log("Items by Rarity:", itemsByRarity);


    // Generate boxes for each rarity
    for (const currentRarity of rarityOrder) {
        const previousRarity = getPreviousRarity(currentRarity);
        const nextRarity = getNextRarity(currentRarity);

        const itemsOfCurrentRarity = itemsByRarity[currentRarity] || [];
        const itemsOfPreviousRarity = previousRarity ? (itemsByRarity[previousRarity] || []) : [];
        const itemsOfNextRarity = nextRarity ? (itemsByRarity[nextRarity] || []) : [];

        const availableItemsInBox: { itemId: string; probability: number }[] = [];
        const itemsToAdd: ShopItem[] = [];

        // --- Select items for the box ---

        // 1. Item from the rarity above (5% probability)
        if (itemsOfNextRarity.length > 0 && currentRarity !== ItemRarity.Unique) {
            // Select one random item from the rarity above
            const itemFromAbove = shuffleArray(itemsOfNextRarity)[0];
            itemsToAdd.push(itemFromAbove);
            availableItemsInBox.push({ itemId: itemFromAbove.id, probability: 0.05 });
        } else if (currentRarity === ItemRarity.Unique && itemsByRarity[ItemRarity.Legendary]?.length > 0) {
            // For Unique box, include a Legendary item (if available)
             const itemFromLegendary = shuffleArray(itemsByRarity[ItemRarity.Legendary])[0];
             itemsToAdd.push(itemFromLegendary);
             availableItemsInBox.push({ itemId: itemFromLegendary.id, probability: 0.05 }); // Still 5% for the rarer item type
        }


        // 2. Item from the rarity below (35% probability)
        if (itemsOfPreviousRarity.length > 0 && currentRarity !== ItemRarity.Mainstream) {
            // Select one random item from the rarity below
             const itemFromBelow = shuffleArray(itemsOfPreviousRarity)[0];
             // Ensure it's not already added (can happen if next/previous are the same rarity due to filtering logic edge cases, though unlikely with current rules)
             if (!itemsToAdd.find(item => item.id === itemFromBelow.id)) {
                itemsToAdd.push(itemFromBelow);
                availableItemsInBox.push({ itemId: itemFromBelow.id, probability: 0.35 });
             }
        } else if (currentRarity === ItemRarity.Mainstream && itemsByRarity[ItemRarity.QuiteCommon]?.length > 0) {
             // For Mainstream box, include a Quite Common item (if available)
             const itemFromQuiteCommon = shuffleArray(itemsByRarity[ItemRarity.QuiteCommon])[0];
             if (!itemsToAdd.find(item => item.id === itemFromQuiteCommon.id)) {
                itemsToAdd.push(itemFromQuiteCommon);
                availableItemsInBox.push({ itemId: itemFromQuiteCommon.id, probability: 0.35 }); // Still 35% for the less rare item type
             }
        }


        // 3. Three random items from the current rarity (20% each, totaling 60%)
        const itemsFromCurrentShuffled = shuffleArray(itemsOfCurrentRarity);
        let currentRarityItemsAdded = 0;
        for (const item of itemsFromCurrentShuffled) {
            if (itemsToAdd.length < 5 && currentRarityItemsAdded < 3 && !itemsToAdd.find(i => i.id === item.id)) {
                itemsToAdd.push(item);
                availableItemsInBox.push({ itemId: item.id, probability: 0.20 });
                currentRarityItemsAdded++;
            }
        }

         // --- Adjust probabilities if fewer than 5 items were added ---
         // Distribute remaining probability among added items
         const totalCurrentProbability = availableItemsInBox.reduce((sum, item) => sum + item.probability, 0);

         if (totalCurrentProbability < 1) {
             const remainingProbability = 1 - totalCurrentProbability;
             const probabilityPerItem = remainingProbability / availableItemsInBox.length;

             availableItemsInBox.forEach(item => {
                 item.probability += probabilityPerItem;
             });
         }


        // --- Create the Mystery Box Config ---
        if (availableItemsInBox.length > 0) {
            // Determine the cost of the mystery box (example logic: average cost of contained items * a multiplier)
            const totalCostOfContents = itemsToAdd.reduce((sum, item) => sum + item.cost, 0);
            const averageCostOfContents = itemsToAdd.length > 0 ? totalCostOfContents / itemsToAdd.length : 0;
            const boxCostMultiplier = getMysteryBoxCostMultiplier(currentRarity); // Implement this function

            const boxCost = Math.round(averageCostOfContents * boxCostMultiplier);
            // Ensure minimum cost
            const finalBoxCost = Math.max(boxCost, getMinimumMysteryBoxCost(currentRarity)); // Implement this function

            let image_url = ""
            switch (currentRarity){
                case ItemRarity.Mainstream:
                    image_url = MysterBoxImageUrls.Mainstream
                    break
                case ItemRarity.QuiteCommon:
                    image_url = MysterBoxImageUrls.QuiteCommon
                    break
                case ItemRarity.Uncommon:
                    image_url = MysterBoxImageUrls.Uncommon
                    break
                case ItemRarity.Rare:
                    image_url = MysterBoxImageUrls.Rare
                    break
                case ItemRarity.Special:
                    image_url = MysterBoxImageUrls.Special
                    break
                case ItemRarity.Legendary:
                    image_url = MysterBoxImageUrls.Legendary
                    break
                case ItemRarity.Unique:
                    image_url = MysterBoxImageUrls.Unique
                    break
            }

            const mysteryBox: MysteryBoxConfig = {
                id: `box_${currentRarity.toLowerCase()}_001`, // Example ID
                name: `${currentRarity} Mystery Box`, // Example Name
                cost: finalBoxCost,
                rarity: currentRarity,
                availableItems: availableItemsInBox,
                imageUrl: image_url
            };
            mysteryBoxes.push(mysteryBox);
        }
    }

    return mysteryBoxes;
}

// Helper function to determine cost multiplier based on rarity
function getMysteryBoxCostMultiplier(rarity: ItemRarity): number {
    switch (rarity) {
        case ItemRarity.Mainstream: return 1.2;
        case ItemRarity.QuiteCommon: return 1.3;
        case ItemRarity.Uncommon: return 1.4;
        case ItemRarity.Rare: return 1.5;
        case ItemRarity.Special: return 1.6;
        case ItemRarity.Legendary: return 1.8;
        case ItemRarity.Unique: return 2.0; // Unique boxes are more expensive relative to content
        default: return 1.0;
    }
}

// Helper function to determine minimum cost based on rarity
function getMinimumMysteryBoxCost(rarity: ItemRarity): number {
     switch (rarity) {
        case ItemRarity.Mainstream: return 50;
        case ItemRarity.QuiteCommon: return 100;
        case ItemRarity.Uncommon: return 200;
        case ItemRarity.Rare: return 400;
        case ItemRarity.Special: return 800;
        case ItemRarity.Legendary: return 1500;
        case ItemRarity.Unique: return 3000;
        default: return 10;
    }
}

// Helper to get the number of days between two dates
function daysBetween(d1: Date, d2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((d1.getTime() - d2.getTime()) / oneDay));
    return diffDays;
}


// Define the start date for your weekly rotation.
// This could be a fixed date or dynamically set the first time the shop is populated.
// For this example, let's use a fixed date.
const rotationStartDate = new Date(Date.now());

function getDailyShopInventory(forDate: Date, allItems: ShopItem[], allBoxes: MysteryBoxConfig[]): { dailyItems: ShopItem[], dailyMysteryBoxes: MysteryBoxConfig[] } {

    const dailyItems: ShopItem[] = [];
    const dailyMysteryBoxes: MysteryBoxConfig[] = [];

    // Select 5 unique items based on rarity probability
    while (dailyItems.length < 5) {
        const selectedItem = selectRandomByRarity(allItems);
        if (selectedItem && !dailyItems.find(item => item.id === selectedItem.id)) {
            dailyItems.push(selectedItem);
        }
         // Add a safeguard to prevent infinite loops if there are fewer than 5 unique items with defined probabilities
         if (dailyItems.length === allItems.filter(item => RARITY_PROBABILITIES[item.rarity] !== undefined).length) {
              console.warn("Could not find 5 unique items with defined probabilities. Adding all available unique items.");
              break;
         }
    }

    // Select 2 unique mystery boxes based on rarity probability
    while (dailyMysteryBoxes.length < 2) {
        const selectedBox = selectRandomByRarity(allBoxes);
        if (selectedBox && !dailyMysteryBoxes.find(box => box.id === selectedBox.id)) {
            dailyMysteryBoxes.push(selectedBox);
        }
         // Add a safeguard for mystery boxes
         if (dailyMysteryBoxes.length === allBoxes.filter(box => RARITY_PROBABILITIES[box.rarity] !== undefined).length) {
              console.warn("Could not find 2 unique mystery boxes with defined probabilities. Adding all available unique boxes.");
              break;
         }
    }

    console.log("dailyItems (randomly selected):", dailyItems.map(item => item.name));
    console.log("dailyMysteryBoxes (randomly selected):", dailyMysteryBoxes.map(box => box.name));


    return { dailyItems, dailyMysteryBoxes };
}

// --- Function to update the shop inventory for the current day ---
export async function updateDailyShop(): Promise<void> {
    const today = new Date();

     // Generate all possible mystery boxes first (this depends on allAvailableShopItems)
    const allPossibleMysteryBoxes = generateMysteryBoxes(allAvailableShopItems);
     console.log("All possible mystery boxes generated:", allPossibleMysteryBoxes.map(box => box.name));


    // Get the daily selection based on rarity probabilities
    const { dailyItems, dailyMysteryBoxes } = getDailyShopInventory(
        today, // forDate is no longer used in the selection logic, but kept for function signature consistency if needed elsewhere
        allAvailableShopItems,
        allPossibleMysteryBoxes // Use the generated mystery boxes
    );

    console.log(`Updating shop for ${today.toDateString()} with random selection.`);
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


test()