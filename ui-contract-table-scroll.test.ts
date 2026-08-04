/// <reference types="bun" />

import { expect, test } from "bun:test";

import { projectFile } from "./test-support/ui-contract-fixtures";

test("pins comparison column titles while scrolling down", async () => {
    const [html, css] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./style.css"),
    ]);

    expect(html).toContain('class="table-scroll-shell"');
    expect(html).toContain('class="table-scroll"');
    expect(css).toMatch(/\.table-scroll\s*\{[\s\S]*max-height:/);
    expect(css).toMatch(/\.table-scroll\s*\{[\s\S]*overflow-y:\s*auto/);
    expect(css).toMatch(/th\s*\{[\s\S]*position:\s*sticky[\s\S]*top:\s*0/);
    expect(css).toMatch(
        /th:first-child[\s\S]*position:\s*sticky[\s\S]*left:\s*0[\s\S]*top:\s*0/,
    );
});

test("frames a discoverable top column-pan control for wide tables", async () => {
    const [html, css, script] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./style.css"),
        projectFile("./main.ts"),
    ]);

    expect(html).toContain('class="table-column-pan"');
    expect(html).toContain('id="tableColumnPan"');
    expect(html).not.toContain('class="table-column-pan__hint"');
    expect(html).not.toContain("Wide table");
    expect(html).toContain('class="table-hscroll"');
    expect(html).toContain('id="tableHScroll"');
    expect(html).toContain('aria-label="Scroll comparison columns"');
    expect(html).not.toContain('aria-describedby="tableColumnPanHint"');
    expect(html).toContain('class="table-hscroll__spacer"');
    expect(html).not.toContain('class="table-scroll-hint"');
    expect(css).toMatch(/\.table-scroll-shell\s*\{[\s\S]*border/);
    expect(css).toMatch(/\.table-column-pan\s*\{/);
    expect(css).not.toMatch(/\.table-column-pan__hint\s*\{/);
    expect(css).toMatch(/\.table-hscroll\s*\{[\s\S]*overflow-x:\s*auto/);
    expect(css).toMatch(/\.table-hscroll\s*\{[\s\S]*min-height:\s*1[8-9]px|\.table-hscroll\s*\{[\s\S]*min-height:\s*[2-9]\dpx/);
    expect(css).toMatch(/\.table-column-pan\.is-revealed/);
    expect(script).toContain("syncResultsTableScroll");
    expect(script).toContain("tableColumnPan");
    expect(script).toContain("is-revealed");
    expect(script).toContain("scrollLeft");
});

test("hides the column-pan control on mobile card layout", async () => {
    const css = await projectFile("./style.css");

    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*\.table-column-pan[\s\S]*display:\s*none/,
    );
});
