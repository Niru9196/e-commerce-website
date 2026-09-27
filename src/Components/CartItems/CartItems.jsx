import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./CartItems.css";
import { useShop } from "../../Context/ShopContext";
import { useToast } from "../../Context/ToastContext";
import { EmptyState } from "../States/States";
import Modal from "../Modal/Modal";
import CartLine from "./CartLine";
import PromoForm from "./PromoForm";
import OrderSummary from "./OrderSummary";

const CartItems = () => {
    const { cartLines, totals, updateQuantity, removeLine, clearCart } =
        useShop();
    const toast = useToast();
    const prefersReduced = useReducedMotion();
    const [confirmClear, setConfirmClear] = useState(false);

    if (cartLines.length === 0) {
        return (
            <div className="cartitems cartitems-empty">
                <EmptyState
                    eyebrow="YOUR BAG"
                    title="Your bag is empty"
                    message="Nothing here yet. Browse the catalogue and add a few pieces to get started."
                    linkTo="/"
                    linkLabel="Continue shopping"
                >
                    <div className="state-suggestions">
                        <Link className="state-suggestion" to="/new-arrivals">
                            New arrivals
                        </Link>
                        <Link className="state-suggestion" to="/sale">
                            Sale
                        </Link>
                        <Link className="state-suggestion" to="/wishlist">
                            Your wishlist
                        </Link>
                    </div>
                </EmptyState>
            </div>
        );
    }

    return (
        <div className="cartitems">
            <header className="cartitems-head">
                <div>
                    <span className="cat-index">08 / YOUR BAG</span>
                    <h1>Your bag</h1>
                </div>
                <span className="sku-tag">
                    {totals.totalItems}{" "}
                    {totals.totalItems === 1 ? "ITEM" : "ITEMS"}
                </span>
            </header>
            <hr className="rule" />

            <div className="cartitems-layout">
                <div className="cartitems-lines">
                    <AnimatePresence initial={false}>
                        {cartLines.map((line) => (
                            <motion.div
                                key={line.key}
                                layout={!prefersReduced}
                                exit={
                                    prefersReduced
                                        ? { opacity: 0 }
                                        : {
                                              opacity: 0,
                                              x: -24,
                                              height: 0,
                                              marginBottom: 0,
                                          }
                                }
                                transition={{ duration: 0.25 }}
                                style={{ overflow: "hidden" }}
                            >
                                <CartLine
                                    line={line}
                                    onQuantityChange={(next) =>
                                        updateQuantity(line.key, next)
                                    }
                                    onRemove={() => {
                                        removeLine(line.key);
                                        toast.push({
                                            title: "Removed from bag",
                                            message: line.product.name,
                                            duration: 3000,
                                        });
                                    }}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="cartitems-actions">
                        <Link className="btn btn-outline btn-sm" to="/">
                            Continue shopping
                        </Link>
                        <button
                            type="button"
                            className="cartitems-clear"
                            onClick={() => setConfirmClear(true)}
                        >
                            Empty bag
                        </button>
                    </div>
                </div>

                <aside className="cartitems-aside" aria-label="Order summary">
                    <OrderSummary />
                    <PromoForm />
                </aside>
            </div>

            <Modal
                open={confirmClear}
                onClose={() => setConfirmClear(false)}
                labelledBy="clear-cart-title"
                size="sm"
            >
                <div className="confirm-dialog">
                    <span className="cat-index">CONFIRM</span>
                    <h2 id="clear-cart-title">Empty your bag?</h2>
                    <p>
                        This removes all {totals.totalItems}{" "}
                        {totals.totalItems === 1 ? "item" : "items"}. It can't be
                        undone.
                    </p>
                    <div className="confirm-dialog-actions">
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                clearCart();
                                setConfirmClear(false);
                                toast.push({
                                    title: "Bag emptied",
                                    message: "All items removed.",
                                });
                            }}
                        >
                            Yes, empty it
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setConfirmClear(false)}
                            data-autofocus
                        >
                            Keep my items
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CartItems;
