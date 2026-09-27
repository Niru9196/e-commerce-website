import React, { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { search } from "../api/products";
import ProductListing from "../Components/Listing/ProductListing";
import PageHeader from "../Components/PageHeader/PageHeader";
import { EmptyState } from "../Components/States/States";
import { CATEGORIES, SORT_OPTIONS } from "../data/catalog";

/** Relevance is only meaningful for a search, so it's prepended here. */
const SEARCH_SORT_OPTIONS = [
    { value: "relevance", label: "Relevance" },
    ...SORT_OPTIONS.filter((option) => option.value !== "featured"),
];

const SUGGESTIONS = ["linen", "merino", "denim", "knitwear", "cotton", "sage"];

const Search = () => {
    const [searchParams] = useSearchParams();
    const term = (searchParams.get("q") || "").trim();

    const fetcher = useCallback(
        (query, options) => search(term, query, options),
        [term]
    );

    return (
        <ProductListing
            fetcher={fetcher}
            deps={[term]}
            defaultSort="relevance"
            sortOptions={SEARCH_SORT_OPTIONS}
            masthead={
                <PageHeader
                    eyebrow="SEARCH"
                    title={term ? `“${term}”` : "Search"}
                    lede={
                        term
                            ? "Matching across names, fabrics, colours and categories."
                            : "Search the catalogue by name, fabric, colour or category."
                    }
                    breadcrumbProps={{ query: term }}
                />
            }
            emptyState={
                <EmptyState
                    eyebrow="NO MATCHES"
                    title={
                        term
                            ? `Nothing matches “${term}”`
                            : "Start with a search term"
                    }
                    message={
                        term
                            ? "Check the spelling, or try a broader term — a fabric, a colour, or a category."
                            : "Try a fabric, a colour, or browse a category below."
                    }
                >
                    <div className="state-suggestions">
                        {SUGGESTIONS.map((suggestion) => (
                            <Link
                                key={suggestion}
                                className="state-suggestion"
                                to={`/search?q=${encodeURIComponent(suggestion)}`}
                            >
                                {suggestion}
                            </Link>
                        ))}
                    </div>
                    <div className="state-suggestions">
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category.key}
                                className="state-suggestion"
                                to={category.path}
                            >
                                {category.label}
                            </Link>
                        ))}
                        <Link className="state-suggestion" to="/new-arrivals">
                            New arrivals
                        </Link>
                        <Link className="state-suggestion" to="/sale">
                            Sale
                        </Link>
                    </div>
                </EmptyState>
            }
        />
    );
};

export default Search;
