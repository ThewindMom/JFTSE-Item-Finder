/// <reference types="bun" />

import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import { selectByPriority, type PriorityComparator } from "./priority";

const CANONICAL_ID_RANGES = [
    [1, 124],
    [137, 175],
    [273, 387],
    [389, 476],
    [478, 587],
    [589, 2199],
    [5000, 10748],
] as const;

const CANONICAL_IDS = CANONICAL_ID_RANGES.flatMap(([first, last]) =>
    Array.from({ length: last - first + 1 }, (_, offset) => first + offset)
);

function loadTrackedEquipmentIds(): number[] {
    const manifest = readFileSync(
        new URL("./assets/item-art-map.json", import.meta.url),
        "utf8",
    );
    const itemsSection = /"items":\{(?<entries>.*?)\},"lotteries":\{/.exec(manifest)
        ?.groups?.entries;
    if (itemsSection === undefined) {
        throw new Error("Tracked item art manifest has no items section");
    }

    // Read keys from the raw JSON so duplicate IDs cannot be hidden by JSON.parse.
    return [...itemsSection.matchAll(/"(?<id>\d+)":\[/g)].map((match) =>
        Number(match.groups?.id)
    );
}

test("tracked equipment manifest has exact canonical ID coverage", () => {
    const ids = loadTrackedEquipmentIds();
    const uniqueIds = new Set(ids);

    expect(CANONICAL_IDS).toHaveLength(7836);
    expect(ids).toHaveLength(CANONICAL_IDS.length);
    expect(uniqueIds.size).toBe(ids.length);
    expect([...uniqueIds].sort((lhs, rhs) => lhs - rhs)).toEqual(CANONICAL_IDS);
});

test("ranking retains every filtered candidate ordered by priority", () => {
    type Candidate = {
        name: string;
        primary: number;
        secondary: number;
    };
    const comparators: PriorityComparator<Candidate>[] = [
        (lhs, rhs) => Math.sign(lhs.primary - rhs.primary),
        (lhs, rhs) => Math.sign(lhs.secondary - rhs.secondary),
    ];
    const pool: Candidate[] = [
        { name: "mid", primary: 10, secondary: 2 },
        { name: "best", primary: 12, secondary: 0 },
        { name: "worst", primary: 8, secondary: 9 },
        { name: "tie-best", primary: 12, secondary: 0 },
        { name: "second", primary: 11, secondary: 4 },
    ];

    const ranked = pool.reduce<Candidate[]>(
        (current, candidate) => selectByPriority(current, candidate, comparators),
        [],
    );

    expect(ranked.map(({ name }) => name)).toEqual([
        "best",
        "tie-best",
        "second",
        "mid",
        "worst",
    ]);
    expect(ranked).toHaveLength(pool.length);
});

test("equipment results wire full priority ordering instead of winner-only subset", async () => {
    const [main, lookup, priority] = await Promise.all([
        Bun.file(new URL("./main.ts", import.meta.url)).text(),
        Bun.file(new URL("./itemLookup.ts", import.meta.url)).text(),
        Bun.file(new URL("./priority.ts", import.meta.url)).text(),
    ]);

    expect(lookup).toContain(
        'hydrateCatalog(JSON.parse(await download("assets/catalog.json")) as unknown)',
    );
    expect(lookup).toContain("priorizer.sortAll");
    expect(lookup).toContain("Matching equipment globally ranked by selected stat priority");
    expect(lookup).not.toContain("Best matching equipment by slot and selected stat priority");
    expect(main).toContain("createPriorityRanker(comparators)");
    expect(priority).toContain(".sort((lhs, rhs)");
    expect(priority).toContain("lhs.index - rhs.index");
});
