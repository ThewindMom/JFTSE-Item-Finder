/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import { installDomWindowHarness } from "./test-support/dom-window-harness";

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

function collectByClass(root: { children?: unknown[]; className?: string; getAttribute?: (n: string) => string | null }, className: string): unknown[] {
    const out: unknown[] = [];
    function walk(node: any) {
        if (!node || typeof node === "string") return;
        const raw = typeof node.className === "string"
            ? node.className
            : (node.getAttribute?.("class") ?? "");
        if (raw.split(/\s+/).includes(className)) {
            out.push(node);
        }
        for (const child of node.children ?? []) {
            walk(child);
        }
    }
    walk(root);
    return out;
}

test("stage reward art uses gacha coin sprite for Tossakan Boss Coin (not item fallback)", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Gacha,
        GuardianItemSource,
        Item,
        createStageDetailsContent,
        createStageRewardArt,
        findGachaForShopItem,
        gachas,
        shop_items,
    } = itemLookup;

    // Simulate live shop lottery registration without productIndex on item.id (old bug).
    const gacha = new Gacha(20076, 77, "Tossakan Boss Coin", 400, true, true, false);
    gachas.set(gacha.shop_index, gacha);

    const coin = new Item();
    // Deliberately leave id=0 to prove reverse lookup still finds the gacha.
    coin.id = 0;
    coin.name_en = "Tossakan Boss Coin";
    coin.part = "Other";
    shop_items.set(gacha.shop_index, coin);

    expect(findGachaForShopItem(coin)).toBe(gacha);

    // Lottery art map is loaded at runtime; inject the same shape createGachaCoinArt expects.
    const artMap = (itemLookup as any);
    // Access private module state via createStageRewardArt behaviour only.

    const art = createStageRewardArt(coin) as unknown as {
        className?: string;
        getAttribute?: (n: string) => string | null;
        children?: unknown[];
    };
    const className = typeof art.className === "string"
        ? art.className
        : (art.getAttribute?.("class") ?? "");
    expect(className).toContain("gacha-coin-art");
    expect(className).not.toContain("item-art-fallback");

    const source = new GuardianItemSource("TempleBoss", [coin], 5, true, 180);
    const dialog = createStageDetailsContent(coin, source) as unknown as {
        children?: unknown[];
        className?: string;
        getAttribute?: (n: string) => string | null;
    };
    const fallbacks = collectByClass(dialog, "item-art-fallback");
    const coins = collectByClass(dialog, "gacha-coin-art");
    expect(coins.length).toBeGreaterThanOrEqual(1);
    expect(fallbacks).toHaveLength(0);
    expect((dialog as any).textContent ?? "").toContain("Tossakan Boss Coin");
});

test("stage reward art still works when coin item.id equals shop product index", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Gacha,
        Item,
        createStageRewardArt,
        findGachaForShopItem,
        gachas,
        shop_items,
    } = itemLookup;

    gachas.clear();
    shop_items.clear();

    const gacha = new Gacha(20086, 87, "Black Scale Set Box", 4000, false, true, false);
    gachas.set(gacha.shop_index, gacha);
    const coin = new Item();
    coin.id = 20086;
    coin.name_en = gacha.name;
    shop_items.set(20086, coin);

    expect(findGachaForShopItem(coin)).toBe(gacha);
    const art = createStageRewardArt(coin) as unknown as { className?: string; getAttribute?: (n: string) => string | null };
    const className = typeof art.className === "string"
        ? art.className
        : (art.getAttribute?.("class") ?? "");
    expect(className).toContain("gacha-coin-art");
});
