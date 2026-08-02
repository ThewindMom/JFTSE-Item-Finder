/// <reference types="bun" />

import { expect, test } from "bun:test";

import {
    projectFile,
    projectJson,
} from "./test-support/ui-contract-fixtures";

test("renders actionable gold gacha acquisition summaries", async () => {
    const [renderer, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./style.css"),
    ]);
    const map = await projectJson<{
        lotteries?: Record<string, {
            sheet: string;
            cell: number;
            color: string;
            shape: string;
        }>;
    }>("./assets/item-art-map.json");

    expect(map.lotteries?.["19"]).toEqual({
        sheet: "Item_GatchaCoin00",
        cell: 12,
        color: "Burgundy-gold",
        shape: "coin",
    });
    expect(renderer).toContain('class: "gacha-source-summary"');
    expect(renderer).toContain("function createGachaCurrencyLabel");
    expect(renderer).toContain('class: "gacha-currency gacha-currency--gold"');
    expect(renderer).not.toContain('class: "gacha-coin-color"');
    expect(renderer).not.toContain('class: "gacha-metrics"');
    expect(renderer).not.toContain("Burgundy-gold coin");
    expect(css).toMatch(/\.gacha-source-summary/);
    expect(css).toMatch(/\.gacha-currency--gold/);
    expect(css).not.toMatch(/\.gacha-metrics/);
    expect(css).not.toMatch(/\.gacha-economics/);
    expect(css).not.toMatch(/\.gacha-purchase/);
    expect(css).not.toMatch(/\.gacha-coin-color/);
});

test("gacha coin art accessible names omit color wording", async () => {
    const renderer = await projectFile("./itemLookup.ts");
    const coinArtFn = renderer.match(
        /function createGachaCoinArt\(gacha: Gacha\) \{[\s\S]*?\n\}/,
    )?.[0];
    expect(coinArtFn).toBeDefined();

    // Extract the live aria-label template passed into createSpriteArt.
    const labelTemplate = coinArtFn!.match(
        /createSpriteArt\(\s*art\.sheet,\s*art\.cell,\s*`([^`]+)`/,
    )?.[1] ?? coinArtFn!.match(
        /createSpriteArt\([\s\S]*?art\.sheet,[\s\S]*?art\.cell,[\s\S]*?`([^`]+)`/,
    )?.[1];
    expect(labelTemplate).toBeDefined();

    const map = await projectJson<{
        lotteries: Record<string, { color: string; shape: string }>;
    }>("./assets/item-art-map.json");
    const art = map.lotteries["19"];
    expect(art).toEqual(expect.objectContaining({
        color: "Burgundy-gold",
        shape: "coin",
    }));

    // Evaluate the UI generation contract the same way the DOM label is built.
    const gacha = { name: "House of Cards" };
    const accessibleName = labelTemplate!
        .replaceAll("${art.color}", art.color)
        .replaceAll("${art.shape}", art.shape)
        .replaceAll("${gacha.name}", gacha.name);

    expect(accessibleName).not.toContain("Burgundy-gold");
    expect(accessibleName).not.toContain(`${art.color} ${art.shape}`);
    expect(accessibleName).not.toMatch(/Burgundy-gold coin/i);
    expect(accessibleName).toBe(`${gacha.name} coin artwork`);
});

test("distinguishes AP gacha economics from Gold", async () => {
    const [renderer, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./style.css"),
    ]);
    const map = await projectJson<{
        lotteries?: Record<string, {
            sheet: string;
            cell: number;
            color: string;
            shape: string;
        }>;
    }>("./assets/item-art-map.json");

    expect(map.lotteries?.["25"]).toEqual({
        sheet: "Item_GatchaCoin00",
        cell: 13,
        color: "Cyan",
        shape: "coin",
    });
    expect(renderer).toContain('class: "item-identity"');
    expect(renderer).toContain('class: "gacha-source-summary"');
    expect(renderer).toContain('class: "gacha-currency gacha-currency--ap"');
    expect(css).toMatch(/\.gacha-currency--ap/);
    expect(css).toMatch(/\.gacha-currency--gold/);
    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*th:first-child,[\s\S]*td:first-child[\s\S]*position:\s*sticky[\s\S]*min-width:\s*120px/,
    );
    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*\.Source_column[\s\S]*min-width:\s*220px/,
    );
});

