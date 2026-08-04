/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import {
    installDomWindowHarness,
    type DomNode,
} from "./test-support/dom-window-harness";
import { projectFile } from "./test-support/ui-contract-fixtures";

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

function sourceCellChildren(table: DomNode, itemName: string): Array<DomNode | string> {
    const body = table.tBodies[0];
    expect(body).toBeDefined();
    const rows = body.children.filter(
        (child): child is DomNode => typeof child !== "string" && child.tagName === "TR",
    );
    const row = rows.find((candidate) => candidate.textContent.includes(itemName));
    expect(row).toBeDefined();
    const sourceCell = row!.children.find(
        (child): child is DomNode =>
            typeof child !== "string"
            && child.tagName === "TD"
            && (child.className || "").split(/\s+/).includes("Source_column"),
    );
    expect(sourceCell).toBeDefined();
    return sourceCell!.children;
}

test("makeSourcesList no longer inserts unconditional comma between every source group", async () => {
    const renderer = await projectFile("./itemLookup.ts");
    const makeSourcesList = renderer.match(
        /function makeSourcesList\([\s\S]*?\n\}/,
    )?.[0];
    expect(makeSourcesList).toBeDefined();

    // Given/When/Then: old bug always joined groups with ", " via `if (!first) add(", ")`.
    expect(makeSourcesList!).not.toMatch(
        /if\s*\(\s*!first\s*\)\s*\{\s*add\(\s*", "\s*\)\s*;\s*\}/,
    );
    // Shop/set/guardian multi-sources use a comma; gacha cards are excluded via isGachaSourceGroup.
    expect(makeSourcesList!).toContain('", "');
    expect(makeSourcesList!).toContain("isGachaSourceGroup");
});

test("multi-gacha Source column stacks cards without comma text nodes", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Gacha,
        GachaItemSource,
        Item,
        ShopItemSource,
        getResultsTable,
        gachas,
        items,
        shop_items,
    } = itemLookup;

    items.clear();
    shop_items.clear();
    gachas.clear();

    const hat = new Item();
    hat.id = 6488;
    hat.name_en = "Devil Horn";
    hat.part = "Hat";
    hat.character = "Shua";
    hat.level = 9;
    hat.str = 7;
    items.set(hat.id, hat);

    const gachaA = new Gacha(90_001, 19, "Angel, Devil Coin", 3000, false, true);
    const gachaB = new Gacha(90_002, 12, "Head G Coin", 3000, false, true);
    gachas.set(gachaA.shop_index, gachaA);
    gachas.set(gachaB.shop_index, gachaB);
    gachaA.add(hat, 10, "Shua", 1, 1);
    gachaB.add(hat, 10, "Shua", 1, 1);

    // GachaItemSource.item resolves the coin product via shop_items.
    const coinA = new Item();
    coinA.id = gachaA.shop_index;
    coinA.name_en = gachaA.name;
    shop_items.set(coinA.id, coinA);
    coinA.sources.push(new ShopItemSource(coinA.id, gachaA.price, false, []));

    const coinB = new Item();
    coinB.id = gachaB.shop_index;
    coinB.name_en = gachaB.name;
    shop_items.set(coinB.id, coinB);
    coinB.sources.push(new ShopItemSource(coinB.id, gachaB.price, false, []));

    hat.sources.push(new GachaItemSource(gachaA.shop_index));
    hat.sources.push(new GachaItemSource(gachaB.shop_index));

    // Second slot so the results table still builds a full ranking layout.
    const shoes = new Item();
    shoes.id = 7001;
    shoes.name_en = "Plain Shoes";
    shoes.part = "Shoes";
    shoes.character = "Shua";
    shoes.level = 1;
    items.set(shoes.id, shoes);

    const table = getResultsTable(
        (item) => item.character === "Shua",
        () => true,
        (current, item) => [...current, item],
        ["Str"],
        "Shua",
    ) as unknown as DomNode;

    const children = sourceCellChildren(table, "Devil Horn");
    const gachaCards = children.filter(
        (child): child is DomNode =>
            typeof child !== "string"
            && (child.className || "").split(/\s+/).includes("gacha-source-summary"),
    );
    expect(gachaCards).toHaveLength(2);

    const commaTextNodes = children.filter(
        (child) => typeof child === "string" && child.includes(","),
    );
    expect(commaTextNodes).toEqual([]);

    // Names still present without relying on a comma-joined label string.
    expect(table.textContent).toContain("Angel, Devil Coin");
    expect(table.textContent).toContain("Head G Coin");
});

test("multi plain-text shop sources still join with a comma", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Item,
        ShopItemSource,
        getResultsTable,
        gachas,
        items,
        shop_items,
    } = itemLookup;

    items.clear();
    shop_items.clear();
    gachas.clear();

    const hat = new Item();
    hat.id = 10;
    hat.name_en = "Multi Shop Hat";
    hat.part = "Hat";
    hat.character = "Niki";
    hat.level = 5;
    hat.str = 10;
    items.set(hat.id, hat);

    const shopA = new Item();
    shopA.id = 50_010;
    shopA.name_en = "Shop A";
    shop_items.set(shopA.id, shopA);
    hat.sources.push(new ShopItemSource(shopA.id, 100, false, [hat]));

    const shopB = new Item();
    shopB.id = 50_011;
    shopB.name_en = "Shop B";
    shop_items.set(shopB.id, shopB);
    hat.sources.push(new ShopItemSource(shopB.id, 250, false, [hat]));

    const shoes = new Item();
    shoes.id = 11;
    shoes.name_en = "Plain Shoes";
    shoes.part = "Shoes";
    shoes.character = "Niki";
    shoes.level = 1;
    items.set(shoes.id, shoes);

    const table = getResultsTable(
        (item) => item.character === "Niki",
        () => true,
        (current, item) => [...current, item],
        ["Str"],
        "Niki",
    ) as unknown as DomNode;

    const children = sourceCellChildren(table, "Multi Shop Hat");
    const joined = children
        .map((child) => (typeof child === "string" ? child : child.textContent))
        .join("");
    expect(joined).toContain("100 Gold, 250 Gold");
});

