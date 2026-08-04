/// <reference types="bun" />

import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const itemLookup = readFileSync(
    new URL("./itemLookup.ts", import.meta.url),
    "utf8",
);
const style = readFileSync(new URL("./style.css", import.meta.url), "utf8");

test("keeps gacha probabilities in a bounded scroll layer below their sticky header", () => {
    expect(itemLookup).toContain('class: "gacha-probability-dialog__scroll"');
    expect(itemLookup).toContain('"gacha-probability-dialog"');
    expect(style).toMatch(
        /\.gacha-probability-dialog\s*\{[^}]*display:\s*grid;[^}]*overflow:\s*hidden;/s,
    );
    expect(style).toMatch(
        /\.gacha-probability-dialog__scroll\s*\{[^}]*min-height:\s*0;[^}]*overflow:\s*auto;/s,
    );
    expect(style).toMatch(
        /\.gacha-probability-dialog\s*>\s*\.gacha-probability-dialog__close\s*\{[^}]*justify-self:\s*end;[^}]*min-width:\s*8rem;/s,
    );
});
