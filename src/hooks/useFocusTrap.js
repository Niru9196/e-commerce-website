import { useEffect, useRef } from "react";

const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type=hidden])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Traps Tab focus inside a container while it is active, and restores
 * focus to whatever was focused before it opened.
 *
 * Without this, tabbing out of an open dialog lands on the page behind it,
 * which for a keyboard or screen-reader user makes the overlay effectively
 * impossible to use.
 *
 * @param {boolean}  active
 * @param {Function} onClose  called on Escape
 * @returns {Object} ref to attach to the container element
 */
const useFocusTrap = (active, onClose) => {
    const containerRef = useRef(null);
    const previouslyFocused = useRef(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!active) return undefined;

        previouslyFocused.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        const container = containerRef.current;
        if (!container) return undefined;

        // Move focus inside on open, preferring an explicitly marked target.
        const initial =
            container.querySelector("[data-autofocus]") ||
            container.querySelector(FOCUSABLE) ||
            container;
        // rAF so the element exists after the open animation's first frame.
        const raf = requestAnimationFrame(() => initial.focus?.());

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                onCloseRef.current?.();
                return;
            }
            if (event.key !== "Tab") return;

            const focusable = Array.from(
                container.querySelectorAll(FOCUSABLE)
            ).filter(
                (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === initial
            );
            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener("keydown", handleKeyDown, true);
            previouslyFocused.current?.focus?.();
        };
    }, [active]);

    return containerRef;
};

export default useFocusTrap;
