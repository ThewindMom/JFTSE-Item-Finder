import { expect, test } from "bun:test";

import { hydrateCatalogState } from "./catalogHydration";
import {
    GuardianItemSource,
    Item,
    ShopItemSource,
    isCharacter,
} from "./itemDomain";
import {
    parseExcludedItemIdToken,
    serializeExcludedItemIds,
} from "./selectionState";
import { catalogFixture } from "./test-support/catalog-fixture";
import { installDomWindowHarness } from "./test-support/dom-window-harness";

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

test("projects filtered equipment in selected ranking order", async () => {
    const restoreDom = installDomWindowHarness();
    try {
        const itemLookup = await import("./itemLookup");
        itemLookup.hydrateCatalog(catalogFixture);

        const slowHat = Object.assign(new Item(), {
            id: 2,
            name_en: "Slow Hat",
            character: "Niki" as const,
            part: "Hat" as const,
            movement: 1,
        });
        const turboHat = Object.assign(new Item(), {
            id: 3,
            name_en: "Turbo Hat",
            character: "Niki" as const,
            part: "Hat" as const,
            movement: 9,
        });
        const ignoredShoes = Object.assign(new Item(), {
            id: 4,
            name_en: "Ignored Shoes",
            character: "Niki" as const,
            part: "Shoes" as const,
            movement: 99,
        });
        itemLookup.items.set(slowHat.id, slowHat);
        itemLookup.items.set(turboHat.id, turboHat);
        itemLookup.items.set(ignoredShoes.id, ignoredShoes);

        const compare = (left: Item, right: Item) =>
            right.movement - left.movement;
        const prioritize = Object.assign(
            (ranked: Item[], item: Item) => [...ranked, item].sort(compare),
            {
                compare,
                sortAll: (candidates: Item[]) => [...candidates].sort(compare),
            },
        );
        const plan = itemLookup.getResultsTablePlan(
            item => item.name_en.endsWith("Hat"),
            () => true,
            prioritize,
            ["Mov Speed"],
            "Niki",
        );
        const rowTexts = Array.from(
            { length: plan.totalRows },
            (_, index) => plan.createRow(index).textContent,
        );

        expect(plan.table.textContent).toContain(
            "Matching equipment globally ranked",
        );
        expect(rowTexts.join(" ")).not.toContain("Ignored Shoes");
        expect(rowTexts[0]).toContain("Turbo Hat");
        expect(rowTexts[1]).toContain("Test Hat");
        expect(rowTexts[2]).toContain("Slow Hat");
    } finally {
        restoreDom();
    }
});
