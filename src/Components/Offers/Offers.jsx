import React from "react";
import { Link } from "react-router-dom";
import "./Offers.css";
import exclusive_image from "../Assets/exclusive_image.png";
import { RevealOnScroll } from "../Motion/Reveal";
import { saleProducts } from "../../data/products";

const Offers = () => {
    const deepest = saleProducts[0]?.salePercent || 0;

    return (
        <section className="offers" aria-labelledby="offers-heading">
            <RevealOnScroll className="offers-left">
                <span className="cat-index offers-index">04 / LIMITED RUN</span>
                <p>The Edit</p>
                <h1 id="offers-heading">Considered pieces,</h1>
                <h1>reduced for a season</h1>
                <p className="offers-meta">
                    {saleProducts.length} pieces reduced — up to {deepest}% off.
                    Sale stock is not repeated once it goes.
                </p>
                {/* Was a <button> with no handler. */}
                <Link className="btn btn-primary offers-cta" to="/sale">
                    Shop the edit
                </Link>
            </RevealOnScroll>

            <RevealOnScroll className="offers-right" delay={0.1}>
                <div className="offers-plate plate plate-duotone plate-regmarks plate-raised">
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
                    <img
                        src={exclusive_image}
                        alt="Model wearing a reduced piece from the seasonal edit"
                    />
                    <div className="plate-caption">
                        <span>PLATE 04</span>
                        <span>&mdash;</span>
                        <span>BEST SELLER</span>
                    </div>
                </div>
            </RevealOnScroll>
        </section>
    );
};

export default Offers;
