import React from "react";
import { Link } from "react-router-dom";
import "./CSS/NotFound.css";

/**
 * Generic "nothing here" page. Used both as the catch-all `*` route and as
 * the graceful fallback when a product id cannot be resolved, so a bad URL
 * never produces a white screen.
 */
const NotFound = ({
    code = "404",
    title = "Page not found",
    message = "The page you were looking for isn't in this catalogue. It may have been moved, sold out, or never existed.",
}) => {
    return (
        <div className="notfound">
            <div className="notfound-inner">
                <span className="cat-index">{code} / NOT FOUND</span>
                <h1>{title}</h1>
                <hr className="rule" />
                <p>{message}</p>
                <div className="notfound-actions">
                    <Link className="btn btn-primary" to="/">
                        Back to shop
                    </Link>
                    <Link className="btn btn-outline" to="/womens">
                        Browse women
                    </Link>
                    <Link className="btn btn-outline" to="/mens">
                        Browse men
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
