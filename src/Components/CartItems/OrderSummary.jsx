import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../../Context/ShopContext";
import { useAuth } from "../../Context/AuthContext";
import Modal from "../Modal/Modal";
import { money } from "./CartLine";
import { FREE_SHIPPING_THRESHOLD } from "../../data/catalog";
import "./OrderSummary.css";

/**
 * Order summary and checkout entry point.
 *
 * Checkout itself is deliberately out of scope for this build, but the
 * button is not a dead end: unauthenticated shoppers are sent to sign in
 * (and returned here afterwards), and signed-in shoppers get an explicit,
 * honestly-labelled notice rather than a button that appears broken.
 */
const OrderSummary = () => {
    const { totals } = useShop();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [noticeOpen, setNoticeOpen] = useState(false);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate("/login?redirect=/cart");
            return;
        }
        setNoticeOpen(true);
    };

    return (
        <div className="order-summary">
            <h2 className="order-summary-title">Order summary</h2>

            <dl className="order-summary-rows">
                <div>
                    <dt>Subtotal</dt>
                    <dd>{money(totals.subtotal)}</dd>
                </div>

                {totals.savings > 0 && (
                    <div className="order-summary-saving">
                        <dt>Reductions</dt>
                        <dd>&minus;{money(totals.savings)}</dd>
                    </div>
                )}

                {totals.discount > 0 && (
                    <div className="order-summary-saving">
                        <dt>Promo {totals.promo?.code}</dt>
                        <dd>&minus;{money(totals.discount)}</dd>
                    </div>
                )}

                <div>
                    <dt>Shipping</dt>
                    <dd>
                        {totals.shipping === 0 ? "Free" : money(totals.shipping)}
                    </dd>
                </div>
            </dl>

            {totals.freeShippingRemaining > 0 && (
                <p className="order-summary-nudge">
                    Spend {money(totals.freeShippingRemaining)} more for free
                    standard delivery.
                </p>
            )}

            <div className="order-summary-total">
                <span>Total</span>
                <span>{money(totals.total)}</span>
            </div>

            <button
                type="button"
                className="btn btn-primary order-summary-checkout"
                onClick={handleCheckout}
            >
                {isAuthenticated ? "Proceed to checkout" : "Sign in to checkout"}
            </button>

            <p className="order-summary-note">
                Free returns within 30 days. Free delivery over $
                {FREE_SHIPPING_THRESHOLD}.
            </p>

            <Modal
                open={noticeOpen}
                onClose={() => setNoticeOpen(false)}
                labelledBy="checkout-notice-title"
                size="sm"
            >
                <div className="checkout-notice">
                    <span className="cat-index">DEMO / SCOPE</span>
                    <h2 id="checkout-notice-title">Checkout isn't part of this build</h2>
                    <p>
                        This is a portfolio project, so there's no payment
                        processing behind it. Everything up to this point — the
                        catalogue, filters, variants, your bag and promo codes —
                        is fully functional and persists across reloads.
                    </p>

                    <dl className="checkout-notice-summary">
                        <div>
                            <dt>Items</dt>
                            <dd>{totals.totalItems}</dd>
                        </div>
                        <div>
                            <dt>Total</dt>
                            <dd>{money(totals.total)}</dd>
                        </div>
                    </dl>

                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setNoticeOpen(false)}
                    >
                        Back to my bag
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default OrderSummary;
