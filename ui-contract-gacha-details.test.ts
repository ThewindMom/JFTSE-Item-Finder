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
    expect(renderer).not.toContain('class: "gacha-coin-color"');
    expect(renderer).not.toContain('class: "gacha-metrics"');
    expect(renderer).not.toContain("Burgundy-gold coin");
    expect(css).toMatch(/\.gacha-source-summary/);
    expect(css).not.toMatch(/\.gacha-currency--gold/);
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
    expect(css).not.toMatch(/\.gacha-currency--ap/);
    expect(css).not.toMatch(/\.gacha-currency--gold/);
    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*th:first-child,[\s\S]*td:first-child[\s\S]*position:\s*sticky[\s\S]*min-width:\s*120px/,
    );
    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*\.Source_column[\s\S]*min-width:\s*220px/,
    );
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
    expect(css).not.toMatch(/\.gacha-currency/);
    expect(css).not.toMatch(/\.gacha-coin-color/);
    expect(css).not.toMatch(/#itemFilter\s*>\s*div/);
});
