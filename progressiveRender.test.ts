/// <reference types="bun" />

import { expect, test } from "bun:test";

import {
    ProgressiveBatchRenderer,
    type FrameScheduler,
    type ProgressiveBatchState,
} from "./progressiveRender";

function manualScheduler() {
    let nextHandle = 1;
    const callbacks = new Map<number, FrameRequestCallback>();
    const scheduler: FrameScheduler = {
        request(callback) {
            const handle = nextHandle++;
            callbacks.set(handle, callback);
            return handle;
        },
        cancel(handle) {
            callbacks.delete(handle);
        },
    };
    return {
        scheduler,
        flush() {
            const pending = [...callbacks.entries()];
            callbacks.clear();
            for (const [, callback] of pending) {
                callback(0);
            }
        },
        get size() {
            return callbacks.size;
        },
    };
}

test("commits an initial prefix before frame-budgeted continuation", () => {
    const frames = manualScheduler();
    const commits: { values: number[], state: ProgressiveBatchState }[] = [];
    const completed: ProgressiveBatchState[] = [];
    const renderer = new ProgressiveBatchRenderer<number, number>({
        scheduler: frames.scheduler,
        now: () => 0,
        initialRows: 3,
        rowsPerRequest: 4,
        maxRowsPerFrame: 4,
        frameBudgetMs: 8,
        create: (value) => value,
        commit: (values, state) => commits.push({ values: [...values], state }),
        pause: () => undefined,
        complete: (state) => completed.push(state),
    });

    renderer.start([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(commits.map(({ values }) => values)).toEqual([[0, 1, 2]]);

    renderer.continue();
    frames.flush();
    expect(commits.map(({ values }) => values)).toEqual([
        [0, 1, 2],
        [3, 4, 5, 6],
    ]);

    renderer.continue();
    frames.flush();
    expect(commits.map(({ values }) => values)).toEqual([
        [0, 1, 2],
        [3, 4, 5, 6],
        [7, 8, 9],
    ]);
    expect(completed).toHaveLength(1);
    expect(completed[0].complete).toBe(true);
});

test("a superseding generation prevents stale frame commits", () => {
    const frames = manualScheduler();
    const commits: string[][] = [];
    const renderer = new ProgressiveBatchRenderer<string, string>({
        scheduler: frames.scheduler,
        now: () => 0,
        initialRows: 1,
        rowsPerRequest: 1,
        maxRowsPerFrame: 1,
        frameBudgetMs: 8,
        create: (value) => value,
        commit: (values) => commits.push([...values]),
        pause: () => undefined,
        complete: () => undefined,
    });

    renderer.start(["A1", "A2", "A3"]);
    renderer.continue();
    renderer.start(["B1", "B2"]);
    renderer.continue();
    expect(commits).toEqual([["A1"], ["B1"]]);

    frames.flush();
    expect(commits).toEqual([["A1"], ["B1"], ["B2"]]);
    expect(commits.flat()).not.toContain("A2");
    expect(commits.flat()).not.toContain("A3");
    expect(frames.size).toBe(0);
});

test("stops row creation when the frame budget is exhausted", () => {
    const frames = manualScheduler();
    const commits: number[][] = [];
    let now = 0;
    const renderer = new ProgressiveBatchRenderer<number, number>({
        scheduler: frames.scheduler,
        now: () => now,
        initialRows: 1,
        rowsPerRequest: 20,
        maxRowsPerFrame: 20,
        frameBudgetMs: 8,
        create(value) {
            now += 2;
            return value;
        },
        commit: (values) => commits.push([...values]),
        pause: () => undefined,
        complete: () => undefined,
    });

    renderer.start([0, 1, 2, 3, 4, 5, 6]);
    renderer.continue();
    frames.flush();

    expect(commits[0]).toEqual([0]);
    expect(commits[1]).toEqual([1, 2, 3, 4]);
    expect(frames.size).toBe(1);
});
