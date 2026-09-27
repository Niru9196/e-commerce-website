import React from "react";
import "./QuantityStepper.css";

/**
 * Accessible quantity control. Replaces the previous decorative
 * `<button>{count}</button>` in the cart, which displayed a number but had
 * no handler at all.
 *
 * The value is rendered as text with `aria-live="polite"` rather than as a
 * number input: the two buttons are the interaction, and a live region
 * means a screen-reader user hears the new quantity after pressing them.
 */
const QuantityStepper = ({
    value,
    onChange,
    min = 1,
    max = 10,
    label = "Quantity",
    allowRemoveAtMin = false,
    size = "md",
}) => {
    const canDecrease = allowRemoveAtMin ? value >= min : value > min;
    const canIncrease = value < max;

    return (
        <div
            className={`qty-stepper qty-stepper-${size}`}
            role="group"
            aria-label={label}
        >
            <button
                type="button"
                className="qty-btn"
                onClick={() => onChange(value - 1)}
                disabled={!canDecrease}
                aria-label={
                    allowRemoveAtMin && value === min
                        ? `Remove — ${label}`
                        : `Decrease ${label}`
                }
            >
                <span aria-hidden="true">&minus;</span>
            </button>

            <span className="qty-value" aria-live="polite">
                {value}
            </span>

            <button
                type="button"
                className="qty-btn"
                onClick={() => onChange(value + 1)}
                disabled={!canIncrease}
                aria-label={`Increase ${label}`}
                title={
                    !canIncrease ? `Only ${max} available` : undefined
                }
            >
                <span aria-hidden="true">+</span>
            </button>
        </div>
    );
};

export default QuantityStepper;
