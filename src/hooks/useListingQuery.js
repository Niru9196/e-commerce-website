import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_SORT } from "../data/catalog";

/**
 * Filter/sort/pagination state held in the URL rather than component state.
 *
 * Doing it this way means a filtered listing is shareable, survives a
 * reload, and works with the browser's back button — refining filters
 * pushes history entries the user can step back through.
 *
 * Only non-default values are written, so a clean listing keeps a clean URL.
 */
export const PER_PAGE = 12;

const parseNumber = (value) => {
    if (value == null || value === "") return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
};

const useListingQuery = ({ defaultSort = DEFAULT_SORT } = {}) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const query = useMemo(() => {
        const sizes = searchParams.getAll("size");
        const colors = searchParams.getAll("color");

        return {
            q: searchParams.get("q") || "",
            sort: searchParams.get("sort") || defaultSort,
            page: Math.max(1, parseNumber(searchParams.get("page")) || 1),
            perPage: PER_PAGE,
            sizes,
            colors,
            minPrice: parseNumber(searchParams.get("minPrice")),
            maxPrice: parseNumber(searchParams.get("maxPrice")),
            onSale: searchParams.get("onSale") === "1",
        };
    }, [searchParams, defaultSort]);

    /**
     * Applies a patch to the URL. Any filter change resets to page 1 —
     * staying on page 3 of a freshly narrowed result set would usually show
     * nothing.
     */
    const update = useCallback(
        (patch, { resetPage = true } = {}) => {
            const next = new URLSearchParams(searchParams);

            Object.entries(patch).forEach(([key, value]) => {
                next.delete(key);

                if (value == null || value === "" || value === false) return;

                if (Array.isArray(value)) {
                    value.forEach((v) => next.append(key, v));
                } else if (value === true) {
                    next.set(key, "1");
                } else {
                    next.set(key, String(value));
                }
            });

            if (resetPage && !("page" in patch)) next.delete("page");
            if (next.get("page") === "1") next.delete("page");
            if (next.get("sort") === defaultSort) next.delete("sort");

            setSearchParams(next);
        },
        [searchParams, setSearchParams, defaultSort]
    );

    const toggleMulti = useCallback(
        (key, value) => {
            const current = searchParams.getAll(key);
            const next = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            update({ [key]: next });
        },
        [searchParams, update]
    );

    const clearFilters = useCallback(() => {
        const next = new URLSearchParams();
        // Preserve the search term and sort order; only facets are cleared.
        const q = searchParams.get("q");
        const sort = searchParams.get("sort");
        if (q) next.set("q", q);
        if (sort) next.set("sort", sort);
        setSearchParams(next);
    }, [searchParams, setSearchParams]);

    const loadMore = useCallback(() => {
        update({ page: query.page + 1 }, { resetPage: false });
    }, [update, query.page]);

    /** Chips describing the currently applied facets. */
    const activeFilters = useMemo(() => {
        const chips = [];
        query.sizes.forEach((size) =>
            chips.push({
                key: `size-${size}`,
                label: `Size ${size}`,
                remove: () => toggleMulti("size", size),
            })
        );
        query.colors.forEach((color) =>
            chips.push({
                key: `color-${color}`,
                label: color,
                remove: () => toggleMulti("color", color),
            })
        );
        if (query.minPrice != null || query.maxPrice != null) {
            chips.push({
                key: "price",
                label: `$${query.minPrice ?? 0} – $${query.maxPrice ?? "∞"}`,
                remove: () => update({ minPrice: null, maxPrice: null }),
            });
        }
        if (query.onSale) {
            chips.push({
                key: "onSale",
                label: "On sale",
                remove: () => update({ onSale: false }),
            });
        }
        return chips;
    }, [query, toggleMulti, update]);

    return {
        query,
        update,
        toggleMulti,
        clearFilters,
        loadMore,
        activeFilters,
        hasFilters: activeFilters.length > 0,
    };
};

export default useListingQuery;
