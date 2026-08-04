import { expect, test } from "bun:test";

import { hydrateCatalogState } from "./catalogHydration";
import {
    GuardianItemSource,
    ShopItemSource,
    isCharacter,
} from "./itemDomain";
import {
    parseExcludedItemIdToken,
    serializeExcludedItemIds,
} from "./selectionState";
import { catalogFixture } from "./test-support/catalog-fixture";

test("hydrates the catalog through dependency-free domain modules", () => {
    const state = hydrateCatalogState(catalogFixture);
    const item = state.items.get(1);

    expect(item?.name_en).toBe("Test Hat");
    expect(item?.sources.some(source => source instanceof ShopItemSource)).toBeTrue();
    expect(item?.sources.some(source => source instanceof GuardianItemSource)).toBeTrue();
    expect(state.gachas.get(200)?.shop_items.get("Niki")?.has(item!)).toBeTrue();
    expect(isCharacter("Niki")).toBeTrue();
    expect(isCharacter("Unknown")).toBeFalse();
});

test("normalizes persisted exclusion identifiers outside the DOM controller", () => {
    expect(parseExcludedItemIdToken(" 42 ")).toBeUndefined();
    expect(parseExcludedItemIdToken("0")).toBe(0);
    expect(parseExcludedItemIdToken("4.2")).toBeUndefined();
    expect(parseExcludedItemIdToken("wat")).toBeUndefined();
    expect(serializeExcludedItemIds(new Set([9, 2, 9]))).toBe("9,2");
});
