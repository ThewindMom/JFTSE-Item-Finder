import type { MapArtCatalog } from "./gachaAcquisition";
import type { StageBossCatalog } from "./stageBosses";

export const catalogCharacters = [
    "Niki", "LunLun", "Lucy", "Shua", "Dhanpir", "Pochi", "Al",
] as const;
export type CatalogCharacter = typeof catalogCharacters[number];

export const catalogParts = [
    "Hat", "Hair", "Dye", "Upper", "Lower", "Shoes", "Socks",
    "Hand", "Backpack", "Face", "Racket", "Other",
] as const;
export type CatalogPart = typeof catalogParts[number];

export type CatalogItem = {
    id: number;
    name_kr: string;
    name_en: string;
    useType: string;
    maxUse: number;
    hidden: boolean;
    resist: string;
    character: CatalogCharacter | null;
    part: CatalogPart;
    level: number;
    str: number;
    sta: number;
    dex: number;
    wil: number;
    hp: number;
    quickslots: number;
    buffslots: number;
    smash: number;
    movement: number;
    charge: number;
    lob: number;
    serve: number;
    max_str: number;
    max_sta: number;
    max_dex: number;
    max_wil: number;
    element_enchantable: boolean;
    parcel_enabled: boolean;
    spin: number;
    atss: number;
    dfss: number;
    socket: number;
    gauge: number;
    gauge_battle: number;
};

export type CatalogProduct = {
    productIndex: number;
    kind: "parts" | "lottery";
    name: string;
    enabled: boolean;
    purchasable: boolean;
    price: number;
    ap: boolean;
    itemIds: number[];
    gachaIndex: number | null;
};

export type CatalogGacha = {
    productIndex: number;
    drops: {
        character: CatalogCharacter;
        shopProductIndex: number;
        probability: number;
        quantityMin: number;
        quantityMax: number;
    }[];
};

export type CatalogStageSource = {
    attachedProductIndex: number;
    rewardProductIndexes: number[];
    map: string;
    xp: number;
    needBoss: boolean;
    bossTime: number;
};

export type CatalogItemArt = {
    items: Record<string, [sheet: string, cell: number]>;
    lotteries: Record<string, {
        sheet: string;
        cell: number;
        color: string;
        shape: "coin" | "cube" | "token";
    }>;
    sheets: Record<string, {
        lineCount: number;
        size: number;
        space: number;
        width: number;
    }>;
};

export type CatalogV1 = {
    schemaVersion: 1;
    items: CatalogItem[];
    products: CatalogProduct[];
    gachas: CatalogGacha[];
    stageSources: CatalogStageSource[];
    art: {
        item: CatalogItemArt;
        map: MapArtCatalog;
        stageBoss: StageBossCatalog;
        boss: Readonly<Record<string, unknown>>;
    };
};
