/// <reference types="bun" />

import { expect, test } from "bun:test";

import {
    projectExists,
    projectFile,
    projectJson,
} from "./test-support/ui-contract-fixtures";

test("renders item thumbnails with accessible fallback metadata", async () => {
    const [html, css, renderer] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./style.css"),
        projectFile("./itemLookup.ts"),
    ]);

    expect(html).toContain('id="resultsStatus"');
    expect(html).toContain('aria-live="polite"');
    expect(renderer).toContain('function createItemArtFallback(item: Item)');
    expect(renderer).toMatch(/\{ class: "Art_column"[^}]*\}, "Art"/);
    expect(renderer).toContain('class: "item-art-fallback"');
    expect(renderer).toContain('role: "img"');
    expect(renderer).toContain('Official item art unavailable for ${item.name_en}');
    expect(renderer).toContain('item.part || "Item"');
    expect(renderer).not.toContain('"[N/A]"');
    expect(css).toMatch(/\.item-art-fallback[\s\S]*inline-size:\s*40px/);
});

test("renders authentic extracted client artwork when mapped", async () => {
    const [renderer, server, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./server.ts"),
        projectFile("./style.css"),
    ]);

    expect(renderer).toContain('"assets/item-art-map.json"');
    expect(renderer).toContain('"item-art-thumbnail",');
    expect(renderer).toContain("class: className");
    expect(renderer).toContain('Official item art for ${item.name_en}');
    expect(server).toContain('"/assets/item-art-map.json"');
    expect(server).toContain('"/assets/item-art/:file"');
    expect(css).toMatch(/\.item-art-thumbnail[\s\S]*background-image/);

    const mapName = "./assets/item-art-map.json";
    expect(await projectExists(mapName)).toBe(true);
    if (await projectExists(mapName)) {
        const map = await projectJson<{
            items: Record<string, [string, number]>;
        }>(mapName);
        expect(map.items["929"]).toEqual(["Item_Common01", 6]);
    }
    expect(await projectExists("./assets/item-art/Item_Common01.webp")).toBe(true);
});

test("shows excluded items with an intuitive restore action", async () => {
    const [html, script, css] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./main.ts"),
        projectFile("./style.css"),
    ]);

    expect(html).toContain('class="filter-section exclusion-section"');
    expect(html).toContain('id="itemFilter"');
    expect(html).toContain("No excluded items");
    // Keep exclusions outside collapsed advanced filters so restore stays obvious.
    expect(html.indexOf('id="itemFilter"')).toBeGreaterThan(html.indexOf('id="miscFilter"'));
    expect(html.indexOf('class="filter-section exclusion-section"')).toBeLessThan(
        html.indexOf('<details class="advanced-filters">'),
    );
    expect(script).toContain('"Restore"');
    expect(script).toContain("Restore ${item.name_en}");
    expect(script).toContain('class: "excluded-item"');
    expect(script).toContain('class: "empty-note"');
    expect(script).toContain("No excluded items");
    expect(css).toMatch(/\.excluded-item[\s\S]*display:\s*flex/);
});
