
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

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number; // in Karma Points
    rarity: ItemRarity;
    imageUrl?: string; 
    type: 'cosmetic' | 'utility' | 'mystery_box' | 'gift' | 'reminder' | 'avatar'; 
}

// Interface for user inventory
export interface UserInventory {
    licenseKey: string;
    items: {
        item: ShopItem;
        quantity: number;
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
        item: ShopItem;
        probability: number; // Probability of getting this item (0 to 1)
    }[];
}

// Interface for a Gift
export interface GiftItem extends ShopItem {
    originalItemId: string; // The ID of the item being gifted
}
