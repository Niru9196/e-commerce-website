import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "../../Context/ShopContext";
import { findPromo } from "../../data/catalog";
import "./PromoForm.css";

/**
 * Promo code entry. Was a decorative input and a SUBMIT button with no
 * handler.
 *
 * Validation happens here and again in selectTotals, which re-checks the
 * minimum spend on every derive — so a code that stops qualifying (because
 * the user removed items) drops away instead of silently discounting.
 */
const PromoForm = () => {
    const { applyPromo, clearPromo, totals } = useShop();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    const applied = totals.promo;

    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmed = code.trim();

        if (!trimmed) {
            setError("Enter a promo code.");
            return;
        }

        const promo = findPromo(trimmed);
        if (!promo) {
            setError("That code isn't recognised.");
            return;
        }
        if (promo.minSubtotal && totals.subtotal < promo.minSubtotal) {
            setError(
                `${promo.code} needs a subtotal of at least $${promo.minSubtotal}. You're at $${totals.subtotal.toFixed(2)}.`
            );
            return;
        }

        setError("");
        setCode("");
        applyPromo(promo.code);
    };

    return (
        <div className="promo">
            <h2 className="promo-title">Promo code</h2>

            <AnimatePresence mode="wait" initial={false}>
                {applied ? (
                    <motion.div
                        key="applied"
                        className="promo-applied"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <span className="promo-chip">
                            {applied.code}
                            <span className="promo-chip-desc">
                                {applied.description}
                            </span>
                        </span>
                        <button
                            type="button"
                            className="promo-remove"
                            onClick={() => {
                                clearPromo();
                                setError("");
                            }}
                        >
                            Remove
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        key="form"
                        className="promo-form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        noValidate
                    >
                        <label className="sr-only" htmlFor="promo-code">
                            Promo code
                        </label>
                        <div className="promo-field">
                            <input
                                id="promo-code"
                                type="text"
                                placeholder="e.g. CATALOGUE10"
                                value={code}
                                onChange={(event) => {
                                    setCode(event.target.value.toUpperCase());
                                    if (error) setError("");
                                }}
                                aria-invalid={Boolean(error) || undefined}
                                aria-describedby={
                                    error ? "promo-error" : "promo-hint"
                                }
                                autoComplete="off"
                            />
                            <button type="submit" className="btn btn-primary btn-sm">
                                Apply
                            </button>
                        </div>

                        {error ? (
                            <p className="promo-error" id="promo-error" role="alert">
                                {error}
                            </p>
                        ) : (
                            <p className="promo-hint" id="promo-hint">
                                Try CATALOGUE10 for 10% off.
                            </p>
                        )}
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PromoForm;
