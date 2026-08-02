/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import type * as ItemLookup from "./itemLookup";
import {
    type DomNode,
    installDomWindowHarness,
} from "./test-support/dom-window-harness";

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

function headerLabels(table: DomNode): string[] {
    const firstRow = table.rows[0];
    if (!firstRow) {
        return [];
    }
    return firstRow
        .getElementsByTagName("th")
        .map((th) => th.textContent.trim());
}

function dataRows(table: DomNode): DomNode[] {
    return table.rows.slice(1);
}

function cellText(row: DomNode, index: number): string {
    const cells = row.getElementsByTagName("td");
    return (cells[index]?.textContent ?? "").trim();
}

async function loadItemLookup(): Promise<typeof ItemLookup> {
    // Runtime import after DOM harness; type comes from the static type import above
    // so createGachaDetailsTable is always a known export for tsc/LSP.
    return await import("./itemLookup") as typeof ItemLookup;
}

/**
 * Given: a gacha that lists the same equipment once per character (identical rates)
 * When: the details table is built without a character filter
 * Then: Character is not a column, and same-name equipment appears once
 */
test("unfiltered gacha details omit Character and collapse per-character equipment", async () => {
    restoreDom = installDomWindowHarness();

    const {
        Gacha,
        Item,
        createGachaDetailsTable,
        characters,
    } = await loadItemLookup();

    const gacha = new Gacha(91_001, 19, "Dragon Set(Red)", 3000, false, true);

    // Shared consumable — same Item object in every character pool (mirrors live data).
    const shared = new Item();
    shared.id = 50_001;
    shared.name_en = "Onyx";

    for (const [index, character] of characters.entries()) {
        gacha.add(shared, 115, character, 1, 1);

        const armor = new Item();
        armor.id = 60_000 + index;
        armor.name_en = "Dragon Armor(Red)";
        armor.character = character;
        armor.part = "Upper";
        // Same relative weight in each character pool.
        gacha.add(armor, 10, character, 1, 1);
    }

    const table = createGachaDetailsTable(gacha) as unknown as DomNode;

    expect(headerLabels(table)).toEqual(["Item", "Chance", "Expected pulls"]);
    expect(table.textContent).not.toContain("Character");

    const armorRows = dataRows(table).filter(
        (row) => cellText(row, 0) === "Dragon Armor(Red)",
    );
    expect(armorRows).toHaveLength(1);

    const onyxRows = dataRows(table).filter((row) => cellText(row, 0) === "Onyx");
    expect(onyxRows).toHaveLength(1);

    // Per-character pool rates (not diluted by total_probability across all characters).
    // 115 / (115 + 10) ≈ 92%; 10 / 125 = 8%.
    expect(cellText(onyxRows[0]!, 1)).toBe("92%");
    expect(cellText(armorRows[0]!, 1)).toBe("8%");

    // Character names must not appear as data cells.
    for (const character of characters) {
        for (const row of dataRows(table)) {
            expect(row.getElementsByTagName("td").map((td) => td.textContent.trim()))
                .not.toContain(character);
        }
    }
});

/**
 * Given: a character filter and a highlighted item for that character
 * When: the details table is built
 * Then: still no Character column; highlight matches; only that character's pool size
 */
test("character-filtered gacha details stay character-free and highlight the item", async () => {
    restoreDom = installDomWindowHarness();

    const {
        Gacha,
        Item,
        createGachaDetailsTable,
    } = await loadItemLookup();

    const gacha = new Gacha(91_002, 20, "Dragon Set(Red)", 3000, false, true);

    const nikiArmor = new Item();
    nikiArmor.id = 70_001;
    nikiArmor.name_en = "Dragon Armor(Red)";
    nikiArmor.character = "Niki";
    nikiArmor.part = "Upper";
    gacha.add(nikiArmor, 10, "Niki", 1, 1);

    const lunArmor = new Item();
    lunArmor.id = 70_002;
    lunArmor.name_en = "Dragon Armor(Red)";
    lunArmor.character = "LunLun";
    lunArmor.part = "Upper";
    gacha.add(lunArmor, 10, "LunLun", 1, 1);

    const shared = new Item();
    shared.id = 70_003;
    shared.name_en = "Onyx";
    gacha.add(shared, 115, "Niki", 1, 1);

    const table = createGachaDetailsTable(gacha, nikiArmor, "Niki") as unknown as DomNode;

    expect(headerLabels(table)).toEqual(["Item", "Chance", "Expected pulls"]);
    expect(table.textContent).not.toMatch(/\bLunLun\b/);
    expect(table.textContent).not.toMatch(/\bCharacter\b/);

    const armorRows = dataRows(table).filter(
        (row) => cellText(row, 0) === "Dragon Armor(Red)",
    );
    expect(armorRows).toHaveLength(1);
    expect(armorRows[0]!.className.split(/\s+/)).toContain("highlighted");
});
