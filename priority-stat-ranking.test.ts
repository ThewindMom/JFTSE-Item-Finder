/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import { selectByPriority } from "./priority";
import { installDomWindowHarness } from "./test-support/dom-window-harness";

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
