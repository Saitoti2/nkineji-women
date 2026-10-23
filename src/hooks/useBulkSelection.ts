import { useCallback, useMemo, useState } from "react";

/**
 * Row selection for the admin tables.
 *
 * Selection is kept as a Set of ids rather than a flag on each row, so it
 * survives refetches and filtering. Ids that are no longer on screen are
 * dropped when the visible rows change, so a bulk action can never act on a
 * row the admin can no longer see.
 */
export function useBulkSelection<T extends { id: string }>(rows: T[]) {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const visibleIds = useMemo(() => rows.map((r) => r.id), [rows]);

    // Only ids still present in the current rows count as selected.
    const effective = useMemo(
        () => visibleIds.filter((id) => selected.has(id)),
        [visibleIds, selected]
    );

    const toggle = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const toggleAll = useCallback(() => {
        setSelected((prev) => {
            const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.has(id));
            if (allVisibleSelected) {
                const next = new Set(prev);
                visibleIds.forEach((id) => next.delete(id));
                return next;
            }
            return new Set([...prev, ...visibleIds]);
        });
    }, [visibleIds]);

    const clear = useCallback(() => setSelected(new Set()), []);

    const isSelected = useCallback((id: string) => selected.has(id), [selected]);

    const allSelected = visibleIds.length > 0 && effective.length === visibleIds.length;
    const someSelected = effective.length > 0 && !allSelected;

    return {
        selectedIds: effective,
        count: effective.length,
        isSelected,
        toggle,
        toggleAll,
        clear,
        allSelected,
        someSelected,
    };
}
