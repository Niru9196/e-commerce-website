import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export const CartDrawerContext = createContext(null);

/**
 * Controls the slide-out bag. Kept in its own context so any add-to-cart
 * button — on a card, in quick view, or on the product page — can open it
 * without prop-drilling a handler through every listing component.
 */
export const CartDrawerProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { pathname } = useLocation();

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    // Never leave the drawer open across a navigation.
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const value = useMemo(
        () => ({ isOpen, open, close, toggle: () => setIsOpen((o) => !o) }),
        [isOpen, open, close]
    );

    return (
        <CartDrawerContext.Provider value={value}>
            {children}
        </CartDrawerContext.Provider>
    );
};

export const useCartDrawer = () => {
    const context = useContext(CartDrawerContext);
    if (!context) {
        throw new Error("useCartDrawer must be used inside <CartDrawerProvider>");
    }
    return context;
};

export default CartDrawerProvider;
