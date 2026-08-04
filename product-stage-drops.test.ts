/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import {
    installDomWindowHarness,
    type DomNode,
} from "./test-support/dom-window-harness";
import { projectJson } from "./test-support/ui-contract-fixtures";

let restoreDom: (() => void) | undefined;

afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
});

test("product-stage-drops asset maps Blue Capsule to DevaBergBoss", async () => {
    const data = await projectJson<{
        products: Record<string, Array<{ map: string; needBoss: boolean }>>;
        productCount: number;
    }>("./assets/product-stage-drops.json");

    expect(data.productCount).toBeGreaterThan(0);
    expect(data.products["57837"]).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ map: "DevaBergBoss", needBoss: true }),
        ]),
    );
});

test("Blue Capsule source strip shows Not for sale and Boss · Deva Berg", async () => {
    restoreDom = installDomWindowHarness();
    const itemLookup = await import("./itemLookup");
    const { getResultsTable, hydrateCatalog } = itemLookup;
    hydrateCatalog(await projectJson<unknown>("./assets/catalog.json"));

    const table = getResultsTable(
        (item) => item.character === "Shua",
        () => true,
        (current, item) => [...current, item],
        ["Str"],
        "Shua",
    ) as unknown as DomNode;

    expect(table.textContent).toContain("Blue Capsule");
    expect(table.textContent).toContain("Not for sale");
    expect(table.textContent).toContain("Boss · Deva Berg");

    const body = table.tBodies[0];
    const rows = body!.children.filter(
        (child): child is DomNode => typeof child !== "string" && child.tagName === "TR",
    );
    const row = rows.find((c) => c.textContent.includes("JFTSE Modulator(Red)"));
    expect(row).toBeDefined();
    const bossChips = collectByClass(row!, "gacha-source-channel--boss");
    expect(bossChips.length).toBeGreaterThanOrEqual(1);
    expect(bossChips.some((chip) => chip.textContent.includes("Boss · Deva Berg"))).toBe(true);
});

function collectByClass(root: DomNode, className: string): DomNode[] {
    const found: DomNode[] = [];
    const walk = (node: DomNode | string) => {
        if (typeof node === "string") {
            return;
        }
        if ((node.className || "").split(/\s+/).includes(className)) {
            found.push(node);
        }
        for (const child of node.children) {
            walk(child);
        }
    };
    walk(root);
    return found;
}
