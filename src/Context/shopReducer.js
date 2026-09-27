/**
 * Shop store: reducer, sanitisers and derivation logic.
 *
 * Kept out of the provider component so the state transitions and money
 * maths are plain functions with no React dependency — easier to reason
 * about, and exercisable in isolation.
 */

import { findProductById } from "../data/products";
import {
    findPromo,
    FREE_SHIPPING_THRESHOLD,
    STANDARD_SHIPPING,
} from "../data/catalog";

export const RECENT_LIMIT = 8;
export const MAX_QTY_PER_LINE = 10;

/**
 * Cart lines are keyed by variant, not by product id. The old
 * implementation kept a flat `{ [productId]: count }` map, so a medium and
 * a large of the same shirt were indistinguishable.
 */
export const lineKey = (productId, size, colorKey) =>
    `${productId}::${size || "-"}::${colorKey || "-"}`;

/* ------------------------------------------------------------------
   Validators — localStorage is user-writable, so shapes are checked
   before they are trusted.
   ------------------------------------------------------------------ */

export const isValidCart = (value) =>
    Boolean(
        value &&
            typeof value === "object" &&
            typeof value.lines === "object" &&
            value.lines !== null &&
            !Array.isArray(value.lines)
    );

export const isIdArray = (value) =>
    Array.isArray(value) && value.every((id) => Number.isFinite(Number(id)));

/**
 * Drops lines referencing products that no longer exist, clamps
 * quantities, and repairs sizes/colours that are no longer offered.
 * Protects against a catalogue change or a hand-edited localStorage value
 * producing NaN totals or a crash deep in a render.
 */
export const sanitiseCart = (cart) => {
    const lines = {};
    const source = cart && typeof cart === "object" ? cart.lines || {} : {};

    Object.values(source).forEach((line) => {
        const product = findProductById(line?.productId);
        if (!product) return;

        const quantity = Math.min(
            MAX_QTY_PER_LINE,
            Math.max(0, Math.floor(Number(line.quantity) || 0))
        );
        if (quantity < 1) return;

        const size = product.sizes.some((s) => s.label === line.size)
            ? line.size
            : null;
        const colorKey = product.colors.some((c) => c.key === line.colorKey)
            ? line.colorKey
            : product.colors[0]?.key || null;

        const key = lineKey(product.id, size, colorKey);
        lines[key] = {
            key,
            productId: product.id,
            size,
            colorKey,
            quantity: lines[key]
                ? Math.min(MAX_QTY_PER_LINE, lines[key].quantity + quantity)
                : quantity,
            addedAt: line.addedAt || new Date().toISOString(),
        };
    });

    return {
        lines,
        promoCode: typeof cart?.promoCode === "string" ? cart.promoCode : null,
    };
};

/**
 * Filters an id list down to ids that still resolve to a product.
 *
 * Deliberately per-element rather than all-or-nothing: if one entry in a
 * stored wishlist is junk, the user should keep the rest of their wishlist
 * rather than lose the lot.
 */
export const sanitiseIds = (value, limit = Infinity) =>
    (Array.isArray(value) ? value : [])
        .map(Number)
        .filter((id) => Number.isFinite(id))
        .filter((id) => Boolean(findProductById(id)))
        .filter((id, index, arr) => arr.indexOf(id) === index)
        .slice(0, limit);

/* ------------------------------------------------------------------
   Reducer
   ------------------------------------------------------------------ */

