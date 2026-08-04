import {
    catalogCharacters,
    catalogParts,
    type CatalogGacha,
    type CatalogItem,
    type CatalogProduct,
    type CatalogStageSource,
    type CatalogV1,
} from "./catalogTypes";

export type { CatalogV1 } from "./catalogTypes";

const itemStringFields = ["name_kr", "name_en", "useType", "resist"] as const;
const itemNumberFields = [
    "id", "maxUse", "level", "str", "sta", "dex", "wil", "hp",
    "quickslots", "buffslots", "smash", "movement", "charge", "lob",
    "serve", "max_str", "max_sta", "max_dex", "max_wil", "spin",
    "atss", "dfss", "socket", "gauge", "gauge_battle",
] as const;
const itemBooleanFields = [
    "hidden", "element_enchantable", "parcel_enabled",
] as const;

function invalid(path: string): never {
    throw new Error(`Invalid catalog: ${path}`);
}

function record(value: unknown, path: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        invalid(`${path} must be an object`);
    }
    return value as Record<string, unknown>;
}

function array(value: unknown, path: string): unknown[] {
    if (!Array.isArray(value)) {
        invalid(`${path} must be an array`);
    }
    return value;
}

function finite(value: unknown, path: string): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        invalid(`${path} must be finite`);
    }
    return value;
}

function integer(value: unknown, path: string): number {
    const result = finite(value, path);
    if (!Number.isSafeInteger(result)) {
        invalid(`${path} must be a safe integer`);
    }
    return result;
}

function text(value: unknown, path: string): string {
    if (typeof value !== "string") {
        invalid(`${path} must be a string`);
    }
    return value;
}

function bool(value: unknown, path: string): boolean {
    if (typeof value !== "boolean") {
        invalid(`${path} must be boolean`);
    }
    return value;
}

function enumValue<T extends string>(
    value: unknown,
    values: readonly T[],
    path: string,
): T {
    if (typeof value !== "string" || !values.includes(value as T)) {
        invalid(`${path} has an unknown value`);
    }
    return value as T;
}

function validateItem(value: unknown, index: number): CatalogItem {
    const path = `items[${index}]`;
    const item = record(value, path);
    for (const field of itemStringFields) {
        text(item[field], `${path}.${field}`);
    }
    for (const field of itemNumberFields) {
        integer(item[field], `${path}.${field}`);
    }
    for (const field of itemBooleanFields) {
        bool(item[field], `${path}.${field}`);
    }
    if (item.character !== null) {
        enumValue(item.character, catalogCharacters, `${path}.character`);
    }
    enumValue(item.part, catalogParts, `${path}.part`);
    return item as CatalogItem;
}

export function parseCatalogV1(value: unknown): CatalogV1 {
    const root = record(value, "root");
    if (root.schemaVersion !== 1) {
        invalid("schemaVersion must be 1");
    }
    const items = array(root.items, "items").map(validateItem);
    const itemIds = new Set<number>();
    for (const item of items) {
        if (itemIds.has(item.id)) {
            invalid(`duplicate item id ${item.id}`);
        }
        itemIds.add(item.id);
    }

    const productIds = new Set<number>();
    const products = array(root.products, "products").map((value, index) => {
        const path = `products[${index}]`;
        const product = record(value, path);
        const productIndex = integer(product.productIndex, `${path}.productIndex`);
        if (productIds.has(productIndex)) {
            invalid(`duplicate product index ${productIndex}`);
        }
        productIds.add(productIndex);
        enumValue(product.kind, ["parts", "lottery"], `${path}.kind`);
        text(product.name, `${path}.name`);
        bool(product.enabled, `${path}.enabled`);
        bool(product.purchasable, `${path}.purchasable`);
        finite(product.price, `${path}.price`);
        bool(product.ap, `${path}.ap`);
        for (const id of array(product.itemIds, `${path}.itemIds`)) {
            if (!itemIds.has(integer(id, `${path}.itemIds[]`))) {
                invalid(`${path}.itemIds contains unknown item ${id}`);
            }
        }
        if (product.gachaIndex !== null) {
            integer(product.gachaIndex, `${path}.gachaIndex`);
        }
        return product as CatalogProduct;
    });

    const gachas = array(root.gachas, "gachas").map((value, index) => {
        const path = `gachas[${index}]`;
        const gacha = record(value, path);
        const productIndex = integer(gacha.productIndex, `${path}.productIndex`);
        if (!productIds.has(productIndex)) {
            invalid(`${path} references unknown product ${productIndex}`);
        }
        for (const [dropIndex, value] of array(gacha.drops, `${path}.drops`).entries()) {
            const dropPath = `${path}.drops[${dropIndex}]`;
            const drop = record(value, dropPath);
            enumValue(drop.character, catalogCharacters, `${dropPath}.character`);
            const shopProductIndex = integer(
                drop.shopProductIndex,
                `${dropPath}.shopProductIndex`,
            );
            if (!productIds.has(shopProductIndex)) {
                invalid(`${dropPath} references unknown product ${shopProductIndex}`);
            }
            finite(drop.probability, `${dropPath}.probability`);
            const min = integer(drop.quantityMin, `${dropPath}.quantityMin`);
            const max = integer(drop.quantityMax, `${dropPath}.quantityMax`);
            if (min > max) {
                invalid(`${dropPath} quantity range is inverted`);
            }
        }
        return gacha as CatalogGacha;
    });

    const stageSources = array(root.stageSources, "stageSources")
        .map((value, index) => {
            const path = `stageSources[${index}]`;
            const source = record(value, path);
            const attached = integer(
                source.attachedProductIndex,
                `${path}.attachedProductIndex`,
            );
            if (!productIds.has(attached)) {
                invalid(`${path} references unknown product ${attached}`);
            }
            for (const product of array(
                source.rewardProductIndexes,
                `${path}.rewardProductIndexes`,
            )) {
                const id = integer(product, `${path}.rewardProductIndexes[]`);
                if (!productIds.has(id)) {
                    invalid(`${path} reward references unknown product ${id}`);
                }
            }
            text(source.map, `${path}.map`);
            finite(source.xp, `${path}.xp`);
            bool(source.needBoss, `${path}.needBoss`);
            finite(source.bossTime, `${path}.bossTime`);
            return source as CatalogStageSource;
        });

    const art = record(root.art, "art");
    record(art.item, "art.item");
    record(art.map, "art.map");
    record(art.stageBoss, "art.stageBoss");
    record(art.boss, "art.boss");
    return { schemaVersion: 1, items, products, gachas, stageSources, art } as CatalogV1;
}
