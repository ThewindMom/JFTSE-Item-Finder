/// <reference types="bun" />

import { expect, test } from "bun:test";

import {
    projectBytes,
    projectExists,
    projectFile,
} from "./test-support/ui-contract-fixtures";

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

test("presents the bright FantasyLand equipment lab", async () => {
    const [html, css] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./style.css"),
    ]);

    expect(html).toContain('class="finder-heading world-stage"');
    expect(html).toContain("Find your perfect build");
    expect(html).not.toContain('class="player-journey"');
    expect(html).not.toContain('class="authentic-data-cue"');
    expect(css).toContain("color-scheme: light");
    expect(css).toContain('--jf-font-ui: "Nunito Sans"');
    expect(css).toContain('--jf-font-display: "Fredoka"');
    expect(css).toContain("--jf-bg: hsl(194 100% 97%)");
    expect(css).toContain("--jf-world-glow:");
    expect(css).toMatch(
        /\.world-stage[\s\S]*url\("assets\/fantasy-tennis-island\.webp"\)/,
    );
    expect(css).toMatch(/\.filter-stack[\s\S]*input\[type="search"\][\s\S]*box-shadow/);
    expect(css).toMatch(/\.results-panel[\s\S]*isolation:\s*isolate/);
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

test("uses restrained motion and explicit interaction states", async () => {
    const [renderer, main, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./main.ts"),
        projectFile("./style.css"),
    ]);

    expect(css).toContain("--jf-motion-fast: 120ms ease-out");
    expect(css).toContain("--jf-motion-standard: 200ms ease-out");
    expect(css).toMatch(
        /\.item-details-dialog\[open\][\s\S]*animation:\s*item-details-enter var\(--jf-motion-standard\)/,
    );
    expect(css).toMatch(/@keyframes item-details-enter/);
    expect(css).toMatch(
        /\.filter-toggle:active,[\s\S]*\.item-details-trigger:active[\s\S]*transform:/,
    );
    expect(css).toMatch(
        /:focus-visible[\s\S]*box-shadow:\s*0 0 0 4px var\(--jf-accent-glow\)/,
    );
    expect(css).toMatch(
        /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.item-details-dialog\[open\][\s\S]*animation:\s*none !important[\s\S]*transform:\s*none !important/,
    );
    expect(renderer).toContain('class: "gacha-source-summary"');
    expect(main).not.toContain("setTimeout(updateResults");
});

test("serves an authentic Fantasy Tennis world visual", async () => {
    const [extractor, server, design] = await Promise.all([
        projectFile("./tools/extract_item_art.py"),
        projectFile("./server.ts"),
        projectFile("./DESIGN.md"),
    ]);
    const worldVisualName = "./assets/fantasy-tennis-island.webp";

    expect(await projectExists(worldVisualName)).toBe(true);
    expect(extractor).toContain('"Main.res"');
    expect(extractor).toContain('"Main.tex"');
    expect(extractor).toContain('"worldVisual"');
    expect(server).toContain('"/assets/fantasy-tennis-island.webp"');
    expect(design).toContain("Res/GuiRes/Main.res :: Main.tex");
    if (await projectExists(worldVisualName)) {
        const bytes = await projectBytes(worldVisualName);
        expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("RIFF");
        expect(new TextDecoder().decode(bytes.slice(8, 12))).toBe("WEBP");
        expect(bytes.length).toBeGreaterThan(10_000);
    }
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

test("builds TypeScript before browser bundles", async () => {
    const makefile = await projectFile("./makefile");

    expect(makefile).toContain(".NOTPARALLEL:");
    expect(makefile).toContain("browserified.js: compile");
    expect(makefile).toContain("debug: compile");
});
