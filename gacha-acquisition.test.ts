/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import {
    parseShopNobuyProductIndexes,
    prettyGuardianMapName,
    projectGachaAcquisitionChannels,
    type GachaAcquisitionChannel,
} from "./gachaAcquisition";
import {
    installDomWindowHarness,
    type DomNode,
} from "./test-support/dom-window-harness";

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

test("prettyGuardianMapName splits CamelCase and keeps Boss as a word", () => {
    expect(prettyGuardianMapName("ArenaBoss")).toBe("Arena Boss");
    expect(prettyGuardianMapName("MachineCityBoss")).toBe("Machine City Boss");
    expect(prettyGuardianMapName("DevaBergBoss")).toBe("Deva Berg Boss");
    expect(prettyGuardianMapName("MachineCity")).toBe("Machine City");
    expect(prettyGuardianMapName("DanceTime")).toBe("Dance Time");
});

test("projectGachaAcquisitionChannels lists shop Gold and every multi-boss stage", () => {
    const channels = projectGachaAcquisitionChannels(
        { ap: false, enabled: true, purchasable: true },
        [
            { kind: "shop", ap: false },
            { kind: "stage", map: "AtlantisBoss", needBoss: true },
            { kind: "stage", map: "MachineCityBoss", needBoss: true },
            { kind: "stage", map: "DanceTimeBoss", needBoss: true },
        ],
    );

    expect(channels).toEqual([
        { kind: "shop", currency: "Gold", available: true },
        {
            kind: "stage",
            map: "AtlantisBoss",
            needBoss: true,
            label: "Boss · Atlantis",
        },
        {
            kind: "stage",
            map: "MachineCityBoss",
            needBoss: true,
            label: "Boss · Machine City",
        },
        {
            kind: "stage",
            map: "DanceTimeBoss",
            needBoss: true,
            label: "Boss · Dance Time",
        },
    ]);
});

test("projectGachaAcquisitionChannels keeps AP shop and non-boss Temple stage", () => {
    const channels = projectGachaAcquisitionChannels(
        { ap: true, enabled: true, purchasable: true },
        [
            { kind: "shop", ap: true },
            { kind: "stage", map: "Temple", needBoss: false },
        ],
    );

    expect(channels).toEqual([
        { kind: "shop", currency: "AP", available: true },
        {
            kind: "stage",
            map: "Temple",
            needBoss: false,
            label: "Temple",
        },
    ]);
});

test("projectGachaAcquisitionChannels marks Nobuy catalog coins as not for sale", () => {
    // Blue Capsule: enabled in API, Nobuy=1 in Shop_Ini3 — cannot purchase.
    const channels = projectGachaAcquisitionChannels(
        { ap: false, enabled: true, purchasable: false },
        [],
    );

    expect(channels).toEqual([
        {
            kind: "shop",
            currency: "Gold",
            available: false,
            reason: "not_for_sale",
        },
    ]);
});

test("projectGachaAcquisitionChannels keeps Not for sale alongside boss stages for Nobuy coins", () => {
    const channels = projectGachaAcquisitionChannels(
        { ap: true, enabled: true, purchasable: false },
        [{ kind: "stage", map: "Temple", needBoss: false }],
    );

    expect(channels).toEqual([
        {
            kind: "shop",
            currency: "AP",
            available: false,
            reason: "not_for_sale",
        },
        {
            kind: "stage",
            map: "Temple",
            needBoss: false,
            label: "Temple",
        },
    ]);
});

test("projectGachaAcquisitionChannels omits disabled shop when stages exist", () => {
    const channels = projectGachaAcquisitionChannels(
        { ap: true, enabled: false, purchasable: false },
        [{ kind: "stage", map: "TempleBoss", needBoss: true }],
    );

    expect(channels).toEqual([
        {
            kind: "stage",
            map: "TempleBoss",
            needBoss: true,
            label: "Boss · Temple",
        },
    ]);
    expect(
        channels.some((channel: GachaAcquisitionChannel) => channel.kind === "shop"),
    ).toBe(false);
});

test("projectGachaAcquisitionChannels keeps unavailable shop when no stages", () => {
    const channels = projectGachaAcquisitionChannels(
        { ap: false, enabled: false, purchasable: false },
        [],
    );

    expect(channels).toEqual([
        {
            kind: "shop",
            currency: "Gold",
            available: false,
            reason: "not_available",
        },
    ]);
});

