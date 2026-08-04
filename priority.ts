export type PriorityComparator<T> = (lhs: T, rhs: T) => number;

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