test("plain shop + set shop join with comma, not jammed prices", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Item,
        ShopItemSource,
        getResultsTable,
        gachas,
        items,
        shop_items,
    } = itemLookup;

    items.clear();
    shop_items.clear();
    gachas.clear();

    const hat = new Item();
    hat.id = 20;
    hat.name_en = "Supporter Hat";
    hat.part = "Hat";
    hat.character = "LunLun";
    hat.level = 5;
    hat.str = 8;
    items.set(hat.id, hat);

    const shoesInSet = new Item();
    shoesInSet.id = 21;
    shoesInSet.name_en = "Supporter Shoes";
    shoesInSet.part = "Shoes";
    shoesInSet.character = "LunLun";
    shoesInSet.level = 5;
    items.set(shoesInSet.id, shoesInSet);

    // Solo buy path: plain "50000 Gold"
    const soloProduct = new Item();
    soloProduct.id = 60_001;
    soloProduct.name_en = "Supporter Hat Solo";
    shop_items.set(soloProduct.id, soloProduct);
    hat.sources.push(new ShopItemSource(soloProduct.id, 50_000, false, [hat]));

    // Set buy path: popup "Supporter Set" + " 350000 Gold"
    const setProduct = new Item();
    setProduct.id = 60_002;
    setProduct.name_en = "Supporter Set";
    shop_items.set(setProduct.id, setProduct);
    hat.sources.push(
        new ShopItemSource(setProduct.id, 350_000, false, [hat, shoesInSet]),
    );

    const table = getResultsTable(
        (item) => item.character === "LunLun",
        () => true,
        (current, item) => [...current, item],
        ["Str"],
        "LunLun",
    ) as unknown as DomNode;

    const children = sourceCellChildren(table, "Supporter Hat");
    const joined = children
        .map((child) => (typeof child === "string" ? child : child.textContent))
        .join("");

    // Two prices are real acquisition paths; comma separates them so they do not run together.
    expect(joined).toContain("50000 Gold, ");
    expect(joined).toContain("Supporter Set");
    expect(joined).toContain("350000 Gold");
    expect(joined).toMatch(/50000 Gold,\s*Supporter Set\s*350000 Gold/);
    // Must not jam plain price into the set button with zero separator.
    expect(joined).not.toMatch(/50000 GoldSupporter Set/);
});

test("shop + gacha still omits comma text next to gacha cards", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Gacha,
        GachaItemSource,
        Item,
        ShopItemSource,
        getResultsTable,
        gachas,
        items,
        shop_items,
    } = itemLookup;

    items.clear();
    shop_items.clear();
    gachas.clear();

    const hat = new Item();
    hat.id = 30;
    hat.name_en = "Mixed Source Hat";
    hat.part = "Hat";
    hat.character = "Shua";
    hat.level = 4;
    hat.str = 5;
    items.set(hat.id, hat);

    const soloProduct = new Item();
    soloProduct.id = 70_001;
    soloProduct.name_en = "Mixed Solo";
    shop_items.set(soloProduct.id, soloProduct);
    hat.sources.push(new ShopItemSource(soloProduct.id, 1200, false, [hat]));

    const gacha = new Gacha(90_010, 5, "Lucky Coin", 3000, false, true);
    gachas.set(gacha.shop_index, gacha);
    gacha.add(hat, 10, "Shua", 1, 1);
    const coin = new Item();
    coin.id = gacha.shop_index;
    coin.name_en = gacha.name;
    shop_items.set(coin.id, coin);
    coin.sources.push(new ShopItemSource(coin.id, gacha.price, false, []));
    hat.sources.push(new GachaItemSource(gacha.shop_index));

    const shoes = new Item();
    shoes.id = 31;
    shoes.name_en = "Plain Shoes";
    shoes.part = "Shoes";
    shoes.character = "Shua";
    shoes.level = 1;
    items.set(shoes.id, shoes);

    const table = getResultsTable(
        (item) => item.character === "Shua",
        () => true,
        (current, item) => [...current, item],
        ["Str"],
        "Shua",
    ) as unknown as DomNode;

    const children = sourceCellChildren(table, "Mixed Source Hat");
    const gachaCards = children.filter(
        (child): child is DomNode =>
            typeof child !== "string"
            && (child.className || "").split(/\s+/).includes("gacha-source-summary"),
    );
    expect(gachaCards).toHaveLength(1);

    // No comma text nodes adjacent to gacha card layout (block cards separate themselves).
    const commaTextNodes = children.filter(
        (child) => typeof child === "string" && child.includes(","),
    );
    expect(commaTextNodes).toEqual([]);
    expect(table.textContent).toContain("1200 Gold");
    expect(table.textContent).toContain("Lucky Coin");
});
