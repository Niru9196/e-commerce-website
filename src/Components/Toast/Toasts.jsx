import React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT_EXPO } from "../../motion/variants";
import "./Toasts.css";

const Toasts = ({ toasts, onDismiss }) => {
    const prefersReduced = useReducedMotion();

    const variants = prefersReduced
        ? {
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 },
          }
        : {
              hidden: { opacity: 0, y: 16, scale: 0.98 },
              visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                      duration: DURATION.slow,
                      ease: EASE_OUT_EXPO,
                  },
              },
              exit: {
                  opacity: 0,
                  y: 8,
                  scale: 0.98,
                  transition: { duration: DURATION.fast },
              },
          };

    return (
        <>
            {/* Live region is always mounted and separate from the visual
                stack. Mounting a region at the same moment its content
                appears often means the announcement is missed. */}
            <div className="sr-only" role="status" aria-live="polite">
                {toasts
                    .map((toast) =>
                        [toast.title, toast.message].filter(Boolean).join(". ")
                    )
                    .join(" ")}
            </div>

            <div className="toast-stack">
                <AnimatePresence initial={false}>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            layout={!prefersReduced}
                            className={`toast toast-${toast.tone}`}
                            variants={variants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="toast-body">
                                {toast.title && (
                                    <p className="toast-title">{toast.title}</p>
                                )}
                                {toast.message && (
                                    <p className="toast-message">
                                        {toast.message}
                                    </p>
                                )}
                            </div>

                            <div className="toast-actions">
                                {toast.action?.to && (
                                    <Link
                                        className="toast-action"
                                        to={toast.action.to}
                                        onClick={() => onDismiss(toast.id)}
                                    >
                                        {toast.action.label}
                                    </Link>
                                )}
                                {toast.action?.onClick && (
                                    <button
                                        type="button"
                                        className="toast-action"
                                        onClick={() => {
                                            toast.action.onClick();
                                            onDismiss(toast.id);
                                        }}
                                    >
                                        {toast.action.label}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="toast-close"
                                    onClick={() => onDismiss(toast.id)}
                                    aria-label={`Dismiss notification${
                                        toast.title ? `: ${toast.title}` : ""
                                    }`}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
};

export default Toasts;
