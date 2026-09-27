import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
    revealVariants,
    revealVariantsReduced,
    staggerContainer,
    staggerItem,
    staggerItemReduced,
    pickVariants,
} from "../../motion/variants";

/**
 * Reveals its children once when scrolled into view.
 * `once: true` matters — without it sections re-animate every time they
 * re-enter the viewport, which reads as a glitch on a long page.
 */
export const RevealOnScroll = ({
    children,
    as = "div",
    className = "",
    delay = 0,
    amount = 0.2,
    ...rest
}) => {
    const prefersReduced = useReducedMotion();
    const variants = pickVariants(
        prefersReduced,
        revealVariants,
        revealVariantsReduced
    );
    const MotionTag = motion[as] || motion.div;

    return (
        <MotionTag
            className={className}
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount }}
            transition={{ delay }}
            {...rest}
        >
            {children}
        </MotionTag>
    );
};

/**
 * Parent for staggered grids/lists. Children should be <StaggerItem>.
 */
export const StaggerGroup = ({
    children,
    as = "div",
    className = "",
    amount = 0.1,
    ...rest
}) => {
    const MotionTag = motion[as] || motion.div;

    return (
        <MotionTag
            className={className}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount }}
            {...rest}
        >
            {children}
        </MotionTag>
    );
};

export const StaggerItem = ({
    children,
    as = "div",
    className = "",
    ...rest
}) => {
    const prefersReduced = useReducedMotion();
    const variants = pickVariants(
        prefersReduced,
        staggerItem,
        staggerItemReduced
    );
    const MotionTag = motion[as] || motion.div;

    return (
        <MotionTag className={className} variants={variants} {...rest}>
            {children}
        </MotionTag>
    );
};

export default RevealOnScroll;
