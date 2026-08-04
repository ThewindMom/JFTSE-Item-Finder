/// <reference types="bun" />

import { expect, test } from "bun:test";

import { installMemoryLocalStorage } from "./test-support/dom-window-harness";
import { Variable_storage } from "./storage";

/**
 * EXCLUSION_PERSISTENCE_WIPE_ON_LOAD
 *
 * Contract: restoreSelection must rehydrate excluded_item_ids into memory before any
 * path that can call updateResults() → saveSelection(). Otherwise save writes the still-
 * empty Set and wipes localStorage (e.g. s929 → s) before the later rehydrate reads it.
 */
test("restoreSelection rehydrates excluded_item_ids before save-capable event dispatches", async () => {
    const main = await Bun.file(new URL("./main.ts", import.meta.url)).text();
    const restoreMatch = main.match(/function restoreSelection\(\) \{[\s\S]*?\n\}\n\nfunction updateResults/);
    expect(restoreMatch).not.toBeNull();
    const restoreBody = restoreMatch![0];

    const rehydrateAt = restoreBody.indexOf('Variable_storage.get_variable("excluded_item_ids")');
    const changeDispatchAt = restoreBody.indexOf('dispatchEvent(new Event("change"');
    const inputDispatchAt = restoreBody.indexOf('dispatchEvent(new Event("input"');

    expect(rehydrateAt).toBeGreaterThan(-1);
    expect(changeDispatchAt).toBeGreaterThan(-1);
    expect(inputDispatchAt).toBeGreaterThan(-1);

    // Both change (itemTypeSelector) and input (levelrange) call updateResults → saveSelection.
    expect(rehydrateAt).toBeLessThan(changeDispatchAt);
    expect(rehydrateAt).toBeLessThan(inputDispatchAt);
});

test("modeled restore must not save empty exclusions over persisted ids", async () => {
    // Mirrors Variable_storage string encoding + the restore/save ordering contract.
    installMainImportSeam();
    const { parseExcludedItemIdToken } = await import("./main");

    const storage = new Map<string, string>();
    storage.set("excluded_item_ids", "s929");

    const excluded_item_ids = new Set<number>();

    function saveSelection() {
        storage.set("excluded_item_ids", `s${Array.from(excluded_item_ids).join(",")}`);
    }

    function restoreExclusions() {
        const excluded_ids = storage.get("excluded_item_ids")?.slice(1);
        if (typeof excluded_ids === "string") {
            for (const id of excluded_ids.split(",")) {
                const parsed = parseExcludedItemIdToken(id);
                if (parsed !== undefined) {
                    excluded_item_ids.add(parsed);
                }
            }
        }
    }

    // Correct contract: rehydrate, then any save-capable update path.
    restoreExclusions();
    saveSelection(); // models change/input → updateResults → saveSelection after rehydrate

    expect(storage.get("excluded_item_ids")).toBe("s929");
    expect(Array.from(excluded_item_ids)).toEqual([929]);
});

/**
 * EXCLUSION_STORAGE_TOKEN_BOUNDARY
 *
 * Contract: restoreSelection must accept only digits-only safe-integer tokens from
 * excluded_item_ids. parseInt silently accepts corrupt values (929oops → 929, 0x10 → 16).
 * Seam: real Variable_storage encode/decode + parseExcludedItemIdToken used by restoreSelection.
 */