test("parseShopNobuyProductIndexes extracts Nobuy≠0 product indexes", () => {
    const xml = `
      <Product Index="57837" Enable="1" Nobuy="1" Category="LOTTERY" Name="Blue Capsule"/>
      <Product Index="20002" Enable="1" Nobuy="0" Category="LOTTERY" Name="Fun Coin"/>
      <Product Index="20076" Enable="1" Nobuy="1" Category="LOTTERY" Name="Tossakan Coin"/>
    `;
    const nobuy = parseShopNobuyProductIndexes(xml);
    expect(nobuy.has(57837)).toBe(true);
    expect(nobuy.has(20076)).toBe(true);
    expect(nobuy.has(20002)).toBe(false);
});

test("shipped shop-nobuy-indexes asset covers Blue Capsule and boss lotteries", async () => {
    const { projectJson } = await import("./test-support/ui-contract-fixtures");
    const data = await projectJson<{
        productIndexes: number[];
        count: number;
    }>("./assets/shop-nobuy-indexes.json");

    expect(data.count).toBe(data.productIndexes.length);
    expect(data.productIndexes).toContain(57837); // Blue Capsule
    expect(data.productIndexes).toContain(20086); // Black Scale Set Box
    expect(data.productIndexes).toContain(20076); // Tossakan Coin
    expect(data.productIndexes).toContain(20048); // Dragon Set (Arena boss)
});

test("projectGachaAcquisitionChannels dedupes identical stage maps", () => {
    const channels = projectGachaAcquisitionChannels(
        { ap: false, enabled: true, purchasable: true },
        [
            { kind: "stage", map: "MachineCity", needBoss: false },
            { kind: "stage", map: "MachineCity", needBoss: false },
            { kind: "stage", map: "MachineCityBoss", needBoss: true },
        ],
    );

    expect(
        channels.filter((channel: GachaAcquisitionChannel) => channel.kind === "stage"),
    ).toHaveLength(2);
});

test("gacha source summary renders multi-boss stage chips next to currency", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Gacha,
        GachaItemSource,
        GuardianItemSource,
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
    hat.id = 9001;
    hat.name_en = "Black Scale Hat";
    hat.part = "Hat";
    hat.character = "Niki";
    hat.level = 9;
    hat.str = 12;
    items.set(hat.id, hat);

    // purchasable=false: Shop_Ini3 Nobuy=1 even when catalog enabled.
    const gacha = new Gacha(20086, 87, "Black Scale Set Box", 4000, false, true, false);
    gachas.set(gacha.shop_index, gacha);

    const coin = new Item();
    coin.id = gacha.shop_index;
    coin.name_en = gacha.name;
    shop_items.set(coin.id, coin);
    // No ShopItemSource — purchase is blocked by Nobuy.
    for (const map of ["AtlantisBoss", "MachineCityBoss", "DanceTimeBoss"] as const) {
        coin.sources.push(
            new GuardianItemSource(map, [coin], 4, true, 120),
        );
    }

    hat.sources.push(new GachaItemSource(gacha.shop_index));

    const shoes = new Item();
    shoes.id = 9002;
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

    expect(table.textContent).toContain("Not for sale");
    expect(table.textContent).toContain("Boss · Atlantis");
    expect(table.textContent).toContain("Boss · Machine City");
    expect(table.textContent).toContain("Boss · Dance Time");
    // Must not present a buyable Gold denomination pill.
    expect(table.textContent).not.toContain("Gold · Not available");

    const body = table.tBodies[0];
    expect(body).toBeDefined();
    const rows = body!.children.filter(
        (child): child is DomNode => typeof child !== "string" && child.tagName === "TR",
    );
    const row = rows.find((candidate) => candidate.textContent.includes("Black Scale Hat"));
    expect(row).toBeDefined();
    const bossChips = collectByClass(row!, "gacha-source-channel--boss");
    expect(bossChips).toHaveLength(3);
    expect(collectByClass(row!, "gacha-shop-status--not-for-sale").length).toBeGreaterThanOrEqual(1);
    expect(collectByClass(row!, "gacha-currency--unavailable")).toHaveLength(0);
    expect(collectByClass(row!, "gacha-currency--gold")).toHaveLength(0);
});

