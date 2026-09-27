import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll position to the top of the document whenever the route
 * changes. Replaces the previous anti-pattern in Item.jsx, where
 * `onClick={window.scrollTo(0, 0)}` invoked the scroll during render.
 *
 * `behavior: "instant"` is required because index.css sets
 * `html { scroll-behavior: smooth }`, which would otherwise animate the
 * jump between pages.
 *
 * Search-param-only changes (filters, sort, pagination) intentionally do
 * NOT reset scroll, so refining a category listing keeps the user in place.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
