/// <reference types="bun" />

import { expect, test } from "bun:test";

import { projectFile } from "./test-support/ui-contract-fixtures";

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

test("keeps the FantasyLand finder task-first on mobile", async () => {
    const [html, css] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./style.css"),
    ]);

    expect(html.indexOf('id="results_group"')).toBeLessThan(
        html.indexOf('id="controlRail"'),
    );
    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*\.world-stage[\s\S]*width:\s*auto[\s\S]*background-position:\s*center/,
    );
    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*\.filter-toggle[\s\S]*min-block-size:\s*44px/,
    );
    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*\.control-rail[\s\S]*backdrop-filter:\s*blur\(20px\)/,
    );
    expect(css).toMatch(/\.result-row\s*\{[\s\S]*display:\s*grid/);
    expect(css).toMatch(/\.result-row\s*>\s*\.Source_column[\s\S]*grid-column:\s*1\s*\/\s*-1/);
    expect(css).toMatch(
        /@media \(max-width: 879px\)[\s\S]*\.item-details-dialog[\s\S]*border-radius:\s*18px/,
    );
});

test("contains keyboard focus inside the mobile refinement drawer", async () => {
    const script = await projectFile("./main.ts");

    expect(script).toContain('event.key !== "Tab"');
    expect(script).toContain("focusableElements[focusableElements.length - 1]");
    expect(script).toContain("focusableElements[0]");
    expect(script).toContain(
        'panel.addEventListener("transitionend", focusAfterOpen)',
    );
});

test("shares one responsive modal width across dialog families", async () => {
    const css = await projectFile("./style.css");

    expect(css).toMatch(/dialog,\s*\.item-details-dialog[\s\S]*width:\s*min\(92vw,\s*1280px\)/);
    expect(css).not.toMatch(/\.item-details-dialog[\s\S]*width:\s*min\(92vw,\s*760px\)/);
    expect(css).not.toMatch(/^dialog\s*\{[\s\S]*width:\s*min\(92vw,\s*640px\)/m);
});

test("uses the full viewport width across every page band", async () => {
    const css = await projectFile("./style.css");
    const shellWidthRules = css.match(
        /width:\s*min\(100%,\s*var\(--jf-shell-max\)\)/g,
    );

    expect(css).toContain("--jf-shell-max: 100%");
    // Header, workspace, and footer use the shell max; world-stage matches the
    // workspace content band (viewport minus shared page gutters).
    expect(shellWidthRules).toHaveLength(3);
    expect(css).toMatch(
        /\.finder-heading\.world-stage[\s\S]*width:\s*min\(100%\s*-\s*2\s*\*\s*var\(--jf-space-6\),\s*var\(--jf-shell-max\)\)/,
    );
    expect(css).not.toContain("--jf-shell-max: 1920px");
});
