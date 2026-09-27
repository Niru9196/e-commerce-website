import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import "./NewCollections.css";
import { getNewArrivals } from "../../api/products";
import useAsync from "../../hooks/useAsync";
import ProductGrid from "../ProductGrid/ProductGrid";
import { RevealOnScroll } from "../Motion/Reveal";

const NewCollections = () => {
    const fetchNew = useCallback(
        ({ signal }) => getNewArrivals({ signal }),
        []
    );
    const { data, status, error, retry } = useAsync(fetchNew, []);
    const products = data || [];

    return (
        <section className="new-collections" aria-labelledby="new-heading">
            <RevealOnScroll className="section-head">
                <span className="cat-index">03 / JUST IN</span>
                <h1 id="new-heading">New collections</h1>
                <span className="sku-tag">
                    {status === "success"
                        ? `${products.length} ITEMS — ALL CATEGORIES`
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
                className="product-grid-rail collections"
            />
            <div className="new-collections-footer">
                <Link className="btn btn-outline btn-sm" to="/new-arrivals">
                    View all new arrivals
                </Link>
            </div>
        </section>
    );
};

export default NewCollections;
