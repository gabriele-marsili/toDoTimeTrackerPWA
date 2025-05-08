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
    type: 'cosmetic' | 'utility' | 'mystery_box' | 'gift' | 'reminder' | 'avatar';
}
export interface UserInventory {
    licenseKey: string;
    items: {
        item: ShopItem;
        quantity: number;
    }[];
}
export interface MysteryBoxConfig {
    id: string;
    name: string;
    cost: number;
    rarity: ItemRarity;
    imageUrl: string;
    availableItems: {
        item: ShopItem;
        probability: number;
    }[];
}
export interface GiftItem extends ShopItem {
    originalItemId: string;
}
