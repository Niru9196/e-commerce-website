import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";
import all_product, { findProductById } from "../data/products";
import { readStored, writeStored } from "../lib/storage";
import {
    shopReducer,
    sanitiseCart,
    sanitiseIds,
    isValidCart,
    selectCartLines,
    selectTotals,
    lineKey,
    RECENT_LIMIT,
} from "./shopReducer";

export const ShopContext = createContext(null);
export { lineKey };

const SCHEMA_VERSION = 1;
const CART_KEY = "shopper.cart.v1";
const WISHLIST_KEY = "shopper.wishlist.v1";
const RECENT_KEY = "shopper.recent.v1";

/** Hydrated lazily on first render, then sanitised before the reducer sees it. */
const initialState = () => ({
    cart: sanitiseCart(
        readStored(
            CART_KEY,
            { lines: {}, promoCode: null },
            { version: SCHEMA_VERSION, validate: isValidCart }
        )
    ),
    // The storage gate only checks that it *is* an array; sanitiseIds then
    // filters element by element, so one junk entry doesn't discard the
    // user's whole wishlist or history.
    wishlist: sanitiseIds(
        readStored(WISHLIST_KEY, [], {
            version: SCHEMA_VERSION,
            validate: Array.isArray,
        })
    ),
    recentlyViewed: sanitiseIds(
        readStored(RECENT_KEY, [], {
            version: SCHEMA_VERSION,
            validate: Array.isArray,
        }),
        RECENT_LIMIT
    ),
});

const ShopContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(shopReducer, undefined, initialState);

    // Each slice persists under its own key, so a corrupt cart can't take
    // the wishlist down with it.
    useEffect(() => {
        writeStored(CART_KEY, state.cart, { version: SCHEMA_VERSION });
    }, [state.cart]);

    useEffect(() => {
        writeStored(WISHLIST_KEY, state.wishlist, { version: SCHEMA_VERSION });
    }, [state.wishlist]);

    useEffect(() => {
        writeStored(RECENT_KEY, state.recentlyViewed, {
            version: SCHEMA_VERSION,
        });
    }, [state.recentlyViewed]);

    /* ---------------- actions ---------------- */

    const addToCart = useCallback(
        ({ productId, size = null, colorKey = null, quantity = 1 }) =>
            dispatch({
                type: "CART_ADD",
                payload: {
                    productId: Number(productId),
                    size,
                    colorKey,
                    quantity,
                },
            }),
        []
    );

    const updateQuantity = useCallback(
        (key, quantity) =>
            dispatch({ type: "CART_SET_QUANTITY", payload: { key, quantity } }),
        []
    );

    const removeLine = useCallback(
        (key) => dispatch({ type: "CART_REMOVE_LINE", payload: { key } }),
        []
    );

    const clearCart = useCallback(() => dispatch({ type: "CART_CLEAR" }), []);

    const applyPromo = useCallback(
        (code) => dispatch({ type: "PROMO_APPLY", payload: { code } }),
        []
    );

    const clearPromo = useCallback(() => dispatch({ type: "PROMO_CLEAR" }), []);

    const toggleWishlist = useCallback(
        (productId) =>
            dispatch({ type: "WISHLIST_TOGGLE", payload: { productId } }),
        []
    );

    const removeFromWishlist = useCallback(
        (productId) =>
            dispatch({ type: "WISHLIST_REMOVE", payload: { productId } }),
        []
    );

    const clearWishlist = useCallback(
        () => dispatch({ type: "WISHLIST_CLEAR" }),
        []
    );

    const recordView = useCallback(
        (productId) => dispatch({ type: "RECENT_ADD", payload: { productId } }),
        []
    );

    /* ---------------- derived ---------------- */

    // Memoised because the cart page, drawer and navbar badge all read
    // these on every render.
    const cartLines = useMemo(
        () => selectCartLines(state.cart.lines),
        [state.cart.lines]
    );

    const totals = useMemo(
        () => selectTotals(cartLines, state.cart.promoCode),
        [cartLines, state.cart.promoCode]
    );

    const wishlistProducts = useMemo(
        () => state.wishlist.map(findProductById).filter(Boolean),
        [state.wishlist]
    );

    const recentlyViewedProducts = useMemo(
        () => state.recentlyViewed.map(findProductById).filter(Boolean),
        [state.recentlyViewed]
    );

    const isWishlisted = useCallback(
        (productId) => state.wishlist.includes(Number(productId)),
        [state.wishlist]
    );

    const value = useMemo(
        () => ({
            all_product,

            // cart
            cartLines,
            cartCount: totals.totalItems,
            totals,
            addToCart,
            updateQuantity,
            removeLine,
            clearCart,
            applyPromo,
            clearPromo,

            // wishlist
            wishlist: state.wishlist,
            wishlistProducts,
            wishlistCount: state.wishlist.length,
            isWishlisted,
            toggleWishlist,
            removeFromWishlist,
            clearWishlist,

            // recently viewed
            recentlyViewedProducts,
            recordView,
        }),
        [
            cartLines,
            totals,
            addToCart,
            updateQuantity,
            removeLine,
            clearCart,
            applyPromo,
            clearPromo,
            state.wishlist,
            wishlistProducts,
            isWishlisted,
            toggleWishlist,
            removeFromWishlist,
            clearWishlist,
            recentlyViewedProducts,
            recordView,
        ]
    );

    return (
        <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) {
        throw new Error("useShop must be used inside <ShopContextProvider>");
    }
    return context;
};

export default ShopContextProvider;
