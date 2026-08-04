/** Internal priority keys → short table header + human full name for tooltips. */
const PRIORITY_STAT_HEADER_ABBREV: Readonly<
    Record<string, { readonly short: string; readonly full: string }>
> = {
    "Mov Speed": { short: "MS", full: "Mov Speed" },
    "Quickslots": { short: "QS", full: "Quick Slots" },
    "Buffslots": { short: "BS", full: "Buff Slots" },
};

export type PriorityStatHeaderDisplay = {
    readonly short: string;
    readonly full: string;
    readonly abbreviated: boolean;
};

/** Map a priority stat key (or combined "A+B") to short header text + full tooltip name. */
export function priorityStatHeaderDisplay(stat: string): PriorityStatHeaderDisplay {
    const parts = stat.split("+");
    const mapped = parts.map((part) => {
        const known = PRIORITY_STAT_HEADER_ABBREV[part];
        return known ?? { short: part, full: part };
    });
    const short = mapped.map((part) => part.short).join("+");
    const full = mapped.map((part) => part.full).join("+");
    return {
        short,
        full,
        abbreviated: short !== full,
    };
}