test("labels each gacha coin Gold or AP and marks unavailable coins", async () => {
    const [renderer, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./style.css"),
    ]);

    expect(renderer).toContain("function createGachaCurrencyLabel");
    expect(renderer).toContain("function createGachaAcquisitionChannelElements");
    expect(renderer).toContain("projectGachaAcquisitionChannels");
    expect(renderer).toContain('class: "gacha-currency gacha-currency--gold"');
    expect(renderer).toContain('class: "gacha-currency gacha-currency--ap"');
    expect(renderer).toContain('class: "gacha-source-channel gacha-source-channel--boss"');
    expect(renderer).toContain('class: "gacha-source-channel gacha-source-channel--guardian"');
    expect(renderer).toContain("Not available");
    expect(renderer).toContain("Not for sale");
    expect(renderer).toContain("shop-nobuy-indexes.json");
    expect(renderer).toContain("product-stage-drops.json");
    expect(renderer).toContain("function applyProductStageDrops");
    expect(renderer).toContain("createGachaAcquisitionChannelElements(gacha)");
    expect(renderer).toMatch(
        /new Gacha\(\s*apiItem\.productIndex,\s*apiItem\.item0,\s*apiItem\.name,\s*apiItem\.price0,\s*apiItem\.priceType === "MINT",\s*apiItem\.enabled,\s*purchasable,?\s*\)/,
    );
    expect(css).toMatch(/\.gacha-currency--gold[\s\S]*--jf-currency-gold/);
    expect(css).toMatch(/\.gacha-currency--ap[\s\S]*--jf-currency-ap/);
    // Shop status is not a currency denomination — separate quiet label, no uppercase scream.
    expect(renderer).toContain('class: "gacha-shop-status gacha-shop-status--not-for-sale"');
    expect(renderer).toContain('class: "gacha-shop-status gacha-shop-status--not-available"');
    expect(renderer).not.toContain("gacha-currency--unavailable");
    expect(css).toMatch(/\.gacha-shop-status--not-for-sale/);
    expect(css).toMatch(/\.gacha-shop-status--not-available/);
    expect(css).not.toMatch(/\.gacha-shop-status[\s\S]{0,400}text-transform:\s*uppercase/);
    expect(css).toMatch(/\.gacha-source-channel--boss[\s\S]*--jf-source-boss/);
    expect(css).toMatch(/\.gacha-source-channel--guardian[\s\S]*--jf-source-guardian/);
});

test("marks equipment that is not currently in the game", async () => {
    const [renderer, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./style.css"),
    ]);

    expect(renderer).toContain("function isItemCurrentlyAvailable");
    expect(renderer).toContain("function createItemAvailabilityBadge");
    expect(renderer).toContain("Not in game");
    expect(renderer).toContain('class: "item-availability item-availability--unavailable"');
    expect(renderer).toContain("createItemAvailabilityBadge(item)");
    expect(css).toMatch(/\.item-availability--unavailable/);
});

test("opens item details with acquisition context", async () => {
    const [renderer, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./style.css"),
    ]);

    expect(renderer).toContain("function createItemDetailsTrigger");
    expect(renderer).toContain('class: "item-details-trigger"');
    expect(renderer).toContain('"aria-haspopup": "dialog"');
    expect(renderer).toContain('"item-details-dialog",');
    expect(renderer).toContain("{ class: dialogClass }");
    expect(renderer).toContain('"How to get it"');
    expect(renderer).toContain("itemSourcesToElementArray(item, () => true, character)");
    expect(renderer).toContain('class: "item-details__stats"');
    expect(renderer).toContain('class: "item-details__sources"');
    expect(css).toMatch(/\.item-details-dialog[\s\S]*width:\s*min\(92vw,\s*1280px\)/);
    expect(css).toMatch(/\.item-details-trigger[\s\S]*text-decoration/);
    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*\.item-details-dialog__close[\s\S]*min-height:\s*44px/,
    );
});

test("gacha details omit the redundant source-name link", async () => {
    const renderer = await projectFile("./itemLookup.ts");

    expect(renderer).not.toContain('createHTML(["a", gacha.name])');
});

test("gacha details table omits Character and collapses same-name equipment", async () => {
    const renderer = await projectFile("./itemLookup.ts");

    expect(renderer).toContain("export function createGachaDetailsTable");
    expect(renderer).toContain("createGachaDetailsTable(gacha, item, character)");

    const detailsFn = renderer.match(
        /export function createGachaDetailsTable\([\s\S]*?\nfunction createGachaSourcePopup/,
    )?.[0];
    expect(detailsFn).toBeDefined();
    // Drop table is Item | Chance | Expected pulls only — never a Character column.
    expect(detailsFn).not.toContain('["th", "Character"]');
    expect(detailsFn).not.toContain('char_gacha_item.character || "*"');
    // Unfiltered path collapses character clones by display name + quantity.
    expect(detailsFn).toContain("name_en}\\0${quantity_min}\\0${quantity_max}");
});

test("removes authenticity cue, player journey, coin color, and gacha metrics", async () => {
    const [html, renderer, css] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./itemLookup.ts"),
        projectFile("./style.css"),
    ]);

    expect(html).not.toContain("authentic-data-cue");
    expect(html).not.toContain("player-journey");
    expect(html).not.toContain("Authentic client artwork");
    expect(renderer).not.toContain('class: "gacha-coin-color"');
    expect(renderer).not.toContain('class: "gacha-metrics"');
    expect(renderer).not.toContain('class: "gacha-economics"');
    expect(renderer).not.toContain("Expected spend");
    expect(renderer).not.toContain("function createChancePopup");
    expect(renderer).not.toContain("function formatPlayerNumber");
    expect(css).not.toMatch(/\.player-journey/);
    expect(css).not.toMatch(/\.authentic-data-cue/);
    expect(css).not.toMatch(/\.gacha-metrics/);
    expect(css).not.toMatch(/\.gacha-economics/);
    expect(css).not.toMatch(/\.gacha-purchase/);
    expect(css).toMatch(/\.gacha-currency/);
    expect(css).not.toMatch(/\.gacha-coin-color/);
    expect(css).not.toMatch(/#itemFilter\s*>\s*div/);
});
