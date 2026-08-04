/** Parse a persisted decimal item identifier without accepting partial values. */
export function parseExcludedItemIdToken(token: string): number | undefined {
    if (!/^\d+$/.test(token)) {
        return undefined;
    }
    const id = Number(token);
    return Number.isSafeInteger(id) ? id : undefined;
}

export function serializeExcludedItemIds(ids: ReadonlySet<number>): string {
    return [...ids].join(",");
}
