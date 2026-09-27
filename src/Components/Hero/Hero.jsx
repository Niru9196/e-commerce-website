import React, { useRef } from "react";
import "./Hero.css";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import hand_icon from "../Assets/hand_icon.png";
import arrow_icon from "../Assets/arrow.png";
import hero_image from "../Assets/hero_image.png";
import { DURATION, EASE_OUT_EXPO } from "../../motion/variants";

const Hero = () => {
    const sectionRef = useRef(null);
    const prefersReduced = useReducedMotion();

    // Parallax: the plate image drifts slower than the page scroll, which
    // separates it from the flat background and creates depth.
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
    const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

    const headline = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
    };
    const line = prefersReduced
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
        : {
              hidden: { opacity: 0, y: 20 },
              visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
              },
          };

    return (
        <section className="hero" ref={sectionRef} aria-label="New arrivals">
            <motion.div
                className="hero-left"
                variants={headline}
                initial="hidden"
                animate="visible"
            >
                <motion.span className="cat-index" variants={line}>
                    01 / COVER
                </motion.span>
                <motion.h2 variants={line}>NEW ARRIVALS ONLY</motion.h2>
                <motion.div variants={line}>
                    <div className="hero-hand-icon">
                        <p>new</p>
                        <img src={hand_icon} alt="" aria-hidden="true" />
                    </div>
                    <p>collections</p>
                    <p>for everyone</p>
                </motion.div>
                <motion.div variants={line} className="hero-cta-wrap">
                    {/* Was a bare <div> that did nothing. */}
                    <Link className="hero-latest-btn" to="/new-arrivals">
                        <span>Latest Collection</span>
                        <img src={arrow_icon} alt="" aria-hidden="true" />
                    </Link>
                </motion.div>
            </motion.div>

            <div className="hero-right">
                <div className="hero-plate plate plate-duotone plate-regmarks plate-raised">
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
                    <motion.img
                        src={hero_image}
                        alt="Model wearing pieces from the new season collection"
                        style={
                            prefersReduced
                                ? undefined
                                : { y: imageY, scale: imageScale }
                        }
                    />
                    <div className="plate-caption">
                        <span>PLATE 01</span>
                        <span>&mdash;</span>
                        <span>S/S SEASON</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
