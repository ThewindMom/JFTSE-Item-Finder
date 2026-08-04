/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import { selectByPriority } from "./priority";
import {
    installDomWindowHarness,
    type DomNode,
} from "./test-support/dom-window-harness";

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

const cases = [
    { field: "movement", label: "Mov Speed" },
    { field: "quickslots", label: "Quickslots" },
    { field: "buffslots", label: "Buffslots" },
] as const;

for (const { field, label } of cases) {
    test(`${label} priority ranks higher values first`, async () => {
        restoreDom = installDomWindowHarness();
        const { Item } = await import("./itemLookup");

        const lower = new Item();
        lower.name_en = `Lower ${label}`;
        lower[field] = 1;

        const higher = new Item();
        higher.name_en = `Higher ${label}`;
        higher[field] = 5;

        const comparator = (lhs: InstanceType<typeof Item>, rhs: InstanceType<typeof Item>) =>
            lhs.statFromString(label) - rhs.statFromString(label);
        const ranked = [lower, higher].reduce(
            (current, candidate) => selectByPriority(current, candidate, [comparator]),
            [] as InstanceType<typeof Item>[],
        );

        expect(ranked.map(item => item.name_en)).toEqual([
            `Higher ${label}`,
            `Lower ${label}`,
        ]);
    });
}

for (const { field, label } of cases) {
    test(`${label} rank one orders matching equipment globally across parts`, async () => {
        restoreDom = installDomWindowHarness();
        const { Item, getResultsTable, items } = await import("./itemLookup");
        type GameItem = InstanceType<typeof Item>;

        const makeItem = (
            id: number,
            name: string,
            part: GameItem["part"],
            value: number,
        ) => {
            const item = new Item();
            item.id = id;
            item.name_en = name;
            item.part = part;
            item.character = "Niki";
            item.level = 1;
            item[field] = value;
            items.set(id, item);
        };

        items.clear();
        makeItem(1, "Zero Hat", "Hat", 0);
        makeItem(2, "Five Shoes", "Shoes", 5);
        makeItem(3, "Four Racket", "Racket", 4);
        makeItem(4, "Two Upper", "Upper", 2);

        const comparator = (lhs: GameItem, rhs: GameItem) =>
            lhs.statFromString(label) - rhs.statFromString(label);
        const priorizer = (current: GameItem[], next: GameItem) =>
            selectByPriority(current, next, [comparator]);

        const table = getResultsTable(
            () => true,
            () => true,
            priorizer,
            [label],
            "Niki",
        ) as unknown as DomNode;
        const bodyRows = table.tBodies[0]!.children.filter(
            (child): child is DomNode =>
                typeof child !== "string" && child.tagName === "TR",
        );
        const expectedNames = [
            "Five Shoes",
            "Four Racket",
            "Two Upper",
            "Zero Hat",
        ];
        const renderedNames = bodyRows.map((row) =>
            expectedNames.find((name) => row.textContent.includes(name)),
        );

        expect(renderedNames).toEqual(expectedNames);
        expect(new Set(renderedNames)).toHaveLength(4);
    });
}