test("exclusion restore ignores malformed tokens while restoring valid decimal ids", async () => {
    installMainImportSeam();
    const memory = installMemoryLocalStorage();
    const { parseExcludedItemIdToken } = await import("./main");

    const unsafeInteger = String(Number.MAX_SAFE_INTEGER + 1);
    expect(Number.isSafeInteger(Number(unsafeInteger))).toBe(false);

    // Wire format: Variable_storage type tag `s` + comma-separated id tokens.
    memory.setItem(
        "excluded_item_ids",
        `s${[
            "929oops", // partial number — parseInt would accept 929
            "0x10", // hex-like prefix — parseInt would accept 16
            "-5", // negative
            "12.5", // decimal
            unsafeInteger, // unsafe integer
            "", // empty token
            "929", // valid decimal id
            "foo", // non-numeric
            "+7", // signed positive
        ].join(",")}`,
    );

    expect(memory.getItem("excluded_item_ids")?.startsWith("s")).toBe(true);

    const excluded_item_ids = new Set<number>();

    function restoreExclusions() {
        const excluded_ids = Variable_storage.get_variable("excluded_item_ids");
        if (typeof excluded_ids === "string") {
            for (const id of excluded_ids.split(",")) {
                const parsed = parseExcludedItemIdToken(id);
                if (parsed !== undefined) {
                    excluded_item_ids.add(parsed);
                }
            }
        }
    }

    function saveSelection() {
        Variable_storage.set_variable(
            "excluded_item_ids",
            Array.from(excluded_item_ids).join(","),
        );
    }

    // Same ordering as restoreSelection: rehydrate, then a save-capable path.
    restoreExclusions();
    saveSelection();

    expect(Array.from(excluded_item_ids)).toEqual([929]);
    expect(memory.getItem("excluded_item_ids")).toBe("s929");
    expect(Variable_storage.get_variable("excluded_item_ids")).toBe("929");
});

/** Minimal DOM so main.ts can load and export parseExcludedItemIdToken. */
function installMainImportSeam(): void {
    class El {
        tagName: string;
        children: unknown[] = [];
        className = "";
        hidden = false;
        textContent = "";
        value = "";
        max = "80";
        checked = false;
        dataset: Record<string, string> = {};
        style: Record<string, string> = {};
        classList = {
            add() {},
            remove() {},
            contains() {
                return false;
            },
            toggle() {},
        };

        constructor(tag: string) {
            this.tagName = String(tag).toUpperCase();
        }

        setAttribute() {}
        getAttribute() {
            return null;
        }
        append() {}
        appendChild<T>(node: T): T {
            return node;
        }
        addEventListener() {}
        removeEventListener() {}
        replaceChildren() {}
        focus() {}
        dispatchEvent() {
            return true;
        }
        getElementsByClassName() {
            return [];
        }
        getElementsByTagName() {
            return [];
        }
        querySelector() {
            return null;
        }
        querySelectorAll() {
            return [];
        }
        get childNodes() {
            return this.children;
        }
    }

    const byId: Record<string, El> = {
        levelDisplay: new El("label"),
        levelrange: Object.assign(new El("input"), { value: "80", max: "80" }),
        nameFilter: new El("input"),
        enchantToggle: Object.assign(new El("input"), { checked: false }),
        priority_list: new El("ol"),
    };

    const g = globalThis as Record<string, unknown>;
    g.HTMLElement = El;
    g.HTMLLabelElement = El;
    g.HTMLInputElement = El;
    g.HTMLButtonElement = El;
    g.HTMLOListElement = El;
    g.HTMLUListElement = El;
    g.HTMLDivElement = El;
    g.HTMLFieldSetElement = El;
    g.HTMLTableElement = El;
    g.HTMLDialogElement = El;
    g.Event = class {
        type: string;
        constructor(type: string) {
            this.type = type;
        }
    };

    if (!g.localStorage) {
        installMemoryLocalStorage();
    }

    g.document = {
        body: new El("body"),
        createElement: (tag: string) => new El(tag),
        createTextNode: (text: string) => String(text),
        getElementById: (id: string) => byId[id] ?? null,
        getElementsByClassName: () => [],
        getElementsByName: () => [],
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener() {},
    };
    g.window = globalThis;
    (globalThis as { addEventListener?: unknown }).addEventListener = () => {};
    (globalThis as { matchMedia?: unknown }).matchMedia = () => ({
        addEventListener() {},
        matches: true,
    });
}
