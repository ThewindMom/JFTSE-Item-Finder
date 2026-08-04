import type { CatalogProduct } from "../catalogTypes";

const numericFields = [
    "productIndex", "display", "use0", "use1", "use2",
    "oldPrice0", "oldPrice1", "oldPrice2", "price0", "price1", "price2",
    "couplePrice", "goldBack", "forPlayer",
    "item0", "item1", "item2", "item3", "item4",
    "item5", "item6", "item7", "item8", "item9",
] as const;
const booleanFields = ["hitDisplay", "enabled", "enableParcel"] as const;
const stringFields = ["useType", "priceType", "category", "name"] as const;

function object(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : undefined;
}

function isRuntimeShopProduct(value: Record<string, unknown>): boolean {
    return numericFields.every(field => typeof value[field] === "number")
        && booleanFields.every(field => typeof value[field] === "boolean")
        && stringFields.every(field => typeof value[field] === "string");
}

export function parseCatalogProducts(
    pages: readonly unknown[],
    itemIds: ReadonlySet<number>,
    nobuy: ReadonlySet<number>,
): CatalogProduct[] {
    const products: CatalogProduct[] = [];
    for (const page of pages) {
        if (!Array.isArray(page)) {
            throw new Error("Invalid shop page");
        }
        for (const input of page) {
            const value = object(input);
            if (!value || !isRuntimeShopProduct(value)) {
                continue;
            }
            const category = value.category as string;
            if (category !== "PARTS" && category !== "LOTTERY") {
                continue;
            }
            const productIndex = value.productIndex as number;
            const enabled = value.enabled as boolean;
            const ids = Array.from({ length: 10 }, (_, index) =>
                value[`item${index}`] as number
            ).filter(id => id !== 0 && itemIds.has(id));
            products.push({
                productIndex,
                kind: category === "PARTS" ? "parts" : "lottery",
                name: value.name as string,
                enabled,
                purchasable: enabled && !nobuy.has(productIndex),
                price: value.price0 as number,
                ap: value.priceType === "MINT",
                itemIds: ids,
                gachaIndex: category === "LOTTERY"
                    ? value.item0 as number
                    : null,
            });
        }
    }
    return products.sort((lhs, rhs) => lhs.productIndex - rhs.productIndex);
}
