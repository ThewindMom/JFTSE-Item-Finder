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
    expect(html).toContain('class="finder-layout"');
    expect(html).toContain('placeholder="Search items by name"');
    expect(html).toContain('aria-label="Item comparison results"');
});

test("provides mobile filter controls and overflow-safe results", async () => {
    const [html, css, script] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./style.css"),
        projectFile("./main.ts"),
    ]);

    expect(html).toContain('id="filterToggle"');
    expect(html).toContain('aria-controls="filter_group"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-mobile-filter-panel');
    expect(html).toContain('id="filterBackdrop"');
    expect(css).toMatch(/@media\s*\(max-width:\s*767px\)/);
    expect(css).toMatch(/\.table-scroll[\s\S]*overflow-x:\s*auto/);
    expect(css).toMatch(/\.filter-panel\.is-open/);
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
    expect(css).toMatch(/\.item-art-fallback[\s\S]*inline-size:\s*40px/);
});
