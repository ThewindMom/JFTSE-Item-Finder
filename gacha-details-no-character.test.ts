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
 * Given: lottery-style multi-entry equipment (same item written once per character block)
 * When: the details table is built without a character filter
 * Then: Character is omitted, same-name gear is one row, and rates sum to 100%
 *
 * Live Dragon Set files list each piece 7× at 1% → 7% after accumulation
 * (Ini3_Lot_49 / ChansPer). Overwriting tickets left a false 1%.
 */
test("unfiltered gacha details omit Character and sum multi-entry equipment rates", async () => {
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

    for (const character of characters) {
        gacha.add(shared, 11.5, character, 1, 1);

        const armor = new Item();
        armor.id = 60_000 + characters.indexOf(character);
        armor.name_en = "Dragon Armor(Red)";
        armor.character = character;
        armor.part = "Upper";
        // Game lottery blocks list the same character gear once per block (7×).
        // Remap-by-item.character stacks them onto one map entry — must accumulate.
        for (let block = 0; block < characters.length; block++) {
            gacha.add(armor, 1, character, 1, 1);
        }
    }

    // Tickets accumulate: armor 7, Onyx 11.5, char total 11.5+7=18.5 → rates 62.16% / 37.84%
    // Prefer explicit pool totals matching live ChansPer style (shared + 7× gear).
    expect(gacha.character_probability.get("Niki")).toBe(11.5 + 7);
    expect(gacha.shop_items.get("Niki")!.get(
        [...gacha.shop_items.get("Niki")!.keys()].find((i) => i.name_en === "Dragon Armor(Red)")!,
    )?.[0]).toBe(7);

    const table = createGachaDetailsTable(gacha) as unknown as DomNode;

    expect(headerLabels(table)).toEqual(["Item", "Chance", "Expected pulls"]);
    expect(table.textContent).not.toContain("Character");

    const armorRows = dataRows(table).filter(
        (row) => cellText(row, 0) === "Dragon Armor(Red)",
    );
    expect(armorRows).toHaveLength(1);

    const onyxRows = dataRows(table).filter((row) => cellText(row, 0) === "Onyx");
    expect(onyxRows).toHaveLength(1);

    // 11.5/18.5 ≈ 62.16%, 7/18.5 ≈ 37.84% — multi-entry armor is NOT stuck at 1/18.5.
    expect(cellText(onyxRows[0]!, 1)).toBe("62.16%");
    expect(cellText(armorRows[0]!, 1)).toBe("37.84%");
    expect(cellText(armorRows[0]!, 2)).toBe("2.64"); // expected pulls 18.5/7

    // Character names must not appear as data cells.
    for (const character of characters) {
        for (const row of dataRows(table)) {
            expect(row.getElementsByTagName("td").map((td) => td.textContent.trim()))
                .not.toContain(character);
        }
    }
});

/**
 * Given: the same equipment Item is added seven times at 1% (live lottery pattern)
 * When: character-filtered details are built
 * Then: chance is 7%, not 1%
 */
test("character-filtered details report summed chance for multi-entry same-name gear", async () => {
    restoreDom = installDomWindowHarness();

    const { Gacha, Item, createGachaDetailsTable } = await loadItemLookup();

    const gacha = new Gacha(91_003, 49, "Dragon Set(Red)", 3000, false, true);
    const onyx = new Item();
    onyx.id = 8000;
    onyx.name_en = "Onyx";
    gacha.add(onyx, 11.5, "Niki", 1, 1);

    const armor = new Item();
    armor.id = 8376;
    armor.name_en = "Dragon Armor(Red)";
    armor.character = "Niki";
    armor.part = "Upper";
    for (let i = 0; i < 7; i++) {
        gacha.add(armor, 1, "Niki", 1, 1);
    }
    // Pad remaining weight so pool is 100 like live files (optional for rate math).
    const pad = new Item();
    pad.id = 9000;
    pad.name_en = "Pad";
    gacha.add(pad, 100 - 11.5 - 7, "Niki", 1, 1);

    const table = createGachaDetailsTable(gacha, armor, "Niki") as unknown as DomNode;
    const armorRows = dataRows(table).filter(
        (row) => cellText(row, 0) === "Dragon Armor(Red)",
    );
    expect(armorRows).toHaveLength(1);
    expect(cellText(armorRows[0]!, 1)).toBe("7%");
    expect(cellText(armorRows[0]!, 2)).toBe("14.29");
    expect(armorRows[0]!.className.split(/\s+/)).toContain("highlighted");

    const onyxRows = dataRows(table).filter((row) => cellText(row, 0) === "Onyx");
    expect(cellText(onyxRows[0]!, 1)).toBe("11.5%");
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
