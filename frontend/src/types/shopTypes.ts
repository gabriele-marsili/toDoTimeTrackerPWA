
// Define item rarities
export enum ItemRarity {
    Mainstream = 'mainstream',
    QuiteCommon = 'quite-common',
    Uncommon = 'uncommon',
    Rare = 'rare',
    Special = 'special',
    Legendary = 'legendary',
    Unique = 'unique',
}

// Base class for any item in the shop or inventory
export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number; // in Karma Points
    rarity: ItemRarity;
    imageUrl?: string; // Optional image for the item
    type: 'cosmetic' | 'utility' | 'mystery_box' | 'gift' | 'reminder' | 'avatar'; // Categorize item types
    // Add other properties specific to item type if needed
}

// Interface for user inventory
export interface UserInventory {
    licenseKey: string;
    items: {
        itemId: string;
        quantity: number;
        // Potentially add acquisition date or other relevant info
    }[];
}

// Interface for a Mystery Box configuration
export interface MysteryBoxConfig {
    id: string;
    name: string;
    cost: number; // in Karma Points
    rarity: ItemRarity; // Rarity of the box itself
    imageUrl : string;
    availableItems: {
        itemId: string;
        probability: number; // Probability of getting this item (0 to 1)
    }[];
}

// Interface for a Gift
export interface GiftItem extends ShopItem {
    originalItemId: string; // The ID of the item being gifted
}
