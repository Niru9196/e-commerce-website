import React, { useCallback } from "react";
import "./Popular.css";
import { getPopular } from "../../api/products";
import useAsync from "../../hooks/useAsync";
import ProductGrid from "../ProductGrid/ProductGrid";
import { RevealOnScroll } from "../Motion/Reveal";

const Popular = () => {
    const fetchPopular = useCallback(
        ({ signal }) => getPopular({ signal }),
        []
    );
    const { data, status, error, retry } = useAsync(fetchPopular, []);
    const products = data || [];

    return (
        <section className="popular" aria-labelledby="popular-heading">
            <RevealOnScroll className="section-head">
                <span className="cat-index">02 / SELECTED</span>
                <h1 id="popular-heading">Popular this season</h1>
                <span className="sku-tag">
                    {status === "success"
                        ? `${products.length} ITEMS — TOP RATED`
                        : "LOADING SELECTION"}
                </span>
            </RevealOnScroll>
            <hr className="rule" />
            <ProductGrid
                products={products}
                status={status}
                error={error}
                onRetry={retry}
                skeletonCount={8}
                className="product-grid-rail popular-item"
            />
        </section>
    );
};

export default Popular;
