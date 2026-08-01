/// <reference types="bun" />

import { expect, test } from "bun:test";

async function projectFile(name: string): Promise<string> {
    return Bun.file(new URL(name, import.meta.url)).text();
}

test("renders semantic mobile result cards from table cells", async () => {
    const [renderer, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./style.css"),
    ]);

    expect(renderer).toContain('{ class: "result-row" }');
    expect(renderer).toContain('class: "Name_column result-summary"');
    expect(renderer).toContain('"data-label": "Item"');
    expect(renderer).toContain('"data-label": "Art"');
    expect(renderer).toContain('"data-label": "Character"');
    expect(renderer).toContain('"data-label": "Part"');
    expect(renderer).toContain('"data-label": stat');
    expect(renderer).toContain('"data-label": "Level"');
    expect(renderer).toContain('"data-label": "Source"');

    expect(css).toMatch(/@media\s*\(max-width:\s*879px\)/);
    expect(css).toMatch(/\.result-row\s*\{[\s\S]*display:\s*grid/);
    expect(css).toMatch(/\.result-row\s*>\s*td::before/);
    expect(css).toMatch(/\.result-summary\s*\{[\s\S]*grid-area:\s*summary/);
});
