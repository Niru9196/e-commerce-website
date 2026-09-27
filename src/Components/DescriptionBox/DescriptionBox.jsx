import React, { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./DescriptionBox.css";
import StarRating from "../StarRating/StarRating";

/**
 * Description / Details / Reviews tabs.
 *
 * Previously two <div>s where one had a `fade` class and neither switched
 * anything, with body copy about an unrelated e-commerce company. Now a
 * real tab widget: `role="tablist"`, arrow-key navigation, roving tabindex,
 * and content driven entirely by the product record.
 */
const DescriptionBox = ({ product }) => {
    const [active, setActive] = useState("description");
    const tabRefs = useRef({});
    const prefersReduced = useReducedMotion();

    if (!product) return null;

    const TABS = [
        { id: "description", label: "Description" },
        { id: "details", label: "Details & care" },
        { id: "reviews", label: `Reviews (${product.reviewCount})` },
    ];

    const move = (delta) => {
        const index = TABS.findIndex((tab) => tab.id === active);
        const next = TABS[(index + delta + TABS.length) % TABS.length];
        setActive(next.id);
        tabRefs.current[next.id]?.focus();
    };

    const handleKeyDown = (event) => {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
        } else if (event.key === "Home") {
            event.preventDefault();
            setActive(TABS[0].id);
            tabRefs.current[TABS[0].id]?.focus();
        } else if (event.key === "End") {
            event.preventDefault();
            const last = TABS[TABS.length - 1];
            setActive(last.id);
            tabRefs.current[last.id]?.focus();
        }
    };

    // Rating distribution, derived so the bars always agree with the reviews.
    const distribution = [5, 4, 3, 2, 1].map((star) => {
        const count = product.reviews.filter((r) => r.rating === star).length;
        return {
            star,
            count,
            percent: product.reviews.length
                ? Math.round((count / product.reviews.length) * 100)
                : 0,
        };
    });

    const panelMotion = {
        initial: prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 },
        animate: prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 },
        exit: { opacity: 0 },
        transition: { duration: 0.22 },
    };

    return (
        <section className="descriptionbox" id="reviews">
            <div
                className="descriptionbox-navigator"
                role="tablist"
                aria-label="Product information"
                onKeyDown={handleKeyDown}
            >
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        ref={(el) => {
                            tabRefs.current[tab.id] = el;
                        }}
                        type="button"
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={active === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        tabIndex={active === tab.id ? 0 : -1}
                        className={`descriptionbox-nav-box ${
                            active === tab.id ? "is-active" : ""
                        }`}
                        onClick={() => setActive(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
                {active === "description" && (
                    <motion.div
                        key="description"
                        id="panel-description"
                        role="tabpanel"
                        aria-labelledby="tab-description"
                        tabIndex={0}
                        className="descriptionbox-description"
                        {...panelMotion}
                    >
                        <p>{product.description}</p>
                        <p>
                            Cut in {product.details.fabric.toLowerCase()} with a{" "}
                            {product.details.fit.toLowerCase()} silhouette.{" "}
                            {product.details.origin}
                        </p>
                    </motion.div>
                )}

                {active === "details" && (
                    <motion.div
                        key="details"
                        id="panel-details"
                        role="tabpanel"
                        aria-labelledby="tab-details"
                        tabIndex={0}
                        className="descriptionbox-description"
                        {...panelMotion}
                    >
                        <dl className="descriptionbox-details">
                            <div>
                                <dt>Fabric</dt>
                                <dd>{product.details.fabric}</dd>
                            </div>
                            <div>
                                <dt>Fit</dt>
                                <dd>{product.details.fit}</dd>
                            </div>
                            <div>
                                <dt>Care</dt>
                                <dd>{product.details.care}</dd>
                            </div>
                            <div>
                                <dt>Origin</dt>
                                <dd>{product.details.origin}</dd>
                            </div>
                            <div>
                                <dt>Sizes</dt>
                                <dd>
                                    {product.sizes
                                        .map(
                                            (s) =>
                                                `${s.label}${
                                                    s.inStock ? "" : " (sold out)"
                                                }`
                                        )
                                        .join(", ")}
                                </dd>
                            </div>
                            <div>
                                <dt>Colours</dt>
                                <dd>
                                    {product.colors
                                        .map((c) => c.name)
                                        .join(", ")}
                                </dd>
                            </div>
                        </dl>
                    </motion.div>
                )}

                {active === "reviews" && (
                    <motion.div
                        key="reviews"
                        id="panel-reviews"
                        role="tabpanel"
                        aria-labelledby="tab-reviews"
                        tabIndex={0}
                        className="descriptionbox-description"
                        {...panelMotion}
                    >
                        <div className="reviews-summary">
                            <div className="reviews-score">
                                <span className="reviews-score-value">
                                    {product.rating.toFixed(1)}
                                </span>
                                <StarRating
                                    rating={product.rating}
                                    reviewCount={product.reviewCount}
                                    showCount={false}
                                />
                                <span className="sku-tag">
                                    {product.reviewCount} reviews
                                </span>
                            </div>

                            <ul className="reviews-bars">
                                {distribution.map((row) => (
                                    <li key={row.star}>
                                        <span className="reviews-bar-label">
                                            {row.star} star
                                        </span>
                                        <span
                                            className="reviews-bar-track"
                                            aria-hidden="true"
                                        >
                                            <span
                                                className="reviews-bar-fill"
                                                style={{
                                                    width: `${row.percent}%`,
                                                }}
                                            />
                                        </span>
                                        <span className="reviews-bar-count">
                                            {row.percent}%
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <ul className="reviews-list">
                            {product.reviews.map((review) => (
                                <li key={review.id} className="review">
                                    <div className="review-head">
                                        <StarRating
                                            rating={review.rating}
                                            showCount={false}
                                            size="sm"
                                        />
                                        <h3>{review.title}</h3>
                                    </div>
                                    <p className="review-body">{review.body}</p>
                                    <p className="review-meta">
                                        {review.author}
                                        {review.verified && " · Verified buyer"}
                                        {" · "}
                                        <time dateTime={review.date}>
                                            {new Date(
                                                review.date
                                            ).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </time>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default DescriptionBox;
