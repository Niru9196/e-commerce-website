/**
 * Pure crumb-trail construction, split out from the component so the
 * route mapping can be reasoned about (and exercised) without React.
 */

import { CATEGORIES } from "../../data/catalog";

/**
 * Label + parent map for known routes. Anything not listed falls back to a
 * title-cased path segment, so a new route still gets sensible crumbs
 * before it is registered here.
 */
export const ROUTE_META = {
    mens: { label: "Men", parent: "shop" },
    womens: { label: "Women", parent: "shop" },
    kids: { label: "Kids", parent: "shop" },
    "new-arrivals": { label: "New arrivals", parent: "shop" },
    sale: { label: "Sale", parent: "shop" },
    product: { label: "Product", parent: "shop" },
    search: { label: "Search", parent: "shop" },
    cart: { label: "Your bag" },
    wishlist: { label: "Wishlist" },
    account: { label: "Account" },
    login: { label: "Sign in" },
    about: { label: "About" },
    contact: { label: "Contact" },
    "size-guide": { label: "Size guide", parent: "help" },
    "shipping-returns": { label: "Shipping & returns", parent: "help" },
    faq: { label: "FAQ", parent: "help" },
};

/**
 * Virtual crumbs — group headings that aren't routes of their own.
 * `to: null` renders them as plain text rather than a link to nowhere.
 */
export const VIRTUAL = {
    shop: { label: "Shop", to: "/" },
    help: { label: "Help", to: null },
};

export const titleCase = (segment) =>
    segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

/**
 * @param {string} pathname  current location pathname
 * @param {Object} overrides { label, category, query } for dynamic pages
 * @returns {Array<{key, label, to, truncate?}>} last crumb always has to === null
 */
export const buildCrumbs = (pathname, overrides = {}) => {
    const segments = String(pathname || "/")
        .split("/")
        .filter(Boolean);

    // Home is the current page — a single, non-linked crumb.
    if (segments.length === 0) {
        return [{ key: "home", label: "Home", to: null }];
    }

    const crumbs = [{ key: "home", label: "Home", to: "/" }];
    const [first] = segments;
    const meta = ROUTE_META[first];

    const parent = meta?.parent ? VIRTUAL[meta.parent] : null;
    if (parent) {
        crumbs.push({ key: meta.parent, label: parent.label, to: parent.to });
    }

    if (first === "product") {
        // A product sits under its own category, which only the caller
        // knows — hence the `category` override.
        const category = CATEGORIES.find((c) => c.key === overrides.category);
        if (category) {
            crumbs.push({
                key: category.key,
                label: category.label,
                to: category.path,
            });
        }
        crumbs.push({
            key: "product",
            // While the product is still resolving we show a neutral label
            // rather than flashing "undefined".
            label: overrides.label || "Product",
            to: null,
            truncate: true,
        });
        return crumbs;
    }

    if (first === "search") {
        crumbs.push({
            key: "search",
            label: overrides.query
                ? `Results for \u201C${overrides.query}\u201D`
                : "Search",
            to: null,
            truncate: true,
        });
        return crumbs;
    }

    crumbs.push({
        key: first,
        label: overrides.label || meta?.label || titleCase(first),
        to: null,
    });

    // Deeper segments (e.g. /account/orders) are appended generically; the
    // previously-last crumb becomes a link now that it has a child.
    segments.slice(1).forEach((segment, index) => {
        crumbs[crumbs.length - 1].to =
            "/" + segments.slice(0, index + 1).join("/");
        crumbs.push({
            key: `${segment}-${index}`,
            label: titleCase(segment),
            to: null,
        });
    });

    return crumbs;
};
