export type PriorityComparator<T> = (lhs: T, rhs: T) => number;

export type PriorityRanker<T> = {
    (current: T[], candidate: T): T[];
    compare(lhs: T, rhs: T): number;
    sortAll(items: readonly T[]): T[];
};

export function compareByPriority<T>(
    lhs: T,
    rhs: T,
    comparators: readonly PriorityComparator<T>[],
): number {
    for (const comparator of comparators) {
        const result = comparator(lhs, rhs);
        if (result !== 0) {
            return result;
        }
    }
    return 0;
}

/**
 * Rank one complete candidate bucket with a single native stable sort.
 * Higher comparator values rank first; original indexes preserve FIFO ties.
 */
export function sortByPriority<T>(
    items: readonly T[],
    comparators: readonly PriorityComparator<T>[],
): T[] {
    return items
        .map((item, index) => ({ item, index }))
        .sort((lhs, rhs) =>
            compareByPriority(rhs.item, lhs.item, comparators)
            || lhs.index - rhs.index
        )
        .map(({ item }) => item);
}

/**
 * Insert `candidate` into a best-first ranking.
 * Higher comparator values mean the left-hand item ranks better.
 * Every candidate is retained so the UI can show the full filtered inventory.
 */
export function selectByPriority<T>(
    current: T[],
    candidate: T,
    comparators: readonly PriorityComparator<T>[],
): T[] {
    if (current.length === 0) {
        return [candidate];
    }

    let insertAt = current.length;
    for (let index = 0; index < current.length; index += 1) {
        let decided = 0;
        for (const comparator of comparators) {
            const result = comparator(current[index], candidate);
            if (result !== 0) {
                decided = result;
                break;
            }
        }
        if (decided < 0) {
            // current[index] is worse than candidate: insert before it.
            insertAt = index;
            break;
        }
        // decided > 0: current item is better; keep scanning.
        // decided === 0: exact tie; keep scanning so ties stay stable/FIFO.
    }

    return [
        ...current.slice(0, insertAt),
        candidate,
        ...current.slice(insertAt),
    ];
}

export function createPriorityRanker<T>(
    comparators: readonly PriorityComparator<T>[],
): PriorityRanker<T> {
    return Object.assign(
        (current: T[], candidate: T) =>
            selectByPriority(current, candidate, comparators),
        {
            compare: (lhs: T, rhs: T) =>
                compareByPriority(lhs, rhs, comparators),
            sortAll: (items: readonly T[]) =>
                sortByPriority(items, comparators),
        },
    );
}

/**
 * Merge independently ranked runs into one stable best-first ranking.
 * Each input must already use the same `comparator` ordering.
 */
export function mergePriorityRankings<T>(
    rankings: readonly (readonly T[])[],
    comparator: PriorityComparator<T>,
): T[] {
    const cursors = rankings.map(() => 0);
    const merged: T[] = [];

    while (true) {
        let winnerRun = -1;
        for (let run = 0; run < rankings.length; run += 1) {
            if (cursors[run] >= rankings[run].length) {
                continue;
            }
            if (winnerRun === -1) {
                winnerRun = run;
                continue;
            }

            const winner = rankings[winnerRun][cursors[winnerRun]];
            const challenger = rankings[run][cursors[run]];
            if (comparator(winner, challenger) < 0) {
                winnerRun = run;
            }
        }

        if (winnerRun === -1) {
            return merged;
        }

        merged.push(rankings[winnerRun][cursors[winnerRun]]);
        cursors[winnerRun] += 1;
    }
}
