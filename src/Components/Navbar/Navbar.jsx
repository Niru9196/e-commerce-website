import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import { useShop } from "../../Context/ShopContext";
import { useAuth } from "../../Context/AuthContext";
import useMobile from "../hooks/useMobile";
import useFocusTrap from "../../hooks/useFocusTrap";
import SearchOverlay from "../Search/SearchOverlay";

const NAV_LINKS = [
    { to: "/", label: "Shop", end: true },
    { to: "/mens", label: "Men" },
    { to: "/womens", label: "Women" },
    { to: "/kids", label: "Kids" },
    { to: "/new-arrivals", label: "New in" },
    { to: "/sale", label: "Sale" },
];

/** Animated count bubble. Remounts on change so the bump replays. */
const CountBadge = ({ count, className }) => {
    const prefersReduced = useReducedMotion();
    if (!count) return null;

    return (
        <AnimatePresence initial={false}>
            <motion.span
                key={count}
                className={className}
                initial={
                    prefersReduced ? { opacity: 0 } : { scale: 0.5, opacity: 0 }
                }
                animate={
                    prefersReduced
                        ? { opacity: 1 }
                        : { scale: [0.5, 1.25, 1], opacity: 1 }
                }
                transition={{ duration: 0.35 }}
            >
                {count > 99 ? "99+" : count}
            </motion.span>
        </AnimatePresence>
    );
};

const Navbar = () => {
    const { isMobile } = useMobile();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { cartCount, wishlistCount } = useShop();
    const { isAuthenticated, user, logout } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const menuToggleRef = useRef(null);
    const accountRef = useRef(null);
    const menuRef = useFocusTrap(isMenuOpen && isMobile, () =>
        setIsMenuOpen(false)
    );

    // Active state is derived from the URL, so deep-linking /kids highlights
    // "Kids". The previous version tracked it in local state, which meant a
    // direct visit always highlighted "Shop".
    useEffect(() => {
        setIsMenuOpen(false);
        setIsAccountOpen(false);
    }, [pathname]);

    // The navbar only gains its border and blur once the page has moved, so
    // it sits flat on the hero and lifts above content as you scroll.
    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close the account menu on an outside click or Escape.
    useEffect(() => {
        if (!isAccountOpen) return undefined;

        const onPointerDown = (event) => {
            if (!accountRef.current?.contains(event.target)) {
                setIsAccountOpen(false);
            }
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") setIsAccountOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isAccountOpen]);

    // Keyboard shortcut for search, matching the convention users expect.
    useEffect(() => {
        const onKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "k") {
                event.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const navLinks = (
        <ul className="nav-menu">
            {NAV_LINKS.map((link) => (
                <li key={link.to}>
                    <NavLink
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "is-active" : ""}`
                        }
                    >
                        {link.label}
                    </NavLink>
                </li>
            ))}
        </ul>
    );

    const actions = (
        <div className="nav-actions">
            <button
                type="button"
                className="nav-icon-btn"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search the catalogue"
                title="Search (Ctrl+K)"
            >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <circle
                        cx="10.5"
                        cy="10.5"
                        r="6.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                    />
                    <path
                        d="M15.5 15.5 21 21"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                    />
                </svg>
            </button>

            <Link
                to="/wishlist"
                className="nav-icon-btn nav-icon-link"
                aria-label={`Wishlist, ${wishlistCount} ${
                    wishlistCount === 1 ? "item" : "items"
                }`}
            >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                        d="M12 20.5 4.2 13a5 5 0 0 1 7.07-7.07l.73.73.73-.73A5 5 0 0 1 19.8 13Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                </svg>
                <CountBadge count={wishlistCount} className="nav-count" />
            </Link>

            <Link
                to="/cart"
                className="nav-cart-icon"
                aria-label={`Your bag, ${cartCount} ${
                    cartCount === 1 ? "item" : "items"
                }`}
            >
                <img src={cart_icon} alt="" aria-hidden="true" />
                <CountBadge count={cartCount} className="nav-cart-count" />
            </Link>

            {isAuthenticated ? (
                <div className="nav-account" ref={accountRef}>
                    <button
                        type="button"
                        className="nav-account-toggle"
                        onClick={() => setIsAccountOpen((open) => !open)}
                        aria-expanded={isAccountOpen}
                        aria-haspopup="menu"
                    >
                        <span className="nav-account-initial" aria-hidden="true">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="nav-account-name">
                            {user.name.split(" ")[0]}
                        </span>
                    </button>

                    <AnimatePresence>
                        {isAccountOpen && (
                            <motion.div
                                className="nav-account-menu"
                                role="menu"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                            >
                                <Link to="/account" role="menuitem">
                                    Your account
                                </Link>
                                <Link to="/wishlist" role="menuitem">
                                    Wishlist ({wishlistCount})
                                </Link>
                                <Link to="/cart" role="menuitem">
                                    Your bag ({cartCount})
                                </Link>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={async () => {
                                        setIsAccountOpen(false);
                                        await logout();
                                        // On a protected page, ProtectedRoute
                                        // handles the redirect home itself;
                                        // elsewhere we go home explicitly.
                                        navigate("/");
                                    }}
                                >
                                    Sign out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <Link className="btn btn-outline btn-sm nav-login-btn" to="/login">
                    Sign in
                </Link>
            )}
        </div>
    );

    return (
        <>
            <header
                className={`navbar ${isScrolled ? "is-scrolled" : ""} ${
                    isMenuOpen ? "is-open" : ""
                }`}
            >
                <div className="nav-top">
                    <Link to="/" className="nav-logo" aria-label="Shopper, home">
                        <img src={logo} alt="" aria-hidden="true" />
                        <p>SHOPPER</p>
                    </Link>

                    {isMobile && (
                        <div className="nav-top-actions">
                            <button
                                type="button"
                                className="nav-icon-btn"
                                onClick={() => setIsSearchOpen(true)}
                                aria-label="Search the catalogue"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="18"
                                    height="18"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="10.5"
                                        cy="10.5"
                                        r="6.5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                    />
                                    <path
                                        d="M15.5 15.5 21 21"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>

                            <Link
                                to="/cart"
                                className="nav-cart-icon"
                                aria-label={`Your bag, ${cartCount} items`}
                            >
                                <img src={cart_icon} alt="" aria-hidden="true" />
                                <CountBadge
                                    count={cartCount}
                                    className="nav-cart-count"
                                />
                            </Link>

                            <button
                                ref={menuToggleRef}
                                type="button"
                                className="hamburger-icon"
                                onClick={() => setIsMenuOpen((open) => !open)}
                                aria-expanded={isMenuOpen}
                                aria-controls="nav-mobile-panel"
                                aria-label={
                                    isMenuOpen
                                        ? "Close navigation menu"
                                        : "Open navigation menu"
                                }
                            >
                                <span aria-hidden="true">
                                    {isMenuOpen ? "\u2715" : "\u2630"}
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {!isMobile && (
                    <nav className="nav-desktop-menu" aria-label="Main">
                        {navLinks}
                        {actions}
                    </nav>
                )}
            </header>

            {/* Mobile panel */}
            <AnimatePresence>
                {isMobile && isMenuOpen && (
                    <>
                        <motion.div
                            className="nav-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.nav
                            id="nav-mobile-panel"
                            ref={menuRef}
                            className="nav-collapse"
                            aria-label="Main"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.22 }}
                        >
                            {navLinks}
                            {actions}
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>

            <SearchOverlay
                open={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    );
};

export default Navbar;
