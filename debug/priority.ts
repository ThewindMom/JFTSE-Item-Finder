export type PriorityComparator<T> = (lhs: T, rhs: T) => number;

export function selectByPriority<T>(
    current: T[],
    candidate: T,
    comparators: readonly PriorityComparator<T>[],
): T[] {
    if (current.length === 0) {
        return [candidate];
    }
    for (const comparator of comparators) {
        const result = comparator(current[0], candidate);
        if (result < 0) {
            return [candidate];
        }
        if (result > 0) {
            return current;
        }
    }
    return [...current, candidate];
}
