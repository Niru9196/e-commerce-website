import React, { useState, useContext } from "react";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import useMobile from "../hooks/useMobile";

const Navbar = () => {
    const [menu, setMenu] = useState("shop");
    const { isMobile } = useMobile();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { getTotalCartItems } = useContext(ShopContext);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            {isMobileMenuOpen && (
                <div className="nav-overlay" onClick={toggleMenu}></div>
            )}

            <div className={`navbar ${isMobileMenuOpen ? "active" : ""}`}>
                <div className="nav-top">
                    <div className="nav-logo">
                        <img src={logo} alt="logo" />
                        <p>SHOPPER</p>
                    </div>

                    {isMobileMenuOpen && isMobile && (
                        <div className="nav-cart-icon">
                            <Link to="/cart">
                                <img src={cart_icon} alt="cart" />
                            </Link>
                            <div className="nav-cart-count">
                                {getTotalCartItems()}
                            </div>
                        </div>
                    )}

                    <div className="hamburger-icon" onClick={toggleMenu}>
                        <FontAwesomeIcon
                            icon={isMobileMenuOpen ? faTimes : faBars}
                        />
                    </div>
                </div>

                <div
                    className={`nav-collapse ${
                        isMobileMenuOpen ? "active" : ""
                    }`}
                >
                    {isMobileMenuOpen && isMobile && (
                        <ul className="nav-menu">
                            <li onClick={() => setMenu("shop")}>
                                <Link to="/">Shop</Link>
                                {menu === "shop" && <hr />}
                            </li>
                            <li onClick={() => setMenu("mens")}>
                                <Link to="/mens">Men</Link>
                                {menu === "mens" && <hr />}
                            </li>
                            <li onClick={() => setMenu("womens")}>
                                <Link to="/womens">Women</Link>
                                {menu === "womens" && <hr />}
                            </li>
                            <li onClick={() => setMenu("kids")}>
                                <Link to="/kids">Kids</Link>
                                {menu === "kids" && <hr />}
                            </li>
                        </ul>
                    )}
                    <div className="nav-login-mobile">
                        <Link to="/login">
                            <button>Login</button>
                        </Link>
                    </div>
                </div>

                {!isMobile && (
                    <div className="nav-desktop-menu">
                        <ul className="nav-menu">
                            <li onClick={() => setMenu("shop")}>
                                <Link to="/">Shop</Link>
                                {menu === "shop" && <hr />}
                            </li>
                            <li onClick={() => setMenu("mens")}>
                                <Link to="/mens">Men</Link>
                                {menu === "mens" && <hr />}
                            </li>
                            <li onClick={() => setMenu("womens")}>
                                <Link to="/womens">Women</Link>
                                {menu === "womens" && <hr />}
                            </li>
                            <li onClick={() => setMenu("kids")}>
                                <Link to="/kids">Kids</Link>
                                {menu === "kids" && <hr />}
                            </li>
                        </ul>
                        <div className="cart-login-wishlist">
                            <div className="nav-login-mobile">
                                <Link to="/login">
                                    <button>Login</button>
                                </Link>
                            </div>
                            <div className="nav-cart-icon">
                                <Link to="/cart">
                                    <img src={cart_icon} alt="cart" />
                                </Link>
                                <div className="nav-cart-count">
                                    {getTotalCartItems()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Navbar;
