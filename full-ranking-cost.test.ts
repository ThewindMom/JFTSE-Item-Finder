/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import {
    installDomWindowHarness,
    type DomNode,
} from "./test-support/dom-window-harness";

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

test("footer Total cost aggregates best-per-slot only while body keeps full ranking", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Item,
        ShopItemSource,
        getResultsTable,
        items,
        shop_items,
    } = itemLookup;
    type GameItem = InstanceType<typeof Item>;
    type GamePart = GameItem["part"];
    type GameCharacter = NonNullable<GameItem["character"]>;

    items.clear();
    shop_items.clear();

    const makePricedItem = (
        id: number,
        name: string,
        part: GamePart,
        character: GameCharacter,
        level: number,
        str: number,
        gold: number,
    ) => {
        const item = new Item();
        item.id = id;
        item.name_en = name;
        item.part = part;
        item.character = character;
        item.level = level;
        item.str = str;

        const shopId = 50_000 + id;
        const shopItem = new Item();
        shopItem.id = shopId;
        shopItem.name_en = `${name} product`;
        shop_items.set(shopId, shopItem);
        item.sources.push(new ShopItemSource(shopId, gold, false, [item]));
        items.set(id, item);
        return item;
    };

    // Same slot: cheap best vs expensive worse. Footer must not buy both.
    makePricedItem(1, "Best Hat", "Hat", "Niki", 10, 50, 100);
    makePricedItem(2, "Expensive Bad Hat", "Hat", "Niki", 5, 10, 5000);
    // Second slot contributes its sole (best) candidate.
    makePricedItem(3, "Solid Shoes", "Shoes", "Niki", 8, 0, 200);
    // Unrelated character must not appear when filtering to Niki.
    makePricedItem(4, "Lucy Only Cap", "Hat", "Lucy", 99, 99, 9);

    const priorizer = (current: GameItem[], item: GameItem): GameItem[] =>
        [...current, item].sort((a, b) => b.str - a.str);

    const table = getResultsTable(
        (item) => item.character === "Niki",
        () => true,
        priorizer,
        ["Str"],
        "Niki",
    ) as unknown as DomNode;

    const body = table.tBodies[0];
    expect(body).toBeDefined();
    const bodyRows = body.children.filter(
        (child): child is DomNode => typeof child !== "string" && child.tagName === "TR",
    );
    const bodyText = bodyRows.map((row) => row.textContent);

    // Full ranking still renders every eligible Niki candidate (2 hats + shoes).
    expect(bodyRows).toHaveLength(3);
    expect(bodyText.some((text) => text.includes("Best Hat"))).toBe(true);
    expect(bodyText.some((text) => text.includes("Expensive Bad Hat"))).toBe(true);
    expect(bodyText.some((text) => text.includes("Solid Shoes"))).toBe(true);
    expect(bodyText.some((text) => text.includes("Lucy Only Cap"))).toBe(false);

    const totals = table.getElementsByClassName("total");
    expect(totals.length).toBeGreaterThan(0);
    const totalSource = totals
        .map((cell) => cell.textContent.trim())
        .find((text) => text.includes("Gold") || text.includes("AP"));
    expect(totalSource).toBeDefined();

    // Stats already use result[0] (best hat Str=50). Cost must match that set:
    // best hat 100 Gold + shoes 200 Gold = 300 Gold — not catalog sum 5300.
    const expectedBestPerSlotGold = 100 + 200;
    const catalogGold = 100 + 5000 + 200;
    expect(totalSource).toBe(`${expectedBestPerSlotGold} Gold`);
    expect(totalSource).not.toBe(`${catalogGold} Gold`);

    const totalStr = totals
        .map((cell) => cell.textContent.trim())
        .find((text) => text === "50");
    expect(totalStr).toBe("50");
});

