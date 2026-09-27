import React, { useCallback } from "react";
import { getCollection } from "../api/products";
import ProductListing from "../Components/Listing/ProductListing";
import PageHeader from "../Components/PageHeader/PageHeader";
import { SORT_OPTIONS } from "../data/catalog";

const COLLECTIONS = {
    "new-arrivals": {
        index: "04",
        eyebrow: "JUST IN",
        title: "NEW ARRIVALS",
        lede: "The most recent additions to the catalogue, newest first. Restocks and seasonal one-offs both land here.",
        defaultSort: "newest",
    },
    sale: {
        index: "05",
        eyebrow: "LIMITED RUN",
        title: "THE EDIT",
        lede: "Considered pieces, reduced for a season. Deepest reductions first — sale stock is not repeated once it goes.",
        defaultSort: "price-asc",
    },
};

/**
 * Collection listing. Targets of the hero's "Latest Collection" and the
 * Offers section's "Shop the edit" CTAs, both of which previously went
 * nowhere.
 */
const Collection = ({ collection }) => {
    const meta = COLLECTIONS[collection];

    const fetcher = useCallback(
        (query, options) => getCollection(collection, query, options),
        [collection]
    );

    return (
        <ProductListing
            fetcher={fetcher}
            deps={[collection]}
            defaultSort={meta.defaultSort}
            sortOptions={SORT_OPTIONS}
            masthead={
                <PageHeader
                    index={meta.index}
                    eyebrow={meta.eyebrow}
                    title={meta.title}
                    lede={meta.lede}
                />
            }
        />
    );
};

export default Collection;
