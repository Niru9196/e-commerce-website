import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useShop } from "../../Context/ShopContext";
import { useToast } from "../../Context/ToastContext";
import { useCartDrawer } from "../../Context/CartDrawerContext";
import "./AddToCartButton.css";

/**
 * Add-to-cart action with an explicit state machine:
 * idle -> pending -> success -> idle.
 *
 * The pending phase is short and artificial, but it is the same shape the
 * component would need against a real endpoint, and it stops the button
 * feeling inert on click. Validation failures surface as an inline message
 * rather than silently doing nothing, which is what the original did.
 */
const AddToCartButton = ({
    product,
    size,
    colorKey,
    quantity = 1,
    requireSize = true,
    onRequireSize,
    onAdded,
    label = "Add to bag",
    className = "",
    openDrawerOnAdd = true,
}) => {
    const { addToCart } = useShop();
    const toast = useToast();
    const { open: openDrawer } = useCartDrawer();
    const prefersReduced = useReducedMotion();
    const [state, setState] = useState("idle");
    const timerRef = useRef(null);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const outOfStock = product && !product.inStock;

    const handleClick = async () => {
        if (state !== "idle" || outOfStock) return;

        if (requireSize && !size) {
            // Hand control back to the caller so it can render the error
            // next to the size options and move focus there.
            onRequireSize?.();
            return;
        }

        setState("pending");
        // Give the pending state a visible beat before confirming.
        await new Promise((resolve) => {
            timerRef.current = setTimeout(resolve, 380);
        });

        addToCart({
            productId: product.id,
            size: size || null,
            colorKey: colorKey || product.colors[0]?.key || null,
            quantity,
        });

        setState("success");
        toast.success({
            title: "Added to bag",
            message: `${product.name}${size ? ` — size ${size}` : ""}`,
            action: { to: "/cart", label: "View bag" },
        });
        onAdded?.();
        if (openDrawerOnAdd) openDrawer();

        timerRef.current = setTimeout(() => setState("idle"), 1500);
    };

    const content = {
        idle: label,
        pending: "Adding…",
        success: "Added",
    }[state];

    return (
        <button
            type="button"
            className={`atc-btn btn btn-primary ${
                state === "success" ? "is-success" : ""
            } ${className}`}
            onClick={handleClick}
            disabled={outOfStock}
            aria-disabled={outOfStock || state !== "idle"}
            aria-live="polite"
        >
            {state === "pending" && (
                <span className="atc-spinner" aria-hidden="true" />
            )}
            {state === "success" && (
                <svg
                    className="atc-check"
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    aria-hidden="true"
                >
                    <path
                        d="M4 12.5l5 5L20 6.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={state}
                    initial={
                        prefersReduced ? { opacity: 0 } : { opacity: 0, y: 6 }
                    }
                    animate={
                        prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }
                    }
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                >
                    {outOfStock ? "Sold out" : content}
                </motion.span>
            </AnimatePresence>
        </button>
    );
};

export default AddToCartButton;
