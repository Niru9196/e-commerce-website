import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { suggest } from "../../api/products";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import useFocusTrap from "../../hooks/useFocusTrap";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { readStored, writeStored } from "../../lib/storage";
import { CATEGORIES } from "../../data/catalog";
import "./SearchOverlay.css";

const RECENT_KEY = "shopper.searches.v1";
const RECENT_LIMIT = 5;

const readRecent = () =>
    readStored(RECENT_KEY, [], { version: 1, validate: Array.isArray }).filter(
        (term) => typeof term === "string"
    );

export const pushRecentSearch = (term) => {
    const clean = String(term || "").trim();
    if (!clean) return;
    const next = [clean, ...readRecent().filter((t) => t !== clean)].slice(
        0,
        RECENT_LIMIT
    );
    writeStored(RECENT_KEY, next, { version: 1 });
};

/**
 * Full-width search overlay with typeahead.
 *
 * Implements the combobox keyboard contract: ArrowDown/Up move an active
 * option, Enter opens it (or runs the full search when nothing is active),
 * Escape closes. The input keeps DOM focus throughout and the active option
 * is communicated via aria-activedescendant, which is what makes this
 * usable with a screen reader.
 */
const SearchOverlay = ({ open, onClose }) => {
    const navigate = useNavigate();
    const prefersReduced = useReducedMotion();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [recent, setRecent] = useState([]);

    const containerRef = useFocusTrap(open, onClose);
    useBodyScrollLock(open);
    const debouncedQuery = useDebouncedValue(query, 220);
    const requestRef = useRef(0);

    useEffect(() => {
        if (!open) return;
        setQuery("");
        setResults([]);
        setActiveIndex(-1);
        setRecent(readRecent());
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;

        const term = debouncedQuery.trim();
        if (term.length < 2) {
            setResults([]);
            setLoading(false);
            return undefined;
        }

        const runId = requestRef.current + 1;
        requestRef.current = runId;
        setLoading(true);

        suggest(term, 6)
            .then((items) => {
                // Ignore a response that a later keystroke has superseded.
                if (requestRef.current !== runId) return;
                setResults(items);
                setActiveIndex(-1);
            })
            .catch(() => {
                if (requestRef.current === runId) setResults([]);
            })
            .finally(() => {
                if (requestRef.current === runId) setLoading(false);
            });

        return undefined;
    }, [debouncedQuery, open]);

    const submitSearch = useCallback(
        (term) => {
            const clean = String(term || "").trim();
            if (!clean) return;
            pushRecentSearch(clean);
            onClose();
            navigate(`/search?q=${encodeURIComponent(clean)}`);
        },
        [navigate, onClose]
    );

    const openProduct = useCallback(
        (product) => {
            pushRecentSearch(query.trim());
            onClose();
            navigate(`/product/${product.id}`);
        },
        [navigate, onClose, query]
    );

    const handleKeyDown = (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((i) => (results.length ? (i + 1) % results.length : -1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((i) =>
                results.length ? (i - 1 + results.length) % results.length : -1
            );
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (activeIndex >= 0 && results[activeIndex]) {
                openProduct(results[activeIndex]);
            } else {
                submitSearch(query);
            }
        }
    };

    const panelVariants = prefersReduced
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
        : {
              hidden: { opacity: 0, y: -16 },
              visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
              },
              exit: { opacity: 0, y: -12, transition: { duration: 0.18 } },
          };

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="search-overlay-root">
                    <motion.div
                        className="search-overlay-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        ref={containerRef}
                        className="search-overlay-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Search the catalogue"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <form
                            className="search-form"
                            role="search"
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitSearch(query);
                            }}
                        >
                            <label className="sr-only" htmlFor="search-input">
                                Search products
                            </label>
                            <input
                                id="search-input"
                                data-autofocus
                                className="search-input"
                                type="search"
                                placeholder="Search for a piece, colour or fabric…"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                                role="combobox"
                                aria-expanded={results.length > 0}
                                aria-controls="search-results"
                                aria-activedescendant={
                                    activeIndex >= 0
                                        ? `search-result-${activeIndex}`
                                        : undefined
                                }
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm search-submit"
                                disabled={!query.trim()}
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                className="search-close"
                                onClick={onClose}
                                aria-label="Close search"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </form>

                        <div className="search-body">
                            <span className="sr-only" role="status" aria-live="polite">
                                {loading
                                    ? "Searching"
                                    : query.trim().length >= 2
                                    ? `${results.length} suggestions`
                                    : ""}
                            </span>

                            {query.trim().length >= 2 && (
                                <ul
                                    id="search-results"
                                    className="search-results"
                                    role="listbox"
                                    aria-label="Suggestions"
                                >
                                    {results.map((product, index) => (
                                        <li
                                            key={product.id}
                                            id={`search-result-${index}`}
                                            role="option"
                                            aria-selected={index === activeIndex}
                                            className={`search-result ${
                                                index === activeIndex
                                                    ? "is-active"
                                                    : ""
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                className="search-result-btn"
                                                onMouseEnter={() =>
                                                    setActiveIndex(index)
                                                }
                                                onClick={() => openProduct(product)}
                                            >
                                                <img
                                                    src={product.image}
                                                    alt=""
                                                    aria-hidden="true"
                                                />
                                                <span className="search-result-text">
                                                    <span className="search-result-name">
                                                        {product.name}
                                                    </span>
                                                    <span className="search-result-meta">
                                                        {product.category} · $
                                                        {product.new_price}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                    {!loading && results.length === 0 && (
                                        <li className="search-empty">
                                            No matches for “{query.trim()}”. Try a
                                            fabric, colour or category.
                                        </li>
                                    )}
                                </ul>
                            )}

                            {query.trim().length < 2 && (
                                <div className="search-prompts">
                                    {recent.length > 0 && (
                                        <div className="search-prompt-group">
                                            <span className="sku-tag">
                                                Recent searches
                                            </span>
                                            <div className="search-chips">
                                                {recent.map((term) => (
                                                    <button
                                                        key={term}
                                                        type="button"
                                                        className="state-suggestion"
                                                        onClick={() =>
                                                            submitSearch(term)
                                                        }
                                                    >
                                                        {term}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="search-prompt-group">
                                        <span className="sku-tag">Browse</span>
                                        <div className="search-chips">
                                            {CATEGORIES.map((category) => (
                                                <button
                                                    key={category.key}
                                                    type="button"
                                                    className="state-suggestion"
                                                    onClick={() => {
                                                        onClose();
                                                        navigate(category.path);
                                                    }}
                                                >
                                                    {category.label}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                className="state-suggestion"
                                                onClick={() => {
                                                    onClose();
                                                    navigate("/new-arrivals");
                                                }}
                                            >
                                                New arrivals
                                            </button>
                                            <button
                                                type="button"
                                                className="state-suggestion"
                                                onClick={() => {
                                                    onClose();
                                                    navigate("/sale");
                                                }}
                                            >
                                                Sale
                                            </button>
                                        </div>
                                    </div>

                                    <div className="search-prompt-group">
                                        <span className="sku-tag">Try</span>
                                        <div className="search-chips">
                                            {["linen", "merino", "denim", "sage"].map(
                                                (term) => (
                                                    <button
                                                        key={term}
                                                        type="button"
                                                        className="state-suggestion"
                                                        onClick={() =>
                                                            submitSearch(term)
                                                        }
                                                    >
                                                        {term}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default SearchOverlay;
