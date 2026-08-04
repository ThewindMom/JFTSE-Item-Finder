/// <reference types="bun" />

import { beforeEach, expect, test } from "bun:test";

import { selectByPriority, type PriorityComparator } from "./priority";
import { Variable_storage } from "./storage";

class MemoryStorage {
    private readonly values = new Map<string, string>();

    get length(): number {
        return this.values.size;
    }

    clear(): void {
        this.values.clear();
    }

    getItem(key: string): string | null {
        return this.values.get(key) ?? null;
    }

    key(index: number): string | null {
        return Array.from(this.values.keys())[index] ?? null;
    }

    removeItem(key: string): void {
        this.values.delete(key);
    }

    setItem(key: string, value: string): void {
        this.values.set(key, value);
    }
}

beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: new MemoryStorage(),
    });
});

test("persists typed filter values", () => {
    Variable_storage.set_variable("Character", "LunLun");
    Variable_storage.set_variable("Level", 80);
    Variable_storage.set_variable("Enchant", true);

    expect(Variable_storage.get_variable("Character")).toBe("LunLun");
    expect(Variable_storage.get_variable("Level")).toBe(80);
    expect(Variable_storage.get_variable("Enchant")).toBe(true);
    expect(Variable_storage.variables).toEqual({
        Character: "LunLun",
        Level: 80,
        Enchant: true,
    });

    Variable_storage.delete_variable("Enchant");
    expect(Variable_storage.get_variable("Enchant")).toBeUndefined();

    Variable_storage.clear_all();
    expect(Variable_storage.variables).toEqual({});
});

test("orders every candidate by lexicographic priority without dropping lower ranks", () => {
    type Candidate = {
        name: string;
        primary: number;
        secondary: number;
    };
    const comparators: PriorityComparator<Candidate>[] = [
        (lhs, rhs) => Math.sign(lhs.primary - rhs.primary),
        (lhs, rhs) => Math.sign(lhs.secondary - rhs.secondary),
    ];
    const current = { name: "current", primary: 10, secondary: 2 };

    expect(selectByPriority(
        [current],
        { name: "better primary", primary: 11, secondary: 0 },
        comparators,
    ).map(({ name }) => name)).toEqual(["better primary", "current"]);

    expect(selectByPriority(
        [current],
        { name: "worse primary", primary: 9, secondary: 99 },
        comparators,
    ).map(({ name }) => name)).toEqual(["current", "worse primary"]);

    expect(selectByPriority(
        [current],
        { name: "better secondary", primary: 10, secondary: 3 },
        comparators,
    ).map(({ name }) => name)).toEqual(["better secondary", "current"]);

    expect(selectByPriority(
        [current],
        { name: "exact tie", primary: 10, secondary: 2 },
        comparators,
    ).map(({ name }) => name)).toEqual(["current", "exact tie"]);
});
