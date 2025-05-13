
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

export enum MysterBoxImageUrls {
    Mainstream = 'https://i.imgur.com/leelBQV.jpeg',
    QuiteCommon = 'https://i.imgur.com/r9FQWcy.png',
    Uncommon = 'https://i.imgur.com/n1m83eQ.jpeg',
    Rare = 'https://i.imgur.com/3mO25NY.jpeg',
    Special = 'https://i.imgur.com/hhxk5rk.jpeg',
    Legendary = 'https://i.imgur.com/K2NjeQt.jpeg',
    Unique = 'https://i.imgur.com/yBNMbYQ.jpeg',
}

// Base class for any item in the shop or inventory
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
    rarity: ItemRarity;
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
