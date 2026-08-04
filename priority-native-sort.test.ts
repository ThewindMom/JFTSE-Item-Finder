/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import { selectByPriority } from "./priority";
import { installDomWindowHarness } from "./test-support/dom-window-harness";

type Candidate = {
    readonly id: number;
    readonly score: number;
};

const descendingScore = (lhs: Candidate, rhs: Candidate): number =>
    lhs.score - rhs.score;

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

test("priority ranking keeps descending order and FIFO ties", () => {
    const candidates: Candidate[] = [
        { id: 1, score: 2 },
        { id: 2, score: 5 },
        { id: 3, score: 5 },
        { id: 4, score: 1 },
    ];

    const ranked = candidates.reduce(
        (current, candidate) =>
            selectByPriority(current, candidate, [descendingScore]),
        [] as Candidate[],
    );

    expect(ranked.map(candidate => candidate.id)).toEqual([2, 3, 1, 4]);
});

test("equipment buckets rank 4096 candidates with subquadratic comparisons", async () => {
    restoreDom = installDomWindowHarness();
    const { getResultsTablePlan, Item, items } = await import("./itemLookup");
    type GameItem = InstanceType<typeof Item>;

    items.clear();
    for (let index = 0; index < 4_096; index += 1) {
        const item = new Item();
        item.id = index + 1;
        item.name_en = `Candidate ${index + 1}`;
        item.part = "Hat";
        item.character = "Niki";
        item.movement = 4_096 - index;
        items.set(item.id, item);
    }

    let comparisons = 0;
    const compareMovement = (lhs: GameItem, rhs: GameItem): number => {
        comparisons += 1;
        return lhs.movement - rhs.movement;
    };
    const priorizer = Object.assign(
        (current: GameItem[], candidate: GameItem) =>
            selectByPriority(current, candidate, [compareMovement]),
        {
            compare: compareMovement,
            sortAll(candidates: readonly GameItem[]): GameItem[] {
                return candidates
                    .map((candidate, index) => ({ candidate, index }))
                    .sort((lhs, rhs) =>
                        compareMovement(rhs.candidate, lhs.candidate)
                        || lhs.index - rhs.index
                    )
                    .map(({ candidate }) => candidate);
            },
        },
    );

    const plan = getResultsTablePlan(
        () => true,
        () => true,
        priorizer,
        ["Mov Speed"],
        "Niki",
    );

    expect(plan.totalRows).toBe(4_096);
    expect(comparisons).toBeLessThan(100_000);
});
