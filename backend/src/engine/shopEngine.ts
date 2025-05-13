// In your backend logic file (where loadShopItems and loadMysteyBoxes are)

import { initializedFirestonAdmin } from "../firebase/firebase";
import { GiftItem, ItemRarity, MysterBoxImageUrls, MysteryBoxConfig, ShopItem } from "../types/shopTypes"; // Adjust import path

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
    "cosmetic_frame_001": "https://i.imgur.com/7QlueQP.jpeg",
    "cosmetic_frame_002": "https://i.imgur.com/gY5iCTk.jpeg",
    "cosmetic_frame_003": "https://i.imgur.com/LBSglFd.jpeg",
    "cosmetic_frame_004": "https://i.imgur.com/Ew9lq63.jpeg",
    "cosmetic_frame_005": "https://i.imgur.com/4Y8CNz6.jpeg",
    "cosmetic_frame_006": "https://i.imgur.com/FuEMe32.png",
    "cosmetic_frame_007": "https://i.imgur.com/S08Qugl.jpeg",


    // Gift Items
    "gift_item": "https://i.imgur.com/SyxGEq3.jpeg",

    // Reminder Items (deleted)
    "reminder_template_001": "url_motiviation_reminder.png",
    "reminder_credit_001": "url_reminder_credit.png",

    // Avatar Items (PLACEHOLDERS - REPLACE WITH ACTUAL HOSTED URLs)
    "avatar_basic_user": "https://i.imgur.com/2829RGJ.jpeg",
    "avatar_smile_face": "https://i.imgur.com/JxjoKy5.jpeg",
    "avatar_smiling_cat": "https://i.imgur.com/8Wx10Ye.jpeg",
    "avatar_cool_dog": "https://i.imgur.com/Va9d8d8.jpeg",
    "avatar_mainstream_girl": "https://i.imgur.com/18URuNf.jpeg",
    "avatar_mainstream_guy": "https://i.imgur.com/QltbsXj.jpeg",
    "avatar_bored_guy": "https://i.imgur.com/edBQeve.jpeg",
    "avatar_bored_girl": "https://i.imgur.com/hnFsbjY.jpeg",
    "avatar_concentrated_guy": "https://i.imgur.com/pwoApri.jpeg",
    "avatar_concentrated_girl": "https://i.imgur.com/ZTFXhUb.jpeg",
    "avatar_nerd_guy": "https://i.imgur.com/kps4f3q.jpeg",
    "avatar_nerd_girl": "https://i.imgur.com/siqB01g.jpeg",
    "avatar_cheeky_monkey": "https://i.imgur.com/5huBNIo.jpeg",
    "avatar_cool_guy": "https://i.imgur.com/QLW9Iyn.jpeg",
    "avatar_cool_girl": "https://i.imgur.com/cf1cXm0.jpeg",
    "avatar_student_girl": "https://i.imgur.com/7wozqKg.jpeg",
    "avatar_student_guy": "https://i.imgur.com/bCnqhsZ.jpeg",
    "avatar_addicted_caffe_guy": "https://i.imgur.com/zKGGUeB.jpeg",
    "avatar_addicted_caffe_girl": "https://i.imgur.com/GXYpARr.jpeg",
    "avatar_chill_guy": "https://i.imgur.com/EqYeMLZ.png",
    "avatar_chill_girl": "https://i.imgur.com/Rgzhq4M.png",
    "avatar_sport_guy": "https://i.imgur.com/qZmvapY.jpeg",
    "avatar_sport_girl": "https://i.imgur.com/TruapTw.jpeg",
    "avatar_mysterious_stranger": "https://i.imgur.com/w9Wf7Ut.jpeg",
    "avatar_eyes": "https://i.imgur.com/C48X4ra.jpeg",
    "avatar_night_girl": "https://i.imgur.com/HWJ9t4v.jpeg",
    "avatar_night_guy": "https://i.imgur.com/W2DTPcR.jpeg",
    "avatar_early_bird_girl": "https://i.imgur.com/Qd6RNAM.jpeg",
    "avatar_early_bird_guy": "https://i.imgur.com/5CJf1BU.jpeg",
    "avatar_zen_cat": "https://i.imgur.com/VH4zYY0.jpeg",
    "avatar_minimalist_girl": "https://i.imgur.com/EIap6MD.jpeg",
    "avatar_minimalist_guy": "https://i.imgur.com/u43e1ZO.jpeg",
    "avatar_shadow": "https://i.imgur.com/hVIy4Lg.jpeg",
    "avatar_robot": "https://i.imgur.com/jhxMMPd.jpeg",
    "avatar_nature_entity": "https://i.imgur.com/nPCoXYj.jpeg",
    "avatar_king_focus": "https://i.imgur.com/Xj35TKZ.jpeg",
    "avatar_task_widzard": "https://i.imgur.com/Z3IwO8H.jpeg",
    "avatar_futurist": "https://i.imgur.com/LuOcAdj.jpeg",
    "avatar_desert_wolf": "https://i.imgur.com/CDw7AI6.jpeg",
    "avatar_lady_noire": "https://i.imgur.com/FZAdmog.jpeg",
    "avatar_hermit": "https://i.imgur.com/LCPtcJm.jpeg",
    "avatar_masked_planned": "https://i.imgur.com/dUb5Cw9.jpeg",
    "avatar_elf": "https://i.imgur.com/aMxYbNk.jpeg",
    "avatar_star_commander": "https://i.imgur.com/tzWyW3X.jpeg",
    "avatar_mind_reader": "https://i.imgur.com/90m9YiC.jpeg",
    "avatar_phoenix": "https://i.imgur.com/EDrqkLr.jpeg",
    "avatar_time_bender": "https://i.imgur.com/Gf2yAAV.jpeg",
    "avatar_cosmic_entity": "https://i.imgur.com/SSoeUON.jpeg",
    "avatar_chrono_panthern": "https://i.imgur.com/ZSmiwjJ.jpeg",
    "avatar_lord_time": "https://i.imgur.com/IfbAqMU.jpeg",
    "avatar_architect": "https://i.imgur.com/ZyDGlO8.jpeg",
    "avatar_oracle": "https://i.imgur.com/P2pQ3sS.jpeg",
    "avatar_little_girl": "https://i.imgur.com/lLzc85f.jpeg",


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

    // Reminder Items (Assuming these are purchasable templates or credits)
    // Note: You might want specific reminder icons
    //{ id: "reminder_template_001", name: "Motiviation Reminder Template", description: "A template for sending motivational reminders.", cost: 50, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["reminder_template_001"], type: "reminder" },
    //{ id: "reminder_credit_001", name: "Custom Reminder Credit", description: "Allows sending one custom reminder to a friend.", cost: 80, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["reminder_credit_001"], type: "reminder" },

    // Avatars (Using URLs from the centralized object)
    // --- Mainstream (15 items) ---
    { id: "avatar_basic_user", name: "Basic User", description: "A simple, default profile icon.", cost: 5, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_basic_user"], type: "avatar" },
    { id: "avatar_smile_face", name: "Smile Face", description: "Smile, sometimes.", cost: 10, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_smile_face"], type: "avatar" },
    { id: "avatar_smiling_cat", name: "Smiling Cat", description: "Who doesn't love a smiling cat?", cost: 20, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_smiling_cat"], type: "avatar" },
    { id: "avatar_cool_dog", name: "Cool Dog", description: "Dogs >> cats and cool dogs >> dogs, that's simple math", cost: 20, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_cool_dog"], type: "avatar" },
    { id: "avatar_mainstream_girl", name: "Mainstream Girl", description: "A standard female profile, a little boring", cost: 20, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_mainstream_girl"], type: "avatar" },
    { id: "avatar_mainstream_guy", name: "Mainstream Guy", description: "A standard male profile, a little boring", cost: 20, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_mainstream_guy"], type: "avatar" },
    { id: "avatar_bored_guy", name: "A Bored Guy", description: "Just a bored guy", cost: 25, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_bored_guy"], type: "avatar" },
    { id: "avatar_bored_girl", name: "A Bored Girl", description: "Just a bored girl", cost: 25, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_bored_girl"], type: "avatar" },
    { id: "avatar_concentrated_guy", name: "A Concentrated Guy", description: "sssh, I'm trying to concentrate", cost: 30, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_concentrated_guy"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_concentrated_girl", name: "A Concentrated Girl", description: "sssh, I'm trying to concentrate", cost: 30, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_concentrated_girl"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_nerd_guy", name: "The Nerd Guy", description: "I like studying and I wear glasses, but that doesn't mean I'm a nerd", cost: 30, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_nerd_guy"], type: "avatar" },
    { id: "avatar_nerd_girl", name: "The Nerd Girl", description: "I like studying and I wear glasses, but that doesn't mean I'm a nerd", cost: 30, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_nerd_girl"], type: "avatar" },
    { id: "avatar_cheeky_monkey", name: "Cheeky Monkey", description: "A playful monkey face.", cost: 40, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_cheeky_monkey"], type: "avatar" },
    { id: "avatar_cool_guy", name: "The (fake) Cool Guy", description: "Where's the party?", cost: 40, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_cool_guy"], type: "avatar" },
    { id: "avatar_cool_girl", name: "The (fake) Cool Girl", description: "Do you think I'm pretty? Of course, everyone thinks so", cost: 40, rarity: ItemRarity.Mainstream, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_cool_girl"], type: "avatar" },

    // --- Quite Common (10 items) ---
    { id: "avatar_student_girl", name: "Sleepy Student Girl", description: "Too many late-night study sessions.", cost: 60, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_student_girl"], type: "avatar" },
    { id: "avatar_student_guy", name: "Sleepy Student Guy", description: "Too many late-night study sessions.", cost: 60, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_student_guy"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_addicted_caffe_guy", name: "Caffeine Addict Guy", description: "Runs on coffee and anxiety.", cost: 60, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_addicted_caffe_guy"], type: "avatar" },
    { id: "avatar_addicted_caffe_girl", name: "Caffeine Addict Girl", description: "Runs on coffee and anxiety.", cost: 60, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_addicted_caffe_girl"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_chill_guy", name: "Just Chillin' Guy", description: "Productivity? Maybe later.", cost: 75, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_chill_guy"], type: "avatar" },
    { id: "avatar_chill_girl", name: "Just Chillin' Girl", description: "Productivity? Maybe later.", cost: 75, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_chill_girl"], type: "avatar" }, // Corrected ID
    { id: "avatar_sport_guy", name: "Sporty Guy", description: "Break time is gym time.", cost: 75, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_sport_guy"], type: "avatar" },
    { id: "avatar_sport_girl", name: "Sporty Girl", description: "Active, focused, unstoppable.", cost: 75, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_sport_girl"], type: "avatar" },
    { id: "avatar_mysterious_stranger", name: "Mysterious Stranger", description: "Nobody really knows him.", cost: 80, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_mysterious_stranger"], type: "avatar" },
    { id: "avatar_eyes", name: "The eyes that know", description: "She knows too much.", cost: 80, rarity: ItemRarity.QuiteCommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_eyes"], type: "avatar" },


    // --- Uncommon (10 items) ---
    { id: "avatar_night_girl", name: "Night Owl Girl", description: "Productive only after midnight.", cost: 100, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_night_girl"], type: "avatar" },
    { id: "avatar_night_guy", name: "Night Owl Guy", description: "Productive only after midnight.", cost: 100, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_night_guy"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_early_bird_girl", name: "Early Bird Girl", description: "Wakes up at 5AM. By choice.", cost: 100, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_early_bird_girl"], type: "avatar" },
    { id: "avatar_early_bird_guy", name: "Early Bird Guy", description: "Wakes up at 5AM. By choice.", cost: 100, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_early_bird_guy"], type: "avatar" }, // Corrected ID, using a new placeholder URL key
    { id: "avatar_zen_cat", name: "Zen Cat", description: "Meditates between tasks.", cost: 115, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_zen_cat"], type: "avatar" },
    { id: "avatar_minimalist_girl", name: "Minimalist Girl", description: "Less is more.", cost: 120, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_minimalist_girl"], type: "avatar" }, // Corrected ID
    { id: "avatar_minimalist_guy", name: "Minimalist Guy", description: "Less is more.", cost: 120, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_minimalist_guy"], type: "avatar" },
    { id: "avatar_shadow", name: "The Shadow", description: "Silent but efficient.", cost: 130, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_shadow"], type: "avatar" }, // Corrected ID
    { id: "avatar_robot", name: "Robot Assistant", description: "Not sentient... yet.", cost: 135, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_robot"], type: "avatar" },
    { id: "avatar_nature_entity", name: "Nature Entity", description: "Feeling the wind", cost: 145, rarity: ItemRarity.Uncommon, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_nature_entity"], type: "avatar" },


    // --- Rare (7 items) ---
    { id: "avatar_king_focus", name: "Knight of Focus", description: "Defender of deadlines.", cost: 200, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_king_focus"], type: "avatar" },
    { id: "avatar_task_widzard", name: "Task Wizard", description: "Turns to-dos into done.", cost: 220, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_task_widzard"], type: "avatar" },
    { id: "avatar_futurist", name: "Futurist", description: "Already planning for next year.", cost: 230, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_futurist"], type: "avatar" },
    { id: "avatar_desert_wolf", name: "Desert Wolf", description: "Alone, but never idle.", cost: 240, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_desert_wolf"], type: "avatar" },
    { id: "avatar_lady_noire", name: "Lady Noir", description: "Elegant, focused, untouchable.", cost: 250, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_lady_noire"], type: "avatar" },
    { id: "avatar_hermit", name: "Mountain Hermit", description: "Lives alone. Works a lot.", cost: 260, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_hermit"], type: "avatar" },
    { id: "avatar_masked_planned", name: "The Masked Planner", description: "Has a plan for everything.", cost: 270, rarity: ItemRarity.Rare, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_masked_planned"], type: "avatar" },


    // --- Special (5 items) ---
    { id: "avatar_elf", name: "Digital Elf", description: "Boosts your motivation with magic.", cost: 400, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_elf"], type: "avatar" },
    { id: "avatar_star_commander", name: "Star Commander", description: "Leads galactic productivity fleets.", cost: 420, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_star_commander"], type: "avatar" },
    { id: "avatar_mind_reader", name: "Mind Reader", description: "Knows your tasks before you do.", cost: 440, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_mind_reader"], type: "avatar" },
    { id: "avatar_phoenix", name: "Phoenix Soul", description: "Rises from procrastination ashes.", cost: 460, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_phoenix"], type: "avatar" },
    { id: "avatar_time_bender", name: "The Time Bender", description: "Can manipulate time... for deadlines.", cost: 480, rarity: ItemRarity.Special, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_time_bender"], type: "avatar" },


    // --- Legendary (3 items) ---
    { id: "avatar_cosmic_entity", name: "Cosmic Entity", description: "A being of immense power.", cost: 2500, rarity: ItemRarity.Legendary, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_cosmic_entity"], type: "avatar" },
    { id: "avatar_chrono_panthern", name: "Chrono Panther", description: "A legendary creature of absolute punctuality.", cost: 3000, rarity: ItemRarity.Legendary, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_chrono_panthern"], type: "avatar" },
    { id: "avatar_lord_time", name: "Lord of Time", description: "Absolute control over chronology.", cost: 2800, rarity: ItemRarity.Legendary, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_lord_time"], type: "avatar" },

    // --- Unique (2 items - Male/Female) ---
    { id: "avatar_architect", name: "The Architect", description: "The master builder of realities.", cost: 5000, rarity: ItemRarity.Unique, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_architect"], type: "avatar" },
    { id: "avatar_oracle", name: "The Oracle", description: "Possessing unparalleled insight.", cost: 5000, rarity: ItemRarity.Unique, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_oracle"], type: "avatar" },
    { id: "avatar_little_girl", name: "The Little Girl", description: "(not) Just a Little Girl.", cost: 5001, rarity: ItemRarity.Unique, imageUrl: ALL_ITEM_IMAGE_URLS["avatar_little_girl"], type: "avatar" },

];




// --- Pool of Mystery Boxes ---


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


function generateMysteryBoxes(allItems: GiftItem[]): MysteryBoxConfig[] {
    const mysteryBoxes: MysteryBoxConfig[] = [];

    // Group items by rarity for easier access
    const itemsByRarity: Record<ItemRarity, GiftItem[]> = allItems.reduce((acc, item) => {
        if (!acc[item.rarity]) {
            acc[item.rarity] = [];
        }
        acc[item.rarity].push(item);
        return acc;
    }, {} as Record<ItemRarity, GiftItem[]>);

    console.log("Items by Rarity:", itemsByRarity);


    // Generate boxes for each rarity
    for (const currentRarity of rarityOrder) {
        const previousRarity = getPreviousRarity(currentRarity);
        const nextRarity = getNextRarity(currentRarity);

        const itemsOfCurrentRarity = itemsByRarity[currentRarity] || [];
        const itemsOfPreviousRarity = previousRarity ? (itemsByRarity[previousRarity] || []) : [];
        const itemsOfNextRarity = nextRarity ? (itemsByRarity[nextRarity] || []) : [];

        // Use the new structure: { item: ShopItem, probability: number }
        const availableItemsInBox: { item: GiftItem; probability: number }[] = [];
        const itemIdsAdded: string[] = []; // Keep track of item IDs added to avoid duplicates


        // --- Select items for the box ---

        // 1. Item from the rarity above (5% probability)
        if (itemsOfNextRarity.length > 0 && currentRarity !== ItemRarity.Unique) {
            const itemFromAbove = shuffleArray(itemsOfNextRarity)[0];
            if (!itemIdsAdded.includes(itemFromAbove.id)) { // Prevent adding duplicate IDs
                availableItemsInBox.push({ item: itemFromAbove, probability: 0.05 });
                itemIdsAdded.push(itemFromAbove.id);
            }
        } else if (currentRarity === ItemRarity.Unique && itemsByRarity[ItemRarity.Legendary]?.length > 0) {
            const itemFromLegendary = shuffleArray(itemsByRarity[ItemRarity.Legendary])[0];
            if (!itemIdsAdded.includes(itemFromLegendary.id)) {
                availableItemsInBox.push({ item: itemFromLegendary, probability: 0.05 });
                itemIdsAdded.push(itemFromLegendary.id);
            }
        }


        // 2. Item from the rarity below (35% probability)
        if (itemsOfPreviousRarity.length > 0 && currentRarity !== ItemRarity.Mainstream) {
            const itemFromBelow = shuffleArray(itemsOfPreviousRarity)[0];
            if (!itemIdsAdded.includes(itemFromBelow.id)) {
                availableItemsInBox.push({ item: itemFromBelow, probability: 0.35 });
                itemIdsAdded.push(itemFromBelow.id);
            }
        } else if (currentRarity === ItemRarity.Mainstream && itemsByRarity[ItemRarity.QuiteCommon]?.length > 0) {
            const itemFromQuiteCommon = shuffleArray(itemsByRarity[ItemRarity.QuiteCommon])[0];
            if (!itemIdsAdded.includes(itemFromQuiteCommon.id)) {
                availableItemsInBox.push({ item: itemFromQuiteCommon, probability: 0.35 });
                itemIdsAdded.push(itemFromQuiteCommon.id);
            }
        }


        // 3. Three random items from the current rarity (20% each, totaling 60%)
        const itemsFromCurrentShuffled = shuffleArray(itemsOfCurrentRarity);
        let currentRarityItemsAddedCount = 0;
        for (const item of itemsFromCurrentShuffled) {
            if (itemIdsAdded.length < 5 && currentRarityItemsAddedCount < 3 && !itemIdsAdded.includes(item.id)) {
                availableItemsInBox.push({ item: item, probability: 0.20 });
                itemIdsAdded.push(item.id);
                currentRarityItemsAddedCount++;
            }
        }

        // --- Adjust probabilities if fewer than 5 items were added ---
        // Distribute remaining probability among added items to sum up to 1
        const totalCurrentProbability = availableItemsInBox.reduce((sum, entry) => sum + entry.probability, 0);

        if (availableItemsInBox.length > 0 && totalCurrentProbability < 1) {
            const remainingProbability = 1 - totalCurrentProbability;
            const probabilityPerItem = remainingProbability / availableItemsInBox.length;

            availableItemsInBox.forEach(entry => {
                entry.probability += probabilityPerItem;
            });
        } else if (availableItemsInBox.length > 0 && totalCurrentProbability > 1) {
            // Should not happen with the current probabilities, but as a safeguard
            console.warn(`Probabilities sum to more than 1 (${totalCurrentProbability}) for ${currentRarity} box. Normalizing.`);
            availableItemsInBox.forEach(entry => {
                entry.probability /= totalCurrentProbability; // Normalize probabilities
            });
        }


        // --- Create the Mystery Box Config ---
        if (availableItemsInBox.length > 0) {
            // Determine the cost of the mystery box (example logic: average cost of contained items * a multiplier)
            const totalCostOfContents = availableItemsInBox.reduce((sum, entry) => sum + entry.item.cost, 0);
            const averageCostOfContents = availableItemsInBox.length > 0 ? totalCostOfContents / availableItemsInBox.length : 0;
            const boxCostMultiplier = getMysteryBoxCostMultiplier(currentRarity);

            const boxCost = Math.round(averageCostOfContents * boxCostMultiplier);
            // Ensure minimum cost
            const finalBoxCost = Math.max(boxCost, getMinimumMysteryBoxCost(currentRarity));

            let image_url = ""
            switch (currentRarity) {
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



function getDailyShopInventory(allItems: GiftItem[], allBoxes: MysteryBoxConfig[]): { dailyItems: GiftItem[], dailyMysteryBoxes: MysteryBoxConfig[] } {

    const dailyItems: GiftItem[] = [];
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

function expandShopItemsWithGifts() {
    let giftItems: GiftItem[] = []
    for (let item of allAvailableShopItems) {
        let relatedGiftItem: GiftItem = {
            ...item,
            name : "Gift "+item.name+" 🎁",
            id: "gift_" + item.id+"originalType:"+item.type,
            originalItemId: item.id,
            type: "gift",
        }

        let itemAsGift: GiftItem = {
            ...item,
            originalItemId: item.id,
        }

        giftItems.push(relatedGiftItem)
        giftItems.push(itemAsGift)
    }

    return giftItems
}

// --- Function to update the shop inventory for the current day ---
export async function updateDailyShop(): Promise<void> {
    const today = new Date();

    const allItemsPlusGifts = expandShopItemsWithGifts()

    // Generate all possible mystery boxes first (this depends on allAvailableShopItems)
    const allPossibleMysteryBoxes = generateMysteryBoxes(allItemsPlusGifts);
    console.log("All possible mystery boxes generated:", allPossibleMysteryBoxes.map(box => box.name));


    // Get the daily selection based on rarity probabilities
    const { dailyItems, dailyMysteryBoxes } = getDailyShopInventory(
        allItemsPlusGifts,
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