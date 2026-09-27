import React from "react";
import Item from "../Item/Item";
import { SkeletonGrid } from "../Skeleton/Skeleton";
import { EmptyState, ErrorState } from "../States/States";
import { StaggerGroup, StaggerItem } from "../Motion/Reveal";
import "./ProductGrid.css";

/**
 * Renders a product grid together with its loading, error and empty
 * states. Centralised so every listing surface (home rails, category,
 * collection, search, wishlist) behaves identically instead of each page
 * reinventing the three states.
 */
const ProductGrid = ({
    products = [],
    status,
    error,
    onRetry,
    skeletonCount = 8,
    className = "",
    emptyState,
    animate = true,
}) => {
    if (status === "loading" && products.length === 0) {
        return (
            <>
                <SkeletonGrid count={skeletonCount} className={className} />
                <span className="sr-only" role="status">
                    Loading products
                </span>
            </>
        );
    }

    if (status === "error" && products.length === 0) {
        return (
            <ErrorState
                title="Couldn't load these pieces"
                error={error}
                onRetry={onRetry}
            />
        );
    }

    if (products.length === 0) {
        return (
            emptyState || (
                <EmptyState
                    title="No pieces to show"
                    message="There's nothing in this part of the catalogue right now."
                    linkTo="/"
                    linkLabel="Back to shop"
                />
            )
        );
    }

    if (!animate) {
        return (
            <div className={`product-grid ${className}`}>
                {products.map((product) => (
                    <Item key={product.id} product={product} />
                ))}
            </div>
        );
    }

    return (
        <StaggerGroup className={`product-grid ${className}`}>
            {products.map((product) => (
                <StaggerItem key={product.id}>
                    <Item product={product} />
                </StaggerItem>
            ))}
        </StaggerGroup>
    );
};

export default ProductGrid;
