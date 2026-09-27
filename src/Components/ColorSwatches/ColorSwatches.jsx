import React from "react";
import "./ColorSwatches.css";

/**
 * Colour picker. Each swatch carries the colour *name* in its accessible
 * label, because a hex fill alone is meaningless to a screen reader and to
 * anyone who can't distinguish the two closest tones.
 */
const ColorSwatches = ({
    colors = [],
    value,
    onChange,
    id = "color-swatches",
    showLabel = true,
    size = "md",
}) => {
    const selected = colors.find((color) => color.key === value);

    return (
        <div className={`color-swatches color-swatches-${size}`}>
            {showLabel && (
                <div className="color-swatches-head">
                    <span
                        className="color-swatches-label"
                        id={`${id}-label`}
                    >
                        Colour
                    </span>
                    <span className="color-swatches-value">
                        {selected?.name || "Select"}
                    </span>
                </div>
            )}

            <div
                className="color-swatches-options"
                role="radiogroup"
                aria-labelledby={showLabel ? `${id}-label` : undefined}
                aria-label={showLabel ? undefined : "Colour"}
            >
                {colors.map((color, index) => {
                    const isSelected = color.key === value;
                    return (
                        <button
                            key={color.key}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={
                                isSelected || (!value && index === 0) ? 0 : -1
                            }
                            className={`color-swatch ${
                                isSelected ? "is-selected" : ""
                            }`}
                            style={{ "--swatch": color.hex }}
                            onClick={() => onChange(color.key)}
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
                                const delta =
                                    event.key === "ArrowRight" ||
                                    event.key === "ArrowDown"
                                        ? 1
                                        : -1;
                                const current = colors.findIndex(
                                    (c) => c.key === (value || colors[0].key)
                                );
                                onChange(
                                    colors[
                                        (current + delta + colors.length) %
                                            colors.length
                                    ].key
                                );
                            }}
                            aria-label={`Colour: ${color.name}`}
                            title={color.name}
                        >
                            <span className="color-swatch-fill" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ColorSwatches;
