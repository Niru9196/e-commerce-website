import React from "react";
import { Link } from "react-router-dom";
import QuantityStepper from "../QuantityStepper/QuantityStepper";
import remove_icon from "../Assets/cart_cross_icon.png";
import "./CartLine.css";

export const money = (value) => `$${value.toFixed(2)}`;

/**
 * A single cart line. Shared by the cart page and the slide-out drawer so
 * quantity, variant display and removal behave identically in both.
 */
const CartLine = ({ line, onQuantityChange, onRemove, compact = false }) => {
    const variant = [line.size, line.color?.name].filter(Boolean).join(" / ");

    return (
        <div className={`cart-line ${compact ? "cart-line-compact" : ""}`}>
            <Link to={`/product/${line.product.id}`} className="cart-line-media">
                <img
                    src={line.product.image}
                    alt={line.product.name}
                    loading="lazy"
                />
            </Link>

            <div className="cart-line-body">
                <Link
                    to={`/product/${line.product.id}`}
                    className="cart-line-name"
                >
                    {line.product.name}
                </Link>
                {variant && <span className="sku-tag">{variant}</span>}
                <span className="cart-line-unit">
                    {money(line.product.new_price)} each
                </span>

                <div className="cart-line-controls">
                    <QuantityStepper
                        value={line.quantity}
                        max={line.maxQuantity}
                        onChange={onQuantityChange}
                        label={`Quantity for ${line.product.name}${
                            variant ? `, ${variant}` : ""
                        }`}
                        size={compact ? "sm" : "md"}
                    />

                    <button
                        type="button"
                        className="cart-line-remove"
                        onClick={onRemove}
                        aria-label={`Remove ${line.product.name}${
                            variant ? `, ${variant}` : ""
                        } from your bag`}
                    >
                        <img src={remove_icon} alt="" aria-hidden="true" />
                        <span>Remove</span>
                    </button>
                </div>
            </div>

            <div className="cart-line-total">
                <span className="sr-only">Line total</span>
                {money(line.lineTotal)}
            </div>
        </div>
    );
};

export default CartLine;
