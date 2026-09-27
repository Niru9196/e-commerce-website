import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Breadcrumbs from "../Breadcrums/Breadcrumbs";
import { DURATION, EASE_OUT_EXPO } from "../../motion/variants";
import "./PageHeader.css";

/**
 * Masthead shared by listing and content pages: breadcrumbs, an index
 * eyebrow, the title, a rule and an optional meta line. Keeping it in one
 * place is what makes every page read as part of the same catalogue.
 */
const PageHeader = ({
    index,
    eyebrow = "CATEGORY",
    title,
    meta,
    lede,
    banner,
    bannerAlt = "",
    children,
    breadcrumbProps,
    showBreadcrumbs = true,
}) => {
    const prefersReduced = useReducedMotion();

    const group = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
    };
    const item = prefersReduced
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
        : {
              hidden: { opacity: 0, y: 14 },
              visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
              },
          };

    return (
        <>
            {showBreadcrumbs && <Breadcrumbs {...breadcrumbProps} />}

            {banner && (
                <div className="page-banner plate plate-duotone">
                    <img src={banner} alt={bannerAlt} />
                </div>
            )}

            <motion.header
                className="page-header"
                variants={group}
                initial="hidden"
                animate="visible"
            >
                <motion.span className="cat-index" variants={item}>
                    {index ? `${index} / ${eyebrow}` : eyebrow}
                </motion.span>
                <motion.h1 variants={item}>{title}</motion.h1>
                <motion.hr className="rule" variants={item} />
                {(meta || lede) && (
                    <motion.div className="page-header-meta" variants={item}>
                        {lede && <p className="page-header-lede">{lede}</p>}
                        {meta && <span className="sku-tag">{meta}</span>}
                    </motion.div>
                )}
                {children}
            </motion.header>
        </>
    );
};

export default PageHeader;
