import React from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useShop } from "../../Context/ShopContext";
import { useCartDrawer } from "../../Context/CartDrawerContext";
import useFocusTrap from "../../hooks/useFocusTrap";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { backdropVariants, drawerVariants, fadeOnly } from "../../motion/variants";
import CartLine, { money } from "../CartItems/CartLine";
import "./CartDrawer.css";

/**
 * Slide-out bag. Opens automatically after an add-to-cart so the shopper
 * gets confirmation and a route to checkout without losing their place in
 * the listing.
 */
const CartDrawer = () => {
    const { isOpen, close } = useCartDrawer();
    const { cartLines, totals, updateQuantity, removeLine } = useShop();
    const prefersReduced = useReducedMotion();

    const panelRef = useFocusTrap(isOpen, close);
    useBodyScrollLock(isOpen);

    const panelVariants = prefersReduced ? fadeOnly : drawerVariants;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="drawer-root">
                    <motion.div
                        className="drawer-backdrop"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={close}
                    />

                    <motion.aside
                        ref={panelRef}
                        className="drawer-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="drawer-title"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <header className="drawer-head">
                            <div>
                                <span className="cat-index">YOUR BAG</span>
                                <h2 id="drawer-title">
                                    {totals.totalItems}{" "}
                                    {totals.totalItems === 1 ? "item" : "items"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="drawer-close"
                                onClick={close}
                                aria-label="Close bag"
                                data-autofocus
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </header>

                        <div className="drawer-body">
                            {cartLines.length === 0 ? (
                                <div className="drawer-empty">
                                    <p>Your bag is empty.</p>
                                    <Link
                                        className="btn btn-outline btn-sm"
                                        to="/"
                                        onClick={close}
                                    >
                                        Browse the catalogue
                                    </Link>
                                </div>
                            ) : (
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
                                                          x: 24,
                                                          height: 0,
                                                      }
                                            }
                                            transition={{ duration: 0.22 }}
                                            style={{ overflow: "hidden" }}
                                        >
                                            <CartLine
                                                line={line}
                                                compact
                                                onQuantityChange={(next) =>
                                                    updateQuantity(line.key, next)
                                                }
                                                onRemove={() =>
                                                    removeLine(line.key)
                                                }
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {cartLines.length > 0 && (
                            <footer className="drawer-foot">
                                {totals.freeShippingRemaining > 0 && (
                                    <p className="drawer-nudge">
                                        {money(totals.freeShippingRemaining)} more
                                        for free delivery
                                    </p>
                                )}
                                <div className="drawer-total">
                                    <span>Subtotal</span>
                                    <span>{money(totals.subtotal)}</span>
                                </div>
                                <Link
                                    className="btn btn-primary drawer-cta"
                                    to="/cart"
                                    onClick={close}
                                >
                                    View bag & checkout
                                </Link>
                                <button
                                    type="button"
                                    className="drawer-continue"
                                    onClick={close}
                                >
                                    Keep shopping
                                </button>
                            </footer>
                        )}
                    </motion.aside>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default CartDrawer;
