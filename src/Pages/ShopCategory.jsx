import React, { useCallback } from "react";
import { getCategory } from "../api/products";
import ProductListing from "../Components/Listing/ProductListing";
import PageHeader from "../Components/PageHeader/PageHeader";
import { CATEGORIES, categoryTitle } from "../data/catalog";

const LEDE = {
    women: "Considered pieces cut for everyday wear — natural fibres, relaxed lines and a palette built to layer.",
    men: "Workwear proportions and honest fabrics, cut for real weather and repeated wearing.",
    kid: "Hard-wearing clothes for hard-wearing days. Adjustable where it matters, soft everywhere it should be.",
};

const ShopCategory = ({ category, banner }) => {
    const meta = CATEGORIES.find((c) => c.key === category);

    const fetcher = useCallback(
        (query, options) => getCategory(category, query, options),
        [category]
    );

    return (
        <ProductListing
            fetcher={fetcher}
            deps={[category]}
            masthead={
                <PageHeader
                    index={meta?.index || "00"}
                    eyebrow="CATEGORY"
                    title={categoryTitle(category).toUpperCase()}
                    lede={LEDE[category]}
                    banner={banner}
                    bannerAlt={`${meta?.label || "Catalogue"} collection`}
                />
            }
        />
    );
};

export default ShopCategory;