test("footer Total cost picks min multi-source cost independent of source order", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Item,
        ShopItemSource,
        getResultsTable,
        items,
        shop_items,
    } = itemLookup;
    type GameItem = InstanceType<typeof Item>;
    type GamePart = GameItem["part"];
    type GameCharacter = NonNullable<GameItem["character"]>;

    items.clear();
    shop_items.clear();

    const attachShopSource = (item: GameItem, shopId: number, price: number, ap: boolean) => {
        const shopItem = new Item();
        shopItem.id = shopId;
        shopItem.name_en = `${item.name_en} product ${shopId}`;
        shop_items.set(shopId, shopItem);
        item.sources.push(new ShopItemSource(shopId, price, ap, [item]));
    };

    const makeItem = (
        id: number,
        name: string,
        part: GamePart,
        character: GameCharacter,
        level: number,
        str: number,
    ) => {
        const item = new Item();
        item.id = id;
        item.name_en = name;
        item.part = part;
        item.character = character;
        item.level = level;
        item.str = str;
        items.set(id, item);
        return item;
    };

    // Cheaper Gold source first, expensive second. Old minCost always kept cost2
    // (last source), so order-first cheap must fail before the comparator fix.
    const multiHat = makeItem(10, "Multi Source Hat", "Hat", "Niki", 10, 40);
    attachShopSource(multiHat, 50_010, 100, false); // cheaper Gold, first
    attachShopSource(multiHat, 50_011, 900, false); // expensive Gold, last

    // Sole shoes source anchors a second slot so the footer still renders.
    const shoes = makeItem(11, "Plain Shoes", "Shoes", "Niki", 5, 0);
    attachShopSource(shoes, 50_012, 50, false);

    const priorizer = (current: GameItem[], item: GameItem): GameItem[] =>
        [...current, item].sort((a, b) => b.str - a.str);

    const tableCheapFirst = getResultsTable(
        (item) => item.character === "Niki",
        () => true,
        priorizer,
        ["Str"],
        "Niki",
    ) as unknown as DomNode;

    const totalCheapFirst = tableCheapFirst
        .getElementsByClassName("total")
        .map((cell) => cell.textContent.trim())
        .find((text) => text.includes("Gold") || text.includes("AP"));

    // Min of hat sources is 100 Gold, plus shoes 50 Gold.
    // Pre-fix always-last minCost would report 900 + 50 = 950 Gold.
    expect(totalCheapFirst).toBe("150 Gold");
    expect(totalCheapFirst).not.toBe("950 Gold");

    // Reverse hat source order: expensive first, cheap last.
    // Footer must stay on the true min (order-independent), not flip with push order.
    items.clear();
    shop_items.clear();

    const multiHatReversed = makeItem(20, "Multi Source Hat Rev", "Hat", "Niki", 10, 40);
    attachShopSource(multiHatReversed, 50_020, 900, false); // expensive first
    attachShopSource(multiHatReversed, 50_021, 100, false); // cheaper last

    const shoes2 = makeItem(21, "Plain Shoes Rev", "Shoes", "Niki", 5, 0);
    attachShopSource(shoes2, 50_022, 50, false);

    const tableCheapLast = getResultsTable(
        (item) => item.character === "Niki",
        () => true,
        priorizer,
        ["Str"],
        "Niki",
    ) as unknown as DomNode;

    const totalCheapLast = tableCheapLast
        .getElementsByClassName("total")
        .map((cell) => cell.textContent.trim())
        .find((text) => text.includes("Gold") || text.includes("AP"));

    expect(totalCheapLast).toBe("150 Gold");

    // AP-then-Gold lexicographic order: 0 AP / 9999 Gold beats 1 AP / 0 Gold.
    // Push the true min first and the worse AP source last so always-last diverges.
    items.clear();
    shop_items.clear();

    const apHat = makeItem(30, "AP Priority Hat", "Hat", "Niki", 10, 40);
    attachShopSource(apHat, 50_030, 9999, false); // true min (0 AP, 9999 Gold), first
    attachShopSource(apHat, 50_031, 1, true); // worse by AP (1 AP), last

    const shoes3 = makeItem(31, "AP Priority Shoes", "Shoes", "Niki", 5, 0);
    attachShopSource(shoes3, 50_032, 0, false);

    const tableApPriority = getResultsTable(
        (item) => item.character === "Niki",
        () => true,
        priorizer,
        ["Str"],
        "Niki",
    ) as unknown as DomNode;

    const totalApPriority = tableApPriority
        .getElementsByClassName("total")
        .map((cell) => cell.textContent.trim())
        .find((text) => text.includes("Gold") || text.includes("AP"));

    expect(totalApPriority).toBe("9999 Gold");
    expect(totalApPriority).not.toBe("1 AP");
});
