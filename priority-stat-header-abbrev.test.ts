/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import { priorityStatHeaderDisplay } from "./priorityStatHeaders";
import {
    installDomWindowHarness,
    type DomNode,
} from "./test-support/dom-window-harness";

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

test("abbreviates Mov Speed, Quickslots, and Buffslots to MS, QS, and BS", () => {
    expect(priorityStatHeaderDisplay("Mov Speed")).toEqual({
        short: "MS",
        full: "Mov Speed",
        abbreviated: true,
    });
    expect(priorityStatHeaderDisplay("Quickslots")).toEqual({
        short: "QS",
        full: "Quick Slots",
        abbreviated: true,
    });
    expect(priorityStatHeaderDisplay("Buffslots")).toEqual({
        short: "BS",
        full: "Buff Slots",
        abbreviated: true,
    });
    expect(priorityStatHeaderDisplay("Charge")).toEqual({
        short: "Charge",
        full: "Charge",
        abbreviated: false,
    });
    expect(priorityStatHeaderDisplay("Mov Speed+Quickslots")).toEqual({
        short: "MS+QS",
        full: "Mov Speed+Quick Slots",
        abbreviated: true,
    });
});

test("results table headers show MS/QS/BS with clickable full-name popups", async () => {
    restoreDom = installDomWindowHarness();

    const itemLookup = await import("./itemLookup");
    const {
        Item,
        ShopItemSource,
        getResultsTable,
        items,
        shop_items,
    } = itemLookup;
    type GameItem = InstanceType<typeof Item>;

    // itemLookup re-exports the helper for consumers of that module.
    expect(typeof itemLookup.priorityStatHeaderDisplay).toBe("function");
    expect(itemLookup.priorityStatHeaderDisplay("Buffslots").short).toBe("BS");

    items.clear();
    shop_items.clear();

    const item = new Item();
    item.id = 1;
    item.name_en = "Speed Shoes";
    item.part = "Shoes";
    item.character = "Niki";
    item.level = 5;
    item.movement = 3;
    item.quickslots = 1;
    item.buffslots = 2;
    item.charge = 4;

    const shopItem = new Item();
    shopItem.id = 50_001;
    shopItem.name_en = "Speed Shoes product";
    shop_items.set(shopItem.id, shopItem);
    item.sources.push(new ShopItemSource(shopItem.id, 100, false, [item]));
    items.set(item.id, item);

    const priorizer = (current: GameItem[], next: GameItem): GameItem[] =>
        [...current, next];

    const table = getResultsTable(
        () => true,
        () => true,
        priorizer,
        ["Mov Speed", "Quickslots", "Buffslots", "Charge"],
        "Niki",
    ) as unknown as DomNode;

    const headerRow = table
        .getElementsByTagName("thead")[0]
        ?.getElementsByTagName("tr")[0];
    expect(headerRow).toBeDefined();
    const headerText = headerRow!.textContent;
    expect(headerText).toContain("MS");
    expect(headerText).toContain("QS");
    expect(headerText).toContain("BS");
    expect(headerText).toContain("Charge");
    expect(headerText).not.toMatch(/Mov Speed/);
    expect(headerText).not.toMatch(/Quickslots/);
    expect(headerText).not.toMatch(/Buffslots/);

    const popups = headerRow!.getElementsByClassName("popup_link");
    expect(popups.length).toBe(3);
    for (const popup of popups) {
        expect(popup.getAttribute("aria-haspopup")).toBe("dialog");
        expect(popup.getAttribute("title")).toMatch(
            /Mov Speed|Quick Slots|Buff Slots/,
        );
    }
    const sortedHeaders = headerRow!
        .getElementsByTagName("th")
        .filter((cell) => cell.getAttribute("aria-sort") !== null);
    expect(sortedHeaders).toHaveLength(1);
    expect(sortedHeaders[0].getAttribute("aria-sort")).toBe("descending");
    expect(sortedHeaders[0].textContent).toBe("MS");

    const body = table.tBodies[0];
    const numericCells = body
        .getElementsByTagName("td")
        .filter(
            (cell) =>
                cell.classList.contains("numeric") &&
                !cell.classList.contains("Level_column"),
        );
    const labels = numericCells.map((cell) => cell.getAttribute("data-label"));
    expect(labels).toContain("Mov Speed");
    expect(labels).toContain("Quickslots");
    expect(labels).toContain("Buffslots");
    expect(labels).toContain("Charge");
});
