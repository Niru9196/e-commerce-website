import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import WishlistButton from "../WishlistButton/WishlistButton";
import QuickView from "../QuickView/QuickView";
import "./Item.css";

/**
 * Product card.
 *
 * Structural decisions worth noting:
 *  - The card body (name, price) is ONE link and the image is a second,
 *    non-tabbable link to the same place. So the card is a single tab stop
 *    but the whole thing is still clickable. Previously only the image was
 *    clickable at all.
 *  - The wishlist and quick-view controls are real <button>s rendered as
 *    siblings of the link, never nested inside it — a button inside an
 *    anchor is invalid HTML and behaves unpredictably with the keyboard.
 *    They come after the link in the DOM so tab order reads
 *    card -> wishlist -> quick view.
 *  - The old `onClick={window.scrollTo(0, 0)}` called scrollTo during
 *    render on every pass; scroll reset now lives in <ScrollToTop />.
 *
 * A `layoutId` shared-element morph between this image and the product
 * page hero was tried and removed: page transitions use AnimatePresence
 * `mode="wait"`, so the card unmounts before the product page mounts and
 * the morph animates from a stale measurement, which reads as the image
 * flying in from the wrong place. The product page crossfades its gallery
 * instead.
 */
const Item = ({ product, showQuickView = true, priority = false }) => {
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const prefersReduced = useReducedMotion();

    if (!product) return null;

    const hasBadge = product.isNew || product.onSale;

    return (
        <>
            <motion.article
                className="item"
                whileHover={prefersReduced ? undefined : { y: -4 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="item-media">
                    {/* Duplicate of the main link purely so the photograph is
                        clickable. Hidden from assistive tech and removed from
                        the tab order to avoid announcing the same
                        destination twice. */}
                    <Link
                        to={`/product/${product.id}`}
                        className="item-media-link"
                        tabIndex={-1}
                        aria-hidden="true"
                    >
                        <span className="item-image-frame plate plate-duotone">
                            <img
                                src={product.image}
                                alt=""
                                loading={priority ? "eager" : "lazy"}
                                decoding="async"
                            />
                        </span>
                    </Link>

                    {hasBadge && (
                        <span
                            className={`item-badge ${
                                product.onSale
                                    ? "item-badge-sale"
                                    : "item-badge-new"
                            }`}
                        >
                            {product.onSale
                                ? `${product.salePercent}% off`
                                : "New in"}
                        </span>
                    )}

                    {!product.inStock && (
                        <span className="item-soldout">Sold out</span>
                    )}
                </div>

                <Link to={`/product/${product.id}`} className="item-link">
                    <span className="sku-tag">{product.sku}</span>
                    <h3 className="item-name">{product.name}</h3>
                    <span className="item-prices">
                        <span className="item-price-new">
                            ${product.new_price}
                        </span>
                        {product.old_price != null && (
                            <span className="item-price-old">
                                <span className="sr-only">
                                    Was
                                </span>{" "}
                                ${product.old_price}
                            </span>
                        )}
                    </span>
                </Link>

                {/* Colours are informational here — the real picker lives in
                    quick view and on the product page. */}
                <ul className="item-colors" aria-label="Available colours">
                    {product.colors.map((color) => (
                        <li
                            key={color.key}
                            className="item-color-dot"
                            style={{ background: color.hex }}
                        >
                            <span className="sr-only">{color.name}</span>
                        </li>
                    ))}
                </ul>

                <div className="item-overlay-actions">
                    <WishlistButton product={product} variant="overlay" />
                    {showQuickView && (
                        <button
                            type="button"
                            className="item-quickview-btn"
                            onClick={() => setQuickViewOpen(true)}
                            aria-label={`Quick view: ${product.name}`}
                            title="Quick view"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="17"
                                height="17"
                                aria-hidden="true"
                            >
                                <path
                                    d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                />
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="2.6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </motion.article>

            {showQuickView && (
                <QuickView
                    product={product}
                    open={quickViewOpen}
                    onClose={() => setQuickViewOpen(false)}
                />
            )}
        </>
    );
};

export default Item;
