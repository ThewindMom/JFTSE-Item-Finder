/// <reference types="bun" />

import { expect, test } from "bun:test";

import { projectFile } from "./test-support/ui-contract-fixtures";

/**
 * EXCLUDE_ICON_AFFORDANCE
 *
 * Contract: result-row exclude control is an icon button (not bare "Exclude" text),
 * keeps a descriptive aria-label, and click handling uses closest() so SVG hits work.
 */
test("exclude control is an accessible icon button, not bare text", async () => {
    const [renderer, main, css] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./main.ts"),
        projectFile("./style.css"),
    ]);

    expect(renderer).toContain('class: "item_removal"');
    expect(renderer).toContain("aria-label");
    expect(renderer).toContain("Exclude ${item.name_en} from results");
    // Icon markup — SVG currentColor, not the word Exclude as the only affordance.
    expect(renderer).toMatch(/item_removal[\s\S]{0,400}createExcludeIcon|createExcludeIcon[\s\S]{0,200}item_removal|class: "item_removal"[\s\S]{0,500}<svg|createExcludeIcon\(/);
    expect(renderer).toContain("aria-hidden");
    // Bare text label alone is no longer the control body.
    expect(renderer).not.toMatch(
        /class: "item_removal"[\s\S]{0,120}\},\s*\n\s*"Exclude"\s*,?\s*\n\s*\]\)/,
    );

    // SVG / nested hits must resolve the button.
    expect(main).toMatch(/closest\(\s*["']\.item_removal["']\s*\)/);
    expect(css).toMatch(/\.item_removal[\s\S]{0,200}(inline-flex|inline-grid|grid|flex)/);
    expect(css).toMatch(/\.item_removal[\s\S]{0,300}(inline-size|width|min-width):\s*(2[89]|3[0-9]|4[0-4])px/);
    // Destructive hover cue (not the generic accent fill).
    expect(css).toMatch(/\.item_removal:hover[\s\S]{0,200}--jf-danger/);
});

/**
 * PRIORITY_MOVE_BUTTONS
 *
 * Contract: ranking list supports keyboard-discoverable up/down reordering in addition
 * to drag. Stat text lives in .priority-stat-label so controls never pollute ranking keys.
 */
test("priority list exposes up/down controls and isolates stat labels", async () => {
    const [html, main, css] = await Promise.all([
        projectFile("./index.html"),
        projectFile("./main.ts"),
        projectFile("./style.css"),
    ]);

    expect(html).toContain('id="priority_list"');
    expect(html).toContain('class="priority-stat-label"');
    expect(html).toContain("priority-move-up");
    expect(html).toContain("priority-move-down");
    expect(html).toContain('id="priority_summary_hint"');
    expect(html).toMatch(/arrows|drag|stats win/i);

    expect(main).toContain("priority-stat-label");
    expect(main).toContain("priority-move-up");
    expect(main).toContain("priority-move-down");
    expect(main).toContain("syncRankingSummaryHint");
    expect(main).toMatch(/function createPriorityListItem|createPriorityListItem\(/);
    expect(main).toMatch(/function getPriorityStatLabel|getPriorityStatLabel\(/);
    expect(main).toMatch(/closest\(\s*["']\.priority-move-up["']\s*\)|priority-move-up/);
    expect(main).toMatch(/closest\(\s*["']\.priority-move-down["']\s*\)|priority-move-down/);

    // Ranking reads labels, not whole-row textContent (which would include button chrome).
    expect(main).toMatch(
        /priorityStats[\s\S]{0,400}getPriorityStatLabel|getPriorityStatLabel[\s\S]{0,200}priorityStats|\.priority-stat-label/,
    );

    // Enchant rename must target the label helper, not whole-li textContent assignment.
    expect(main).toMatch(
        /enchantToggle[\s\S]{0,900}getPriorityStatLabel[\s\S]{0,200}setPriorityStatLabel|enchantToggle[\s\S]{0,900}setPriorityStatLabel/,
    );
    expect(main).not.toMatch(
        /enchantToggle[\s\S]{0,500}node\.textContent\s*=/,
    );

    expect(css).toContain(".priority-move");
    expect(css).toContain(".priority-stat-label");
    expect(css).toContain(".priority-move-controls");
    expect(css).toMatch(/\.priority-move[\s\S]{0,200}min-(width|inline-size|block-size|height)/);
    // Segmented pair shares one outer border (controls own the frame).
    expect(css).toMatch(/\.priority-move-controls\s*\{[\s\S]{0,280}border:\s*1px solid/);
});
