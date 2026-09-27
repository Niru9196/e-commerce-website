import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
    pageVariants,
    pageVariantsReduced,
    pickVariants,
} from "../../motion/variants";

/**
 * Wraps a route's content so entering/leaving pages cross-fade.
 * Must be rendered inside <AnimatePresence> with a `key` tied to the
 * location (see App.js).
 */
const PageTransition = ({ children, className = "" }) => {
    const prefersReduced = useReducedMotion();
    const variants = pickVariants(
        prefersReduced,
        pageVariants,
        pageVariantsReduced
    );

    return (
        <motion.div
            className={className}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
