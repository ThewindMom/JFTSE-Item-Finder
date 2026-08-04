import { parseCatalogV1 } from "./catalog";
import type { CatalogV1 } from "./catalogTypes";
import {
    Gacha,
    GachaItemSource,
    GuardianItemSource,
    Item,
    ShopItemSource,
    type ItemDomainState,
} from "./itemDomain";

export type HydratedCatalog = ItemDomainState & {
    readonly art: CatalogV1["art"];
};

export function hydrateCatalogState(input: unknown): HydratedCatalog {
    const catalog = parseCatalogV1(input);
    const items = new Map<number, Item>();
    const shopItems = new Map<number, Item>();
    const gachas = new Map<number, Gacha>();
    const products = new Map(
        catalog.products.map(product => [product.productIndex, product]),
    );

    for (const value of catalog.items) {
        const { character, ...fields } = value;
        const item = Object.assign(new Item(), fields);
        item.character = character ?? undefined;
        items.set(item.id, item);
    }

    for (const product of catalog.products) {
        const innerItems = product.itemIds.map(id => {
            const item = items.get(id);
            if (!item) {
                throw new Error(
                    `Catalog product ${product.productIndex} references item ${id}`,
                );
            }
            return item;
        });
        if (product.kind === "parts" && innerItems.length === 1) {
            const item = innerItems[0];
            shopItems.set(product.productIndex, item);
            continue;
        }
        const productItem = new Item();
        productItem.id = product.productIndex;
        productItem.name_en = product.name;
        shopItems.set(product.productIndex, productItem);
    }

    for (const product of catalog.products) {
        if (!product.purchasable) {
            continue;
        }
        const innerItems = product.itemIds.map(id => {
            const item = items.get(id);
            if (!item) {
                throw new Error(
                    `Catalog product ${product.productIndex} references item ${id}`,
                );
            }
            return item;
        });
        const source = new ShopItemSource(
            product.productIndex,
            product.price,
            product.ap,
            innerItems,
        );
        if (product.kind === "parts") {
            for (const item of innerItems) {
                item.sources.push(source);
            }
        }
        const productItem = shopItems.get(product.productIndex);
        if (product.kind === "lottery" && productItem) {
            productItem.sources.push(source);
        }
    }

    for (const value of catalog.gachas) {
        const product = products.get(value.productIndex);
        if (!product || product.gachaIndex === null) {
            throw new Error(
                `Catalog gacha ${value.productIndex} has no product definition`,
            );
        }
        const gacha = new Gacha(
            product.productIndex,
            product.gachaIndex,
            product.name,
            product.price,
            product.ap,
            product.enabled,
            product.purchasable,
        );
        for (const drop of value.drops) {
            const item = shopItems.get(drop.shopProductIndex);
            if (!item) {
                throw new Error(
                    `Catalog gacha ${value.productIndex} references product `
                    + drop.shopProductIndex,
                );
            }
            gacha.add(
                item,
                drop.probability,
                drop.character,
                drop.quantityMin,
                drop.quantityMax,
            );
        }
        for (const characterItems of gacha.shop_items.values()) {
            for (const item of characterItems.keys()) {
                item.sources.push(new GachaItemSource(gacha.shop_index));
            }
        }
        gachas.set(gacha.shop_index, gacha);
    }

    for (const value of catalog.stageSources) {
        const attached = shopItems.get(value.attachedProductIndex);
        if (!attached) {
            throw new Error(
                `Catalog stage source references product `
                + value.attachedProductIndex,
            );
        }
        const rewards = value.rewardProductIndexes.map(id => {
            const item = shopItems.get(id);
            if (!item) {
                throw new Error(`Catalog stage reward references product ${id}`);
            }
            return item;
        });
        attached.sources.push(new GuardianItemSource(
            value.map,
            rewards,
            value.xp,
            value.needBoss,
            value.bossTime,
        ));
    }

    return { items, shopItems, gachas, art: catalog.art };
}
