import React from "react";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import "./StarRating.css";

/**
 * Star rating. The visual stars are decorative (`aria-hidden`); the rating
 * is conveyed to assistive technology by a single text label, which is far
 * less noisy than five images each announcing themselves.
 */
const StarRating = ({
    rating = 0,
    reviewCount,
    showCount = true,
    size = "md",
    className = "",
}) => {
    const rounded = Math.round(rating);

    return (
        <div className={`star-rating star-rating-${size} ${className}`}>
            <span aria-hidden="true" className="star-rating-icons">
                {[1, 2, 3, 4, 5].map((step) => (
                    <img
                        key={step}
                        src={step <= rounded ? star_icon : star_dull_icon}
                        alt=""
                    />
                ))}
            </span>
            <span className="sr-only">
                Rated {rating} out of 5
                {typeof reviewCount === "number"
                    ? ` from ${reviewCount} reviews`
                    : ""}
            </span>
            {showCount && (
                <span className="star-rating-count" aria-hidden="true">
                    {rating.toFixed(1)}
                    {typeof reviewCount === "number" && ` (${reviewCount})`}
                </span>
            )}
        </div>
    );
};

export default StarRating;
