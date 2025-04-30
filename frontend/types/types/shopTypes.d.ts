export declare enum ItemRarity {
    Mainstream = "mainstream",
    QuiteCommon = "quite-common",
    Uncommon = "uncommon",
    Rare = "rare",
    Special = "special",
    Legendary = "legendary",
    Unique = "unique"
}
export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    rarity: ItemRarity;
    imageUrl?: string;
    type: 'cosmetic' | 'utility' | 'mystery_box' | 'gift' | 'reminder';
}
export interface UserInventory {
    licenseKey: string;
    items: {
        itemId: string;
        quantity: number;
    }[];
}
export interface MysteryBoxConfig {
    id: string;
    name: string;
    cost: number;
    rarity: ItemRarity;
    availableItems: {
        itemId: string;
        probability: number;
    }[];
}
export interface GiftItem extends ShopItem {
    originalItemId: string;
}
