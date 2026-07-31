import { expect, test } from "bun:test";

type PurchaseSource = {
    price: number;
    ap: boolean;
};

type GachaEconomics = {
    availability: "direct" | "unavailable";
    chancePercent: number;
    expectedPulls: number;
    currency?: "AP" | "Gold";
    pricePerPull?: number;
    expectedSpend?: number;
};

test("keeps unavailable gacha pricing honest", async () => {
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: { body: { addEventListener() { } } },
    });
    const itemLookup = await import("./itemLookup").finally(() => {
        if (originalDocument) {
            Object.defineProperty(globalThis, "document", {
                configurable: true,
                value: originalDocument,
            });
        }
        else {
            Reflect.deleteProperty(globalThis, "document");
        }
    }) as unknown as {
        projectGachaEconomics?: (
            expectedPulls: number,
            source?: PurchaseSource,
        ) => GachaEconomics;
    };

    expect(typeof itemLookup.projectGachaEconomics).toBe("function");
    if (!itemLookup.projectGachaEconomics) {
        return;
    }

    expect(itemLookup.projectGachaEconomics(20)).toEqual({
        availability: "unavailable",
        chancePercent: 5,
        expectedPulls: 20,
    });
    expect(itemLookup.projectGachaEconomics(20, {
        price: 3000,
        ap: false,
    })).toEqual({
        availability: "direct",
        chancePercent: 5,
        currency: "Gold",
        expectedPulls: 20,
        expectedSpend: 60000,
        pricePerPull: 3000,
    });
    expect(itemLookup.projectGachaEconomics(25, {
        price: 4,
        ap: true,
    })).toEqual({
        availability: "direct",
        chancePercent: 4,
        currency: "AP",
        expectedPulls: 25,
        expectedSpend: 100,
        pricePerPull: 4,
    });

    const renderer = await Bun.file(
        new URL("./itemLookup.ts", import.meta.url),
    ).text();
    expect(renderer).toContain("Not directly purchasable");
    expect(renderer).toContain('class: "gacha-alternatives"');
    expect(renderer).toContain("source !== directSource && sourceFilter(source)");
});
