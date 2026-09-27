import React, { useEffect, useState } from "react";
import "./ProductFilters.css";

const PRICE_BANDS = [
    { label: "Under $40", min: undefined, max: 40 },
    { label: "$40 – $80", min: 40, max: 80 },
    { label: "$80 – $120", min: 80, max: 120 },
    { label: "$120 and over", min: 120, max: undefined },
];

const bandMatches = (band, query) =>
    (band.min ?? null) === (query.minPrice ?? null) &&
    (band.max ?? null) === (query.maxPrice ?? null);

/**
 * Faceted filters for a listing.
 *
 * Each group is a fieldset with a legend, which is what lets a screen
 * reader announce "Size, group" before the checkboxes rather than reading
 * ten unlabelled controls in a row.
 *
 * Facet counts come from the *unfiltered* result set so options don't
 * collapse to zero as the user narrows down.
 */
const ProductFilters = ({
    facets,
    query,
    onToggleSize,
    onToggleColor,
    onUpdate,
    onClear,
    hasFilters,
    resultCount,
}) => {
    // On mobile the rail is collapsed behind a disclosure so it doesn't
    // push the products off-screen.
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(min-width: 1025px)");
        const sync = () => setExpanded(media.matches);
        sync();
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
    }, []);

    if (!facets) return null;

    return (
        <div className="filters">
            <div className="filters-head">
                <h2 className="filters-title">Filter</h2>
                <button
                    type="button"
                    className="filters-disclosure"
                    onClick={() => setExpanded((e) => !e)}
                    aria-expanded={expanded}
                    aria-controls="filters-body"
                >
                    {expanded ? "Hide" : "Show"} filters
                </button>
            </div>

            <div
                id="filters-body"
                className={`filters-body ${expanded ? "is-expanded" : ""}`}
            >
                <fieldset className="filters-group">
                    <legend>Price</legend>
                    <ul>
                        {PRICE_BANDS.map((band) => {
                            const checked = bandMatches(band, query);
                            return (
                                <li key={band.label}>
                                    <label className="filters-check">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                                onUpdate({
                                                    minPrice: checked
                                                        ? null
                                                        : band.min ?? null,
                                                    maxPrice: checked
                                                        ? null
                                                        : band.max ?? null,
                                                })
                                            }
                                        />
                                        <span>{band.label}</span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </fieldset>

                <fieldset className="filters-group">
                    <legend>Size</legend>
                    <ul className="filters-size-list">
                        {facets.sizes.map((size) => (
                            <li key={size.label}>
                                <label className="filters-check">
                                    <input
                                        type="checkbox"
                                        checked={query.sizes.includes(size.label)}
                                        onChange={() => onToggleSize(size.label)}
                                    />
                                    <span>
                                        {size.label}
                                        <span className="filters-count">
                                            {size.count}
                                        </span>
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <fieldset className="filters-group">
                    <legend>Colour</legend>
                    <ul>
                        {facets.colors.map((color) => (
                            <li key={color.key}>
                                <label className="filters-check">
                                    <input
                                        type="checkbox"
                                        checked={query.colors.includes(color.key)}
                                        onChange={() => onToggleColor(color.key)}
                                    />
                                    <span
                                        className="filters-color-dot"
                                        style={{ background: color.hex }}
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {color.name}
                                        <span className="filters-count">
                                            {color.count}
                                        </span>
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <fieldset className="filters-group">
                    <legend>Offers</legend>
                    <ul>
                        <li>
                            <label className="filters-check">
                                <input
                                    type="checkbox"
                                    checked={query.onSale}
                                    onChange={() =>
                                        onUpdate({ onSale: !query.onSale })
                                    }
                                />
                                <span>
                                    Reduced
                                    <span className="filters-count">
                                        {facets.saleCount}
                                    </span>
                                </span>
                            </label>
                        </li>
                    </ul>
                </fieldset>

                {hasFilters && (
                    <button
                        type="button"
                        className="btn btn-outline btn-sm filters-clear"
                        onClick={onClear}
                    >
                        Clear all filters
                    </button>
                )}

                <p className="filters-result-count" aria-live="polite">
                    {resultCount} {resultCount === 1 ? "piece" : "pieces"} match
                </p>
            </div>
        </div>
    );
};

export default ProductFilters;
