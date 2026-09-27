import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../Modal/Modal";
import StarRating from "../StarRating/StarRating";
import SizeSelector from "../SizeSelector/SizeSelector";
import ColorSwatches from "../ColorSwatches/ColorSwatches";
import QuantityStepper from "../QuantityStepper/QuantityStepper";
import AddToCartButton from "../AddToCartButton/AddToCartButton";
import WishlistButton from "../WishlistButton/WishlistButton";
import "./QuickView.css";

/**
 * Lets a shopper pick a size and add to bag without leaving the listing.
 * Selections reset whenever a different product is opened, so the modal
 * never carries a stale size over from the previous card.
 */
const QuickView = ({ product, open, onClose }) => {
    const [size, setSize] = useState(null);
    const [colorKey, setColorKey] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [sizeError, setSizeError] = useState("");

    useEffect(() => {
        if (!open || !product) return;
        setSize(null);
        setColorKey(product.colors[0]?.key || null);
        setQuantity(1);
        setSizeError("");
    }, [open, product]);

    if (!product) return null;

    const titleId = `quickview-title-${product.id}`;
    const selectedSize = product.sizes.find((s) => s.label === size);
    const maxQuantity = Math.min(10, selectedSize?.stock || product.stock);

    return (
        <Modal
            open={open}
            onClose={onClose}
            labelledBy={titleId}
            size="lg"
            className="quickview"
        >
            <div className="quickview-grid">
                <div className="quickview-media plate plate-duotone">
                    <img src={product.image} alt={product.name} />
                    {product.onSale && (
                        <span className="quickview-badge">
                            {product.salePercent}% off
                        </span>
                    )}
                </div>

                <div className="quickview-body">
                    <span className="sku-tag">
                        {product.sku} — {product.category}
                    </span>
                    <h2 id={titleId}>{product.name}</h2>

                    <StarRating
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                    />

                    <div className="quickview-prices">
                        <span className="quickview-price-new">
                            ${product.new_price}
                        </span>
                        {product.old_price != null && (
                            <span className="quickview-price-old">
                                ${product.old_price}
                            </span>
                        )}
                    </div>

                    <p className="quickview-description">
                        {product.description}
                    </p>

                    <ColorSwatches
                        colors={product.colors}
                        value={colorKey}
                        onChange={setColorKey}
                        id={`quickview-color-${product.id}`}
                    />

                    <SizeSelector
                        id={`quickview-size-${product.id}`}
                        sizes={product.sizes}
                        value={size}
                        onChange={(next) => {
                            setSize(next);
                            setSizeError("");
                        }}
                        error={sizeError}
                        category={product.category}
                    />

                    <div className="quickview-qty">
                        <span className="quickview-qty-label">Quantity</span>
                        <QuantityStepper
                            value={quantity}
                            max={maxQuantity}
                            onChange={setQuantity}
                            label="Quantity"
                        />
                    </div>

                    <div className="quickview-actions">
                        <AddToCartButton
                            product={product}
                            size={size}
                            colorKey={colorKey}
                            quantity={quantity}
                            onRequireSize={() =>
                                setSizeError("Please choose a size first.")
                            }
                            // Closing this dialog and opening the drawer at the
                            // same moment would stack two overlays and fight
                            // over focus. The toast confirms the add instead.
                            openDrawerOnAdd={false}
                            onAdded={onClose}
                            className="quickview-atc"
                        />
                        <WishlistButton product={product} variant="inline" />
                    </div>

                    <Link
                        className="quickview-full-link"
                        to={`/product/${product.id}`}
                        onClick={onClose}
                    >
                        View full details
                    </Link>
                </div>
            </div>
        </Modal>
    );
};

export default QuickView;
