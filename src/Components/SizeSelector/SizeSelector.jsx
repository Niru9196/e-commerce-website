import React from "react";
import { Link } from "react-router-dom";
import "./SizeSelector.css";

/**
 * Size picker implemented as a real radio group rather than a row of
 * clickable divs — so arrow keys move between options, the current choice
 * is announced, and out-of-stock sizes are genuinely unselectable rather
 * than just greyed out.
 */
const SizeSelector = ({
    sizes = [],
    value,
    onChange,
    error,
    name = "size",
    category,
    showGuideLink = true,
    id = "size-selector",
}) => {
    const errorId = `${id}-error`;

    return (
        <div className="size-selector">
            <div className="size-selector-head">
                <span className="size-selector-label" id={`${id}-label`}>
                    Select size
                </span>
                {showGuideLink && (
                    <Link
                        className="size-selector-guide"
                        to={
                            category
                                ? `/size-guide?category=${category}`
                                : "/size-guide"
                        }
                    >
                        Size guide
                    </Link>
                )}
            </div>

            <div
                className="size-selector-options"
                role="radiogroup"
                aria-labelledby={`${id}-label`}
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? errorId : undefined}
            >
                {sizes.map((size) => {
                    const selected = value === size.label;
                    const disabled = !size.inStock;

                    return (
                        <button
                            key={size.label}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            // Only the selected option (or the first, when
                            // nothing is selected) is in the tab order;
                            // arrow keys move within the group.
                            tabIndex={
                                selected ||
                                (!value && size === sizes.find((s) => s.inStock))
                                    ? 0
                                    : -1
                            }
                            disabled={disabled}
                            className={`size-option ${
                                selected ? "is-selected" : ""
                            } ${disabled ? "is-unavailable" : ""}`}
                            onClick={() => !disabled && onChange(size.label)}
                            onKeyDown={(event) => {
                                if (
                                    ![
                                        "ArrowRight",
                                        "ArrowLeft",
                                        "ArrowUp",
                                        "ArrowDown",
                                    ].includes(event.key)
                                ) {
                                    return;
                                }
                                event.preventDefault();

                                const available = sizes.filter((s) => s.inStock);
                                if (available.length === 0) return;

                                const currentIndex = available.findIndex(
                                    (s) => s.label === (value || size.label)
                                );
                                const delta =
                                    event.key === "ArrowRight" ||
                                    event.key === "ArrowDown"
                                        ? 1
                                        : -1;
                                const next =
                                    available[
                                        (currentIndex + delta + available.length) %
                                            available.length
                                    ];
                                onChange(next.label);
                            }}
                            aria-label={
                                disabled
                                    ? `Size ${size.label} — out of stock`
                                    : `Size ${size.label}`
                            }
                            title={
                                disabled
                                    ? "Out of stock"
                                    : size.stock <= 3
                                    ? `Only ${size.stock} left`
                                    : undefined
                            }
                        >
                            {size.label}
                        </button>
                    );
                })}
            </div>

            {error && (
                <p className="size-selector-error" id={errorId} role="alert">
                    {error}
                </p>
            )}

            {value &&
                sizes.find((s) => s.label === value)?.stock <= 3 && (
                    <p className="size-selector-stock">
                        Only {sizes.find((s) => s.label === value).stock} left in{" "}
                        {value}
                    </p>
                )}
        </div>
    );
};

export default SizeSelector;
