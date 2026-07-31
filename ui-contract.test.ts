/// <reference types="bun" />

import { expect, test } from "bun:test";

async function projectFile(name: string): Promise<string> {
    return Bun.file(new URL(name, import.meta.url)).text();
}

test("renders branded desktop app shell", async () => {
    const html = await projectFile("./index.html");

    expect(html).toContain('data-jftse-app="item-finder"');
    expect(html).toContain('class="site-header"');
    expect(html).toMatch(/<h1[^>]*>JFTSE Item Finder<\/h1>/);
    expect(html).toContain('<nav aria-label="JFTSE navigation">');
    expect(html).toContain('class="finder-workspace"');
    expect(html).toContain('placeholder="Name or keyword"');
    expect(html).toContain('aria-label="Item comparison results"');
});

test("provides mobile filter controls and overflow-safe results", async () => {
    const [html, css, script] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./style.css"),
        projectFile("./main.ts"),
    ]);

    expect(html).toContain('id="filterToggle"');
    expect(html).toContain('aria-controls="controlRail"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-mobile-filter-panel');
    expect(html).toContain('id="filterBackdrop"');
    expect(css).toMatch(/@media\s*\(max-width:\s*879px\)/);
    expect(css).toMatch(/\.table-scroll[\s\S]*overflow-x:\s*auto/);
    expect(css).toMatch(/\.control-rail\.is-open/);
    expect(script).toContain('toggleButton.setAttribute("aria-expanded"');
    expect(script).toContain('panel.classList.toggle("is-open"');
});

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

    expect(renderer).toContain('"/assets/item-art-map.json"');
    expect(renderer).toContain('"item-art-thumbnail",');
    expect(renderer).toContain("class: className");
    expect(renderer).toContain('Official item art for ${item.name_en}');
    expect(server).toContain('"/assets/item-art-map.json"');
    expect(server).toContain('"/assets/item-art/:file"');
    expect(css).toMatch(/\.item-art-thumbnail[\s\S]*background-image/);

    const mapFile = Bun.file(new URL("./assets/item-art-map.json", import.meta.url));
    expect(await mapFile.exists()).toBe(true);
    if (await mapFile.exists()) {
        const map = await mapFile.json() as {
            items: Record<string, [string, number]>;
        };
        expect(map.items["929"]).toEqual(["Item_Common01", 6]);
    }
    expect(
        await Bun.file(new URL("./assets/item-art/Item_Common01.webp", import.meta.url)).exists(),
    ).toBe(true);
});

test("renders actionable gold gacha acquisition summaries", async () => {
    const [renderer, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./style.css"),
    ]);
    const map = await Bun.file(
        new URL("./assets/item-art-map.json", import.meta.url),
    ).json() as {
        lotteries?: Record<string, {
            sheet: string;
            cell: number;
            color: string;
            shape: string;
        }>;
    };

    expect(map.lotteries?.["19"]).toEqual({
        sheet: "Item_GatchaCoin00",
        cell: 12,
        color: "Burgundy-gold",
        shape: "coin",
    });
    expect(renderer).toContain('class: "gacha-source-summary"');
    expect(renderer).toContain("Expected spend");
    expect(renderer).toContain("per pull");
    expect(renderer).toContain("Chance");
    expect(css).toMatch(/\.gacha-source-summary[\s\S]*\.gacha-economics/);
    expect(css).toMatch(/\.gacha-currency--gold/);
});

test("distinguishes AP gacha economics from Gold", async () => {
    const [renderer, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./style.css"),
    ]);
    const map = await Bun.file(
        new URL("./assets/item-art-map.json", import.meta.url),
    ).json() as {
        lotteries?: Record<string, {
            sheet: string;
            cell: number;
            color: string;
            shape: string;
        }>;
    };

    expect(map.lotteries?.["25"]).toEqual({
        sheet: "Item_GatchaCoin00",
        cell: 13,
        color: "Cyan",
        shape: "coin",
    });
    expect(renderer).toContain('"data-currency": currency');
    expect(renderer).toContain("gacha-currency--${currency.toLowerCase()}");
    expect(renderer).toContain('class: "item-identity"');
    expect(css).toMatch(/\.gacha-currency--ap/);
    expect(css).toMatch(/\.gacha-currency--gold/);
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
    expect(css).toMatch(/\.item-details-dialog[\s\S]*width:\s*min\(92vw,\s*760px\)/);
    expect(css).toMatch(/\.item-details-trigger[\s\S]*text-decoration/);
    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*\.item-details-dialog__close[\s\S]*min-height:\s*44px/,
    );
});

test("presents a task-first finder workspace", async () => {
    const [html, css] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./style.css"),
    ]);

    expect(html).toContain('class="finder-workspace"');
    expect(html).toContain('class="control-rail" id="controlRail"');
    expect(html.indexOf('id="results_group"')).toBeLessThan(html.indexOf('id="controlRail"'));
    expect(html).toContain('id="resetFilters"');
    expect(html).toContain("Updates instantly");
    expect(css).toMatch(
        /\.finder-workspace[\s\S]*grid-template-columns:\s*minmax\(18rem,\s*20rem\)\s+minmax\(0,\s*1fr\)/,
    );
    expect(css).not.toMatch(
        /grid-template-columns:\s*minmax\(18rem,\s*20rem\)\s+minmax\(14rem,\s*17rem\)/,
    );
});

test("keeps advanced filters discoverable without overwhelming the primary flow", async () => {
    const [html, css] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./style.css"),
    ]);

    expect(html).toContain('<details class="advanced-filters">');
    expect(html).toContain("<summary>More filters");
    expect(html).toContain('<details class="ranking-disclosure">');
    expect(html).toContain("<summary>Ranking priorities");
    expect(html).toContain('aria-controls="controlRail"');
    expect(html).toContain('id="refinementStatus"');
    expect(css).toMatch(/@media\s*\(max-width:\s*879px\)/);
    expect(css).toMatch(
        /\.control-rail\.is-open[\s\S]*transform:\s*translateX\(0\)/,
    );
    expect(css).toMatch(
        /@media\s*\(max-width:\s*879px\)[\s\S]*min-block-size:\s*44px/,
    );
});

test("offers reset and inline loading failure recovery", async () => {
    const [html, script, renderer] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./main.ts"),
        projectFile("./itemLookup.ts"),
    ]);

    expect(html).toContain('id="resetFilters"');
    expect(html).toContain('id="refinementStatus"');
    expect(script).toContain("Variable_storage.clear_all()");
    expect(script).toContain('resultsStatus.textContent = "Item data unavailable"');
    expect(script).toContain('loadingLabel.textContent = "Could not load equipment data"');
    expect(renderer).not.toContain("alert(");
});

test("contains keyboard focus inside the mobile refinement drawer", async () => {
    const script = await projectFile("./main.ts");

    expect(script).toContain('event.key !== "Tab"');
    expect(script).toContain("focusableElements[focusableElements.length - 1]");
    expect(script).toContain("focusableElements[0]");
});

test("builds TypeScript before browser bundles", async () => {
    const makefile = await projectFile("./makefile");

    expect(makefile).toContain(".NOTPARALLEL:");
    expect(makefile).toContain("browserified.js: compile");
    expect(makefile).toContain("debug: compile");
});