export const shopReducer = (state, action) => {
    switch (action.type) {
        case "CART_ADD": {
            const { productId, size, colorKey, quantity } = action.payload;
            const key = lineKey(productId, size, colorKey);
            const existing = state.cart.lines[key];
            const nextQuantity = Math.min(
                MAX_QTY_PER_LINE,
                (existing?.quantity || 0) + Math.max(1, quantity || 1)
            );

            return {
                ...state,
                cart: {
                    ...state.cart,
                    lines: {
                        ...state.cart.lines,
                        [key]: {
                            key,
                            productId,
                            size: size || null,
                            colorKey: colorKey || null,
                            quantity: nextQuantity,
                            addedAt:
                                existing?.addedAt || new Date().toISOString(),
                        },
                    },
                },
            };
        }

        case "CART_SET_QUANTITY": {
            const { key, quantity } = action.payload;
            const existing = state.cart.lines[key];
            if (!existing) return state;

            const clamped = Math.min(
                MAX_QTY_PER_LINE,
                Math.max(0, Math.floor(Number(quantity) || 0))
            );

            // Zero removes the line — what a stepper decrementing past 1
            // should do.
            if (clamped === 0) {
                const { [key]: _removed, ...rest } = state.cart.lines;
                return { ...state, cart: { ...state.cart, lines: rest } };
            }

            return {
                ...state,
                cart: {
                    ...state.cart,
                    lines: {
                        ...state.cart.lines,
                        [key]: { ...existing, quantity: clamped },
                    },
                },
            };
        }

        case "CART_REMOVE_LINE": {
            const { [action.payload.key]: _removed, ...rest } =
                state.cart.lines;
            return { ...state, cart: { ...state.cart, lines: rest } };
        }

        case "CART_CLEAR":
            return { ...state, cart: { lines: {}, promoCode: null } };

        case "PROMO_APPLY":
            return {
                ...state,
                cart: { ...state.cart, promoCode: action.payload.code },
            };

        case "PROMO_CLEAR":
            return { ...state, cart: { ...state.cart, promoCode: null } };

        case "WISHLIST_TOGGLE": {
            const id = Number(action.payload.productId);
            if (!Number.isFinite(id)) return state;
            const exists = state.wishlist.includes(id);
            return {
                ...state,
                wishlist: exists
                    ? state.wishlist.filter((item) => item !== id)
                    : [id, ...state.wishlist],
            };
        }

        case "WISHLIST_REMOVE":
            return {
                ...state,
                wishlist: state.wishlist.filter(
                    (item) => item !== Number(action.payload.productId)
                ),
            };

        case "WISHLIST_CLEAR":
            return { ...state, wishlist: [] };

        case "RECENT_ADD": {
            const id = Number(action.payload.productId);
            if (!Number.isFinite(id)) return state;

            // Ring buffer: most recent first, no duplicates, capped.
            const next = [
                id,
                ...state.recentlyViewed.filter((item) => item !== id),
            ].slice(0, RECENT_LIMIT);

            // Bail out if nothing actually changed, so viewing the same
            // product twice doesn't trigger a pointless re-render + write.
            if (
                next.length === state.recentlyViewed.length &&
                next.every((item, i) => item === state.recentlyViewed[i])
            ) {
                return state;
            }
            return { ...state, recentlyViewed: next };
        }

        default:
            return state;
    }
};

/* ------------------------------------------------------------------
   Derivation
   ------------------------------------------------------------------ */

/** Joins stored cart lines with live product data. */
export const selectCartLines = (lines) =>
    Object.values(lines)
        .map((line) => {
            const product = findProductById(line.productId);
            if (!product) return null;

            const color =
                product.colors.find((c) => c.key === line.colorKey) ||
                product.colors[0];
            const sizeInfo = product.sizes.find((s) => s.label === line.size);

            return {
                ...line,
                product,
                color,
                maxQuantity: Math.min(
                    MAX_QTY_PER_LINE,
                    sizeInfo?.stock || product.stock || MAX_QTY_PER_LINE
                ),
                lineTotal: product.new_price * line.quantity,
                // Falls back to the current price when the piece isn't
                // reduced, so "savings" never counts a non-existent discount.
                lineWas:
                    (product.old_price ?? product.new_price) * line.quantity,
            };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

/**
 * Order totals. The promo is re-validated here on every derive, so a code
 * that stops qualifying (because the user removed items) drops away
 * instead of silently discounting an order it shouldn't.
 */
export const selectTotals = (cartLines, promoCode) => {
    const subtotal = cartLines.reduce((sum, line) => sum + line.lineTotal, 0);
    const wasTotal = cartLines.reduce((sum, line) => sum + line.lineWas, 0);
    const totalItems = cartLines.reduce((sum, line) => sum + line.quantity, 0);

    const promo = promoCode ? findPromo(promoCode) : null;
    const promoQualifies = Boolean(
        promo && (!promo.minSubtotal || subtotal >= promo.minSubtotal)
    );

    let discount = 0;
    if (promoQualifies) {
        if (promo.type === "percent") {
            discount = (subtotal * promo.value) / 100;
        } else if (promo.type === "fixed") {
            discount = Math.min(promo.value, subtotal);
        }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);

    let shipping = 0;
    if (totalItems > 0) {
        const freeByThreshold = discountedSubtotal >= FREE_SHIPPING_THRESHOLD;
        const freeByPromo = promoQualifies && promo.type === "shipping";
        shipping = freeByThreshold || freeByPromo ? 0 : STANDARD_SHIPPING;
    }

    return {
        totalItems,
        subtotal,
        savings: Math.max(0, wasTotal - subtotal),
        promo: promoQualifies ? promo : null,
        promoCode: promoCode || null,
        promoQualifies,
        discount,
        shipping,
        total: discountedSubtotal + shipping,
        freeShippingRemaining: Math.max(
            0,
            FREE_SHIPPING_THRESHOLD - discountedSubtotal
        ),
    };
};
