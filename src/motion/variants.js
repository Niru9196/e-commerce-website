/**
 * Shared Framer Motion variants and timings.
 *
 * Every transform-based variant here has an opacity-only counterpart so
 * components can degrade gracefully when the user has asked for reduced
 * motion. `<MotionConfig reducedMotion="user">` in App.js already strips
 * transform/layout animations globally, but variants that *start* offset
 * still need an explicit fallback or elements can render in the wrong
 * place; use `pickVariants` for those.
 */

export const DURATION = {
    fast: 0.15,
    base: 0.25,
    slow: 0.4,
    slower: 0.7,
};

// Matches --ease-out-expo in index.css
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
export const EASE = [0.4, 0, 0.2, 1];

/* ---------- page transitions ---------- */

export const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
    },
    exit: {
        opacity: 0,
        y: -4,
        transition: { duration: DURATION.base, ease: EASE },
    },
};

export const pageVariantsReduced = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: DURATION.base } },
    exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

/* ---------- scroll reveals ---------- */

export const revealVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
    },
};

export const revealVariantsReduced = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: DURATION.base } },
};

/* ---------- staggered lists / grids ---------- */

export const staggerContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
};

export const staggerItem = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
    },
};

export const staggerItemReduced = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: DURATION.base } },
};

/* ---------- overlays / drawers / modals ---------- */

export const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: DURATION.base } },
    exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

export const drawerVariants = {
    hidden: { x: "100%" },
    visible: {
        x: 0,
        transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
    },
    exit: {
        x: "100%",
        transition: { duration: DURATION.base, ease: EASE },
    },
};

export const modalVariants = {
    hidden: { opacity: 0, scale: 0.97, y: 12 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        transition: { duration: DURATION.fast, ease: EASE },
    },
};

export const fadeOnly = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: DURATION.base } },
    exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

/**
 * Chooses between a full (transform) variant set and a reduced
 * (opacity-only) set.
 *
 * @param {boolean} prefersReduced result of useReducedMotion()
 */
export const pickVariants = (prefersReduced, full, reduced) =>
    prefersReduced ? reduced : full;
