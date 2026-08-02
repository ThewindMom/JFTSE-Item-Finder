/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import {
    installDomWindowHarness,
    type DomNode,
} from "./test-support/dom-window-harness";
import { projectJson } from "./test-support/ui-contract-fixtures";

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

test("product-stage-drops asset maps Blue Capsule to DevaBergBoss", async () => {
    const data = await projectJson<{
        products: Record<string, Array<{ map: string; needBoss: boolean }>>;
        productCount: number;
    }>("./assets/product-stage-drops.json");

    expect(data.productCount).toBeGreaterThan(0);
    expect(data.products["57837"]).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ map: "DevaBergBoss", needBoss: true }),
        ]),
    );
});

test("applyProductStageDrops attaches boss stage without duplicating existing maps", async () => {
    restoreDom = installDomWindowHarness();
    const itemLookup = await import("./itemLookup");
    const {
        GuardianItemSource,
        Item,
        applyProductStageDrops,
        shop_items,
    } = itemLookup;

    shop_items.clear();

    const coin = new Item();
    coin.id = 57837;
    coin.name_en = "Blue Capsule";
    shop_items.set(coin.id, coin);

    // Pre-existing unrelated stage should remain; DevaBergBoss should be added once.
    coin.sources.push(new GuardianItemSource("Temple", [coin], 5, false, -1));

    applyProductStageDrops({
        products: {
            "57837": [
                { map: "DevaBergBoss", needBoss: true, xp: 3, bossTime: 180 },
                { map: "DevaBergBoss", needBoss: true, xp: 3, bossTime: 180 },
            ],
            "99999": [{ map: "ArenaBoss", needBoss: true, xp: 3, bossTime: 120 }],
        },
    });

    const maps = coin.sources
        .filter((s): s is InstanceType<typeof GuardianItemSource> => s instanceof GuardianItemSource)
        .map((s) => s.guardian_map);
    expect(maps).toEqual(["Temple", "DevaBergBoss"]);
    const deva = coin.sources.find(
        (s): s is InstanceType<typeof GuardianItemSource> =>
            s instanceof GuardianItemSource && s.guardian_map === "DevaBergBoss",
    );
    expect(deva?.need_boss).toBe(true);
    expect(deva?.xp).toBe(3);
    expect(deva?.boss_time).toBe(180);
});

test("Blue Capsule source strip shows Not for sale and Boss · Deva Berg", async () => {
    restoreDom = installDomWindowHarness();
    const itemLookup = await import("./itemLookup");
    const {
        Gacha,
        GachaItemSource,
        Item,
        applyProductStageDrops,
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

    applyProductStageDrops({
        products: {
            "57837": [{ map: "DevaBergBoss", needBoss: true, xp: 3, bossTime: 180 }],
        },
    });

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
    expect(table.textContent).toContain("Boss · Deva Berg");

    const body = table.tBodies[0];
    const rows = body!.children.filter(
        (child): child is DomNode => typeof child !== "string" && child.tagName === "TR",
    );
    const row = rows.find((c) => c.textContent.includes("JFTSE Modulator(Red)"));
    expect(row).toBeDefined();
    const bossChips = collectByClass(row!, "gacha-source-channel--boss");
    expect(bossChips.length).toBeGreaterThanOrEqual(1);
    expect(bossChips.some((chip) => chip.textContent.includes("Boss · Deva Berg"))).toBe(true);
});

function collectByClass(root: DomNode, className: string): DomNode[] {
    const found: DomNode[] = [];
    const walk = (node: DomNode | string) => {
        if (typeof node === "string") {
            return;
        }
        if ((node.className || "").split(/\s+/).includes(className)) {
            found.push(node);
        }
        for (const child of node.children) {
            walk(child);
        }
    };
    walk(root);
    return found;
}
