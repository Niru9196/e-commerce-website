import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useShop } from "../../Context/ShopContext";
import { useToast } from "../../Context/ToastContext";
import "./WishlistButton.css";

/**
 * Wishlist toggle.
 *
 * A real <button> with `aria-pressed`, so the state is exposed rather than
 * conveyed only by the fill colour of an icon.
 */
const WishlistButton = ({ product, variant = "overlay", className = "" }) => {
    const { isWishlisted, toggleWishlist } = useShop();
    const toast = useToast();
    const prefersReduced = useReducedMotion();

    if (!product) return null;
    const active = isWishlisted(product.id);

    const handleClick = (event) => {
        // Cards wrap their content in a link; without this the toggle would
        // also navigate to the product page.
        event.preventDefault();
        event.stopPropagation();

        toggleWishlist(product.id);
        toast.push({
            title: active ? "Removed from wishlist" : "Saved to wishlist",
            message: product.name,
            action: active ? undefined : { to: "/wishlist", label: "View" },
            duration: 3000,
        });
    };

    return (
        <button
            type="button"
            className={`wishlist-btn wishlist-btn-${variant} ${
                active ? "is-active" : ""
            } ${className}`}
            onClick={handleClick}
            aria-pressed={active}
            aria-label={
                active
                    ? `Remove ${product.name} from wishlist`
                    : `Save ${product.name} to wishlist`
            }
            title={active ? "Remove from wishlist" : "Save to wishlist"}
        >
            <motion.svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
                animate={
                    prefersReduced
                        ? undefined
                        : { scale: active ? [1, 1.25, 1] : 1 }
                }
                transition={{ duration: 0.3 }}
            >
                <path
                    d="M12 20.5 4.2 13a5 5 0 0 1 7.07-7.07l.73.73.73-.73A5 5 0 0 1 19.8 13Z"
                    fill={active ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
            </motion.svg>
            {variant === "inline" && (
                <span>{active ? "Saved" : "Save for later"}</span>
            )}
        </button>
    );
};

export default WishlistButton;
