import React, { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useAsync from "../../hooks/useAsync";
import useListingQuery from "../../hooks/useListingQuery";
import ProductGrid from "../ProductGrid/ProductGrid";
import ProductFilters from "../Filters/ProductFilters";
import SortSelect from "../Filters/SortSelect";
import { EmptyState } from "../States/States";
import { SORT_OPTIONS, DEFAULT_SORT } from "../../data/catalog";
import "./ProductListing.css";

/**
 * Shared listing body: filter rail, sort control, result count, grid and
 * load-more. Category, collection and search pages all render this so the
 * three surfaces cannot drift apart.
 *
 * @param {Function} fetcher  (query, {signal}) => Promise<listing response>
 * @param {Array}    deps     extra values that should re-trigger the fetch
 */
const ProductListing = ({
    fetcher,
    deps = [],
    sortOptions = SORT_OPTIONS,
    defaultSort = DEFAULT_SORT,
    masthead,
    emptyState,
    showFilters = true,
}) => {
    const {
        query,
        update,
        toggleMulti,
        clearFilters,
        loadMore,
        activeFilters,
        hasFilters,
    } = useListingQuery({ defaultSort });

    // Serialised so the effect re-runs on any query change without needing
    // every field spelled out as a dependency.
    const queryKey = JSON.stringify(query);

    const run = useCallback(
        ({ signal }) => fetcher(query, { signal }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [queryKey, ...deps]
    );

    const { data, status, error, retry } = useAsync(run, [queryKey, ...deps]);

    // On failure the previous response is deliberately discarded rather than
    // left on screen: it no longer matches the filters in the URL, so
    // showing it would be actively misleading.
    const products = status === "error" ? [] : data?.items || [];
    const total = status === "error" ? 0 : data?.total ?? 0;
    const facets = data?.facets;

    return (
        <div className="listing">
            {masthead}

            <div className="listing-toolbar">
                <p className="listing-count" aria-live="polite">
                    {status === "loading" && products.length === 0
                        ? "Loading pieces…"
                        : status === "error"
                        ? "Couldn't load results"
                        : total === 0
                        ? "No pieces match"
                        : `Showing ${data?.showingFrom ?? 1}\u2013${
                              data?.showingTo ?? products.length
                          } of ${total} ${total === 1 ? "piece" : "pieces"}`}
                </p>

                <SortSelect
                    options={sortOptions}
                    value={query.sort}
                    onChange={(sort) => update({ sort })}
                />
            </div>

            {activeFilters.length > 0 && (
                <motion.ul className="listing-chips" layout>
                    <AnimatePresence initial={false}>
                        {activeFilters.map((chip) => (
                            <motion.li
                                key={chip.key}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.18 }}
                            >
                                <button
                                    type="button"
                                    className="listing-chip"
                                    onClick={chip.remove}
                                    aria-label={`Remove filter: ${chip.label}`}
                                >
                                    {chip.label}
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                    <li>
                        <button
                            type="button"
                            className="listing-chip listing-chip-clear"
                            onClick={clearFilters}
                        >
                            Clear all
                        </button>
                    </li>
                </motion.ul>
            )}

            <div
                className={`listing-layout ${
                    showFilters ? "" : "listing-layout-full"
                }`}
            >
                {showFilters && (
                    <aside className="listing-rail" aria-label="Filters">
                        <ProductFilters
                            facets={facets}
                            query={query}
                            onToggleSize={(size) => toggleMulti("size", size)}
                            onToggleColor={(color) => toggleMulti("color", color)}
                            onUpdate={update}
                            onClear={clearFilters}
                            hasFilters={hasFilters}
                            resultCount={total}
                        />
                    </aside>
                )}

                <div className="listing-results">
                    <ProductGrid
                        products={products}
                        status={status}
                        error={error}
                        onRetry={retry}
                        skeletonCount={8}
                        emptyState={
                            emptyState || (
                                <EmptyState
                                    eyebrow="NO MATCHES"
                                    title="Nothing matches those filters"
                                    message="Try widening your price range or clearing a filter."
                                    actionLabel={
                                        hasFilters ? "Clear all filters" : undefined
                                    }
                                    onAction={hasFilters ? clearFilters : undefined}
                                    linkTo="/"
                                    linkLabel="Back to shop"
                                />
                            )
                        }
                    />

                    {data?.hasMore && (
                        <div className="listing-more">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={loadMore}
                                disabled={status === "loading"}
                            >
                                {status === "loading"
                                    ? "Loading…"
                                    : `Load more (${total - products.length} left)`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
