import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import useFocusTrap from "../../hooks/useFocusTrap";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { backdropVariants, modalVariants, fadeOnly } from "../../motion/variants";
import "./Modal.css";

/**
 * Accessible dialog shell.
 *
 * Rendered in a portal so it escapes any transformed/overflow-hidden
 * ancestor. Handles the four things a dialog must get right: focus is
 * trapped inside, focus returns to the trigger on close, Escape and the
 * backdrop both close it, and the page behind cannot scroll.
 */
const Modal = ({
    open,
    onClose,
    labelledBy,
    describedBy,
    children,
    size = "md",
    className = "",
}) => {
    const prefersReduced = useReducedMotion();
    const containerRef = useFocusTrap(open, onClose);
    useBodyScrollLock(open);

    const panelVariants = prefersReduced ? fadeOnly : modalVariants;

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="modal-root">
                    <motion.div
                        className="modal-backdrop"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />
                    <motion.div
                        ref={containerRef}
                        className={`modal-panel modal-${size} ${className}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={labelledBy}
                        aria-describedby={describedBy}
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <button
                            type="button"
                            className="modal-close"
                            onClick={onClose}
                            aria-label="Close dialog"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Modal;
