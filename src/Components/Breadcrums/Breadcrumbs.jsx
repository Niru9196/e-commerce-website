import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import arrow_icon from "../Assets/breadcrum_arrow.png";
import { buildCrumbs } from "./crumbs";
import { DURATION, EASE_OUT_EXPO } from "../../motion/variants";
import "./Breadcrumbs.css";

/**
 * Accessible breadcrumb navigation.
 *
 * Replaces the old component, which rendered plain text (nothing was
 * clickable) and crashed on `/product` because it read `product.category`
 * from an undefined product.
 *
 * Props are all optional overrides for dynamic segments:
 *   product  — supplies the product name and its category crumb
 *   label    — overrides the final crumb's label
 *   category — forces the category crumb on a product page
 *   query    — renders the search term in the final crumb
 */
const Breadcrumbs = ({ product, label, category, query, className = "" }) => {
    const { pathname } = useLocation();
    const prefersReduced = useReducedMotion();

    const crumbs = buildCrumbs(pathname, {
        label: label || product?.name,
        category: category || product?.category,
        query,
    });

    const container = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
    };
    const item = prefersReduced
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
        : {
              hidden: { opacity: 0, x: -6 },
              visible: {
                  opacity: 1,
                  x: 0,
                  transition: {
                      duration: DURATION.base,
                      ease: EASE_OUT_EXPO,
                  },
              },
          };

    return (
        <nav aria-label="Breadcrumb" className={`breadcrumbs ${className}`}>
            <motion.ol
                className="breadcrumbs-list"
                variants={container}
                initial="hidden"
                animate="visible"
            >
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;

                    return (
                        <motion.li
                            key={crumb.key}
                            className="breadcrumbs-item"
                            variants={item}
                        >
                            {index > 0 && (
                                <img
                                    className="breadcrumbs-arrow"
                                    src={arrow_icon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            )}

                            {crumb.to ? (
                                <Link className="breadcrumbs-link" to={crumb.to}>
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span
                                    className={`breadcrumbs-current ${
                                        crumb.truncate
                                            ? "breadcrumbs-truncate"
                                            : ""
                                    }`}
                                    // Marks the page the user is on for
                                    // assistive technology.
                                    aria-current={isLast ? "page" : undefined}
                                    title={
                                        crumb.truncate ? crumb.label : undefined
                                    }
                                >
                                    {crumb.label}
                                </span>
                            )}
                        </motion.li>
                    );
                })}
            </motion.ol>
        </nav>
    );
};

export default Breadcrumbs;
