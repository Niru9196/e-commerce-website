import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./CSS/Wishlist.css";
import { useShop } from "../Context/ShopContext";
import { useToast } from "../Context/ToastContext";
import PageHeader from "../Components/PageHeader/PageHeader";
import Item from "../Components/Item/Item";
import QuickView from "../Components/QuickView/QuickView";
import { EmptyState } from "../Components/States/States";
import { CATEGORIES } from "../data/catalog";

const Wishlist = () => {
    const { wishlistProducts, removeFromWishlist, clearWishlist } = useShop();
    const toast = useToast();
    const prefersReduced = useReducedMotion();
    const [moveTarget, setMoveTarget] = useState(null);

    if (wishlistProducts.length === 0) {
        return (
            <>
                <PageHeader
                    index="12"
                    eyebrow="WISHLIST"
                    title="YOUR WISHLIST"
                    lede="Pieces you save are kept here and persist across reloads."
                />
                <div className="wishlist wishlist-empty">
                    <EmptyState
                        eyebrow="NOTHING SAVED"
                        title="Your wishlist is empty"
                        message="Tap the heart on any piece to save it for later."
                    >
                        <div className="state-suggestions">
                            {CATEGORIES.map((category) => (
                                <Link
                                    key={category.key}
                                    className="state-suggestion"
                                    to={category.path}
                                >
                                    {category.label}
                                </Link>
                            ))}
                            <Link className="state-suggestion" to="/new-arrivals">
                                New arrivals
                            </Link>
                        </div>
                    </EmptyState>
                </div>
            </>
        );
    }

    return (
        <>
            <PageHeader
                index="12"
                eyebrow="WISHLIST"
                title="YOUR WISHLIST"
                meta={`${wishlistProducts.length} ${
                    wishlistProducts.length === 1 ? "PIECE" : "PIECES"
                } SAVED`}
                lede="Pieces you save are kept here and persist across reloads."
            />

            <div className="wishlist">
                <div className="wishlist-toolbar">
                    <Link className="btn btn-outline btn-sm" to="/new-arrivals">
                        Add more pieces
                    </Link>
                    <button
                        type="button"
                        className="wishlist-clear"
                        onClick={() => {
                            clearWishlist();
                            toast.push({
                                title: "Wishlist cleared",
                                message: "All saved pieces removed.",
                            });
                        }}
                    >
                        Clear wishlist
                    </button>
                </div>

                <motion.ul className="wishlist-grid" layout={!prefersReduced}>
                    <AnimatePresence initial={false}>
                        {wishlistProducts.map((product) => (
                            <motion.li
                                key={product.id}
                                layout={!prefersReduced}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={
                                    prefersReduced
                                        ? { opacity: 0 }
                                        : { opacity: 0, scale: 0.96 }
                                }
                                transition={{ duration: 0.22 }}
                            >
                                <Item product={product} showQuickView={false} />

                                <div className="wishlist-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setMoveTarget(product)}
                                    >
                                        Move to bag
                                    </button>
                                    <button
                                        type="button"
                                        className="wishlist-remove"
                                        onClick={() => {
                                            removeFromWishlist(product.id);
                                            toast.push({
                                                title: "Removed from wishlist",
                                                message: product.name,
                                                duration: 3000,
                                            });
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </motion.ul>
            </div>

            {/* Moving to the bag needs a size, so it reuses quick view rather
                than guessing one. */}
            <QuickView
                product={moveTarget}
                open={Boolean(moveTarget)}
                onClose={() => setMoveTarget(null)}
            />
        </>
    );
};

export default Wishlist;