test("Blue Capsule style Nobuy gacha never shows buyable Gold or shop cost", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Gacha,
        GachaItemSource,
        Item,
        getResultsTable,
        gachas,
        items,
        shop_items,
    } = itemLookup;

    items.clear();
    shop_items.clear();
    gachas.clear();

    const face = new Item();
    face.id = 10445;
    face.name_en = "JFTSE Modulator(Red)";
    face.part = "Face";
    face.character = "Shua";
    face.level = 30;
    face.str = 4;
    face.hp = 10;
    items.set(face.id, face);

    const gacha = new Gacha(57837, 97, "Blue Capsule", 1000, false, true, false);
    gachas.set(gacha.shop_index, gacha);

    const coin = new Item();
    coin.id = gacha.shop_index;
    coin.name_en = gacha.name;
    shop_items.set(coin.id, coin);
    // Nobuy: no ShopItemSource even though catalog lists a Gold price.

    gacha.add(face, 10, "Shua", 1, 1);
    face.sources.push(new GachaItemSource(gacha.shop_index));

    const shoes = new Item();
    shoes.id = 9103;
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

    expect(table.textContent).toContain("Blue Capsule");
    expect(table.textContent).toContain("Not for sale");
    // Footer must not invent a Gold purchase total from Nobuy catalog price.
    expect(table.textContent).not.toMatch(/1000 Gold|200000 Gold/);
    const body = table.tBodies[0];
    const rows = body!.children.filter(
        (child): child is DomNode => typeof child !== "string" && child.tagName === "TR",
    );
    const row = rows.find((candidate) => candidate.textContent.includes("JFTSE Modulator(Red)"));
    expect(row).toBeDefined();
    expect(collectByClass(row!, "gacha-currency--gold")).toHaveLength(0);
    expect(collectByClass(row!, "gacha-shop-status--not-for-sale").length).toBeGreaterThanOrEqual(1);
    expect(collectByClass(row!, "gacha-currency--unavailable")).toHaveLength(0);
});

test("AP-priced coin with Temple stage shows AP and guardian channel chips", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Gacha,
        GachaItemSource,
        GuardianItemSource,
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
    hat.id = 9101;
    hat.name_en = "Tossakan Hat";
    hat.part = "Hat";
    hat.character = "Lucy";
    hat.level = 8;
    hat.str = 9;
    items.set(hat.id, hat);

    // Tossakan Coin: MINT catalog price + Nobuy — only Temple drop is a real path.
    const gacha = new Gacha(20076, 77, "Tossakan Coin", 400, true, true, false);
    gachas.set(gacha.shop_index, gacha);

    const coin = new Item();
    coin.id = gacha.shop_index;
    coin.name_en = gacha.name;
    shop_items.set(coin.id, coin);
    coin.sources.push(new GuardianItemSource("Temple", [coin], 5, false, -1));

    hat.sources.push(new GachaItemSource(gacha.shop_index));

    const shoes = new Item();
    shoes.id = 9102;
    shoes.name_en = "Plain Shoes";
    shoes.part = "Shoes";
    shoes.character = "Lucy";
    shoes.level = 1;
    items.set(shoes.id, shoes);

    const table = getResultsTable(
        (item) => item.character === "Lucy",
        () => true,
        (current, item) => [...current, item],
        ["Str"],
        "Lucy",
    ) as unknown as DomNode;

    expect(table.textContent).toContain("Not for sale");
    expect(table.textContent).toContain("Temple");
    expect(table.textContent).not.toMatch(/Not available/);
    // Must not imply a live AP purchase for a Nobuy coin.
    expect(collectByClass(
        (() => {
            const body = table.tBodies[0]!;
            const rows = body.children.filter(
                (child): child is DomNode => typeof child !== "string" && child.tagName === "TR",
            );
            return rows.find((candidate) => candidate.textContent.includes("Tossakan Hat"))!;
        })(),
        "gacha-currency--ap",
    )).toHaveLength(0);

    const body = table.tBodies[0];
    const rows = body!.children.filter(
        (child): child is DomNode => typeof child !== "string" && child.tagName === "TR",
    );
    const row = rows.find((candidate) => candidate.textContent.includes("Tossakan Hat"));
    expect(row).toBeDefined();
    expect(collectByClass(row!, "gacha-shop-status--not-for-sale").length).toBeGreaterThanOrEqual(1);
    expect(collectByClass(row!, "gacha-currency--unavailable")).toHaveLength(0);
    expect(collectByClass(row!, "gacha-source-channel--guardian").length).toBeGreaterThanOrEqual(1);
});

function collectByClass(root: DomNode, className: string): DomNode[] {
    const found: DomNode[] = [];
    const walk = (node: DomNode | string) => {
        if (typeof node === "string") {
            return;
        }
        const classes = (node.className || "").split(/\s+/);
        if (classes.includes(className)) {
            found.push(node);
        }
        for (const child of node.children) {
            walk(child);
        }
    };
    walk(root);
    return found;
}
