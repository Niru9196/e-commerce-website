import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./ProductGallery.css";

/**
 * Product gallery.
 *
 * The asset set contains exactly one photograph per product, so rather than
 * pretend to have alternate angles this presents four framed *views* of
 * that photograph (different crops and zoom levels), which is honest and
 * still gives the page something to interact with.
 *
 * The main image crossfades between views. This replaces the shared-element
 * `layoutId` morph from the grid card, which could not work reliably while
 * page transitions use AnimatePresence `mode="wait"` — the card unmounts
 * before this component mounts, so the morph started from a stale
 * measurement.
 */
const ProductGallery = ({ product }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const prefersReduced = useReducedMotion();
    const thumbRefs = useRef([]);

    // Reset when navigating between products.
    useEffect(() => {
        setActiveIndex(0);
    }, [product.id]);

    const views = product.gallery;
    const active = views[activeIndex];

    const move = (delta) => {
        const next = (activeIndex + delta + views.length) % views.length;
        setActiveIndex(next);
        thumbRefs.current[next]?.focus();
    };

    const handleKeyDown = (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            move(1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            move(-1);
        } else if (event.key === "Home") {
            event.preventDefault();
            setActiveIndex(0);
            thumbRefs.current[0]?.focus();
        } else if (event.key === "End") {
            event.preventDefault();
            setActiveIndex(views.length - 1);
            thumbRefs.current[views.length - 1]?.focus();
        }
    };

    return (
        <div className="gallery">
            {/* Thumbnails behave as tabs: one tab stop, arrows move within. */}
            <div
                className="gallery-thumbs"
                role="tablist"
                aria-label="Product views"
                aria-orientation="vertical"
                onKeyDown={handleKeyDown}
            >
                {views.map((view, index) => (
                    <button
                        key={view.id}
                        ref={(el) => {
                            thumbRefs.current[index] = el;
                        }}
                        type="button"
                        role="tab"
                        id={`gallery-tab-${index}`}
                        aria-selected={index === activeIndex}
                        aria-controls="gallery-panel"
                        tabIndex={index === activeIndex ? 0 : -1}
                        className={`gallery-thumb plate plate-duotone ${
                            index === activeIndex ? "is-active" : ""
                        }`}
                        onClick={() => setActiveIndex(index)}
                    >
                        <span className="sku-tag gallery-thumb-index">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <img
                            src={view.src}
                            alt=""
                            aria-hidden="true"
                            style={{
                                objectPosition: view.objectPosition,
                                transform: `scale(${view.zoom})`,
                            }}
                        />
                        <span className="sr-only">{view.label}</span>
                    </button>
                ))}
            </div>

            <div
                className="gallery-main plate plate-duotone plate-regmarks plate-raised"
                role="tabpanel"
                id="gallery-panel"
                aria-labelledby={`gallery-tab-${activeIndex}`}
            >
                <span className="reg-mark">
                    <span className="reg-mark-circle"></span>
                </span>
                <span className="reg-mark">
                    <span className="reg-mark-circle"></span>
                </span>
                <span className="reg-mark">
                    <span className="reg-mark-circle"></span>
                </span>
                <span className="reg-mark">
                    <span className="reg-mark-circle"></span>
                </span>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.img
                        key={active.id}
                        className="gallery-main-img"
                        src={active.src}
                        alt={active.alt}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: prefersReduced ? 0.01 : 0.35 }}
                        style={{
                            objectPosition: active.objectPosition,
                            transform: `scale(${active.zoom})`,
                        }}
                    />
                </AnimatePresence>

                <div className="plate-caption">
                    <span>{product.sku}</span>
                    <span>&mdash;</span>
                    <span>{active.label}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductGallery;
