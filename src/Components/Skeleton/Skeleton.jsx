import React from "react";
import "./Skeleton.css";

/**
 * Shimmer placeholder. Rendered with aria-hidden because the surrounding
 * async container announces loading state via its own live region — a
 * screen reader does not benefit from hearing about grey boxes.
 */
const Skeleton = ({
    width = "100%",
    height = "1rem",
    className = "",
    style,
}) => (
    <span
        className={`skeleton ${className}`}
        style={{ width, height, ...style }}
        aria-hidden="true"
    />
);

/** Skeleton shaped like a product card, for grid loading states. */
export const SkeletonCard = () => (
    <div className="skeleton-card" aria-hidden="true">
        <span className="skeleton skeleton-card-image" />
        <span className="skeleton" style={{ width: "30%", height: "0.7rem" }} />
        <span className="skeleton" style={{ width: "85%", height: "0.9rem" }} />
        <span className="skeleton" style={{ width: "45%", height: "0.9rem" }} />
    </div>
);

/** A grid of card skeletons matching the product grid layout. */
export const SkeletonGrid = ({ count = 8, className = "" }) => (
    <div className={`skeleton-grid ${className}`} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export default Skeleton;
