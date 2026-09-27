import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductDisplay.css";
import ProductGallery from "../ProductGallery/ProductGallery";
import StarRating from "../StarRating/StarRating";
import ColorSwatches from "../ColorSwatches/ColorSwatches";
import SizeSelector from "../SizeSelector/SizeSelector";
import QuantityStepper from "../QuantityStepper/QuantityStepper";
import AddToCartButton from "../AddToCartButton/AddToCartButton";
import WishlistButton from "../WishlistButton/WishlistButton";
import { categoryLabel, categoryPath } from "../../data/catalog";
import { FREE_SHIPPING_THRESHOLD } from "../../data/catalog";

/**
 * Product detail panel.
 *
 * Replaces the original, where the size row was five plain <div>s with no
 * state, the four thumbnails were the same image repeated, the description
 * was hardcoded lorem about an unrelated company, and Add to Cart gave no
 * feedback whatsoever.
 */
const ProductDisplay = ({ product }) => {
    const [size, setSize] = useState(null);
    const [colorKey, setColorKey] = useState(product.colors[0]?.key || null);
    const [quantity, setQuantity] = useState(1);
    const [sizeError, setSizeError] = useState("");
    const sizeRef = useRef(null);

    // Reset selections when navigating straight from one product to another.
    useEffect(() => {
        setSize(null);
        setColorKey(product.colors[0]?.key || null);
        setQuantity(1);
        setSizeError("");
    }, [product.id, product.colors]);

    const selectedSize = product.sizes.find((s) => s.label === size);
    const maxQuantity = Math.min(10, selectedSize?.stock || product.stock);

    // Clamp quantity down if the newly chosen size has less stock.
    useEffect(() => {
        setQuantity((current) => Math.min(current, maxQuantity || 1));
    }, [maxQuantity]);

    const handleRequireSize = () => {
        setSizeError("Please choose a size before adding to your bag.");
        // Move focus to the size group so a keyboard user is taken straight
        // to the thing that needs fixing.
        sizeRef.current
            ?.querySelector('[role="radio"]:not([disabled])')
            ?.focus();
    };

    return (
        <div className="productdisplay">
            <div className="productdisplay-left">
                <ProductGallery product={product} />
            </div>

            <div className="productdisplay-right">
                <div className="productdisplay-heading">
                    <span className="sku-tag productdisplay-sku">
                        {product.sku} —{" "}
                        <Link to={categoryPath(product.category)}>
                            {categoryLabel(product.category)}
                        </Link>
                    </span>
                    <h1>{product.name}</h1>

                    <div className="productdisplay-rating">
                        <StarRating
                            rating={product.rating}
                            reviewCount={product.reviewCount}
                        />
                        <a className="productdisplay-review-link" href="#reviews">
                            Read reviews
                        </a>
                    </div>
                </div>

                <div className="productdisplay-right-prices">
                    <span className="productdisplay-right-price-new">
                        ${product.new_price}
                    </span>
                    {product.old_price != null && (
                        <>
                            <span className="productdisplay-right-price-old">
                                <span className="sr-only">Was</span> $
                                {product.old_price}
                            </span>
                            <span className="productdisplay-save">
                                Save {product.salePercent}%
                            </span>
                        </>
                    )}
                </div>

                <p className="productdisplay-right-description">
                    {product.description}
                </p>

                <ColorSwatches
                    colors={product.colors}
                    value={colorKey}
                    onChange={setColorKey}
                    id={`pdp-color-${product.id}`}
                />

                <div ref={sizeRef}>
                    <SizeSelector
                        id={`pdp-size-${product.id}`}
                        sizes={product.sizes}
                        value={size}
                        onChange={(next) => {
                            setSize(next);
                            setSizeError("");
                        }}
                        error={sizeError}
                        category={product.category}
                    />
                </div>

                <div className="productdisplay-qty">
                    <span className="productdisplay-qty-label">Quantity</span>
                    <QuantityStepper
                        value={quantity}
                        max={maxQuantity}
                        onChange={setQuantity}
                        label="Quantity"
                    />
                </div>

                <div className="productdisplay-actions">
                    <AddToCartButton
                        product={product}
                        size={size}
                        colorKey={colorKey}
                        quantity={quantity}
                        onRequireSize={handleRequireSize}
                        className="productdisplay-atc"
                    />
                    <WishlistButton product={product} variant="inline" />
                </div>

                <ul className="productdisplay-assurances">
                    <li>
                        Free standard delivery over ${FREE_SHIPPING_THRESHOLD}
                    </li>
                    <li>Free returns within 30 days</li>
                    <li>{product.details.origin}</li>
                </ul>

                <dl className="productdisplay-spec">
                    <div>
                        <dt>Fabric</dt>
                        <dd>{product.details.fabric}</dd>
                    </div>
                    <div>
                        <dt>Fit</dt>
                        <dd>{product.details.fit}</dd>
                    </div>
                    <div>
                        <dt>Tags</dt>
                        <dd className="productdisplay-tags">
                            {product.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    to={`/search?q=${encodeURIComponent(tag)}`}
                                >
                                    {tag}
                                </Link>
                            ))}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};

export default ProductDisplay;
