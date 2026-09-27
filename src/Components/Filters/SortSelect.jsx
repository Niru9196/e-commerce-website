import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dropdown_icon from "../Assets/dropdown_icon.png";
import "./SortSelect.css";

/**
 * Sort control. Replaces the previous "Sort by" label with a decorative
 * chevron that did nothing at all.
 *
 * Built as a listbox rather than a native <select> so it can carry the
 * catalogue styling, but it implements the listbox keyboard contract:
 * Enter/Space/ArrowDown open it, arrows move, Enter commits, Escape closes
 * and returns focus to the trigger.
 */
const SortSelect = ({ options, value, onChange, id = "sort" }) => {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const prefersReduced = useReducedMotion();

    const selectedIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value)
    );
    const selected = options[selectedIndex];

    useEffect(() => {
        if (open) setActiveIndex(selectedIndex);
    }, [open, selectedIndex]);

    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    const commit = (index) => {
        onChange(options[index].value);
        setOpen(false);
        triggerRef.current?.focus();
    };

    const handleKeyDown = (event) => {
        if (!open) {
            if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
                event.preventDefault();
                setOpen(true);
            }
            return;
        }

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setActiveIndex((i) => (i + 1) % options.length);
                break;
            case "ArrowUp":
                event.preventDefault();
                setActiveIndex((i) => (i - 1 + options.length) % options.length);
                break;
            case "Home":
                event.preventDefault();
                setActiveIndex(0);
                break;
            case "End":
                event.preventDefault();
                setActiveIndex(options.length - 1);
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                commit(activeIndex);
                break;
            case "Escape":
                event.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
                break;
            case "Tab":
                setOpen(false);
                break;
            default:
                break;
        }
    };

    return (
        <div className="sort-select" ref={rootRef}>
            <span className="sort-select-label" id={`${id}-label`}>
                Sort by
            </span>
            <button
                ref={triggerRef}
                type="button"
                className="sort-select-trigger"
                onClick={() => setOpen((o) => !o)}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-labelledby={`${id}-label`}
            >
                <span>{selected?.label}</span>
                <img
                    src={dropdown_icon}
                    alt=""
                    aria-hidden="true"
                    className={open ? "is-open" : ""}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        className="sort-select-list"
                        role="listbox"
                        aria-labelledby={`${id}-label`}
                        aria-activedescendant={`${id}-option-${activeIndex}`}
                        tabIndex={-1}
                        initial={
                            prefersReduced
                                ? { opacity: 0 }
                                : { opacity: 0, y: -6 }
                        }
                        animate={
                            prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }
                        }
                        exit={
                            prefersReduced
                                ? { opacity: 0 }
                                : { opacity: 0, y: -6 }
                        }
                        transition={{ duration: 0.16 }}
                        onKeyDown={handleKeyDown}
                    >
                        {options.map((option, index) => (
                            <li
                                key={option.value}
                                id={`${id}-option-${index}`}
                                role="option"
                                aria-selected={option.value === value}
                                className={`sort-select-option ${
                                    index === activeIndex ? "is-active" : ""
                                } ${option.value === value ? "is-selected" : ""}`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => commit(index)}
                            >
                                {option.label}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SortSelect;
