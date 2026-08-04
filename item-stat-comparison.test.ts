/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import { installDomWindowHarness } from "./test-support/dom-window-harness";

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

test("enchantable item stats expose simultaneous base and enchanted values", async () => {
    restoreDom = installDomWindowHarness();
    const itemLookup = await import("./itemLookup");
    const projectStats = (itemLookup as typeof itemLookup & {
        itemDetailStats?: (item: InstanceType<typeof itemLookup.Item>) => {
            label: string;
            base: number;
            enchanted?: number;
        }[];
    }).itemDetailStats;

    expect(typeof projectStats).toBe("function");

    const item = new itemLookup.Item();
    item.element_enchantable = true;
    item.str = 5;
    item.max_str = 12;
    item.dex = 2;
    item.max_dex = 2;
    item.quickslots = 1;

    const stats = projectStats!(item);
    expect(stats).toContainEqual({ label: "Strength", base: 5, enchanted: 12 });
    expect(stats).toContainEqual({ label: "Dexterity", base: 2, enchanted: 2 });
    expect(stats).toContainEqual({ label: "Quickslots", base: 1 });
});

test("non-enchantable item stats never invent enchanted values", async () => {
    restoreDom = installDomWindowHarness();
    const itemLookup = await import("./itemLookup");
    const projectStats = (itemLookup as typeof itemLookup & {
        itemDetailStats?: (item: InstanceType<typeof itemLookup.Item>) => {
            label: string;
            base: number;
            enchanted?: number;
        }[];
    }).itemDetailStats;

    expect(typeof projectStats).toBe("function");

    const item = new itemLookup.Item();
    item.str = 5;
    item.max_str = 12;

    expect(projectStats!(item)).toContainEqual({ label: "Strength", base: 5 });
});
