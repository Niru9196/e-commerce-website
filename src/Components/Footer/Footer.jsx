import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import footer_logo from "../Assets/logo_big.png";
import instagram_icon from "../Assets/instagram_icon.png";
import pintester_icon from "../Assets/pintester_icon.png";
import whatsapp_icon from "../Assets/whatsapp_icon.png";

/**
 * Site footer.
 *
 * Every entry here was previously a bare <li> styled with cursor:pointer —
 * it looked clickable and did nothing. They are now real <Link>s into the
 * app, and the social icons are external anchors with rel="noopener
 * noreferrer" and accessible names.
 */
const LINK_COLUMNS = [
    {
        title: "Shop",
        links: [
            { label: "Women", to: "/womens" },
            { label: "Men", to: "/mens" },
            { label: "Kids", to: "/kids" },
            { label: "New arrivals", to: "/new-arrivals" },
            { label: "Sale", to: "/sale" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", to: "/about" },
            { label: "Contact", to: "/contact" },
        ],
    },
    {
        title: "Help",
        links: [
            { label: "Size guide", to: "/size-guide" },
            { label: "Shipping & returns", to: "/shipping-returns" },
            { label: "FAQ", to: "/faq" },
        ],
    },
    {
        title: "Your account",
        links: [
            { label: "Sign in", to: "/login" },
            { label: "Your bag", to: "/cart" },
            { label: "Wishlist", to: "/wishlist" },
        ],
    },
];

const SOCIALS = [
    {
        label: "Shopper on Instagram",
        href: "https://www.instagram.com/",
        icon: instagram_icon,
    },
    {
        label: "Shopper on Pinterest",
        href: "https://www.pinterest.com/",
        icon: pintester_icon,
    },
    {
        label: "Message Shopper on WhatsApp",
        href: "https://www.whatsapp.com/",
        icon: whatsapp_icon,
    },
];

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <Link to="/" className="footer_logo" aria-label="Shopper, home">
                        <img src={footer_logo} alt="" aria-hidden="true" />
                        <p>SHOPPER</p>
                        <span className="reg-mark footer-regmark">
                            <span className="reg-mark-circle"></span>
                        </span>
                    </Link>
                    <p className="footer-blurb">
                        Catalogue No. 3 — a small, considered range of clothing
                        made in Portugal from responsibly sourced materials.
                    </p>

                    <ul className="footer-social-icon">
                        {SOCIALS.map((social) => (
                            <li key={social.label}>
                                <a
                                    className="footer-icons-container"
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${social.label} (opens in a new tab)`}
                                >
                                    <img src={social.icon} alt="" aria-hidden="true" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <nav className="footer-columns" aria-label="Footer">
                    {LINK_COLUMNS.map((column) => (
                        <div className="footer-column" key={column.title}>
                            <h2 className="footer-column-title">{column.title}</h2>
                            <ul className="footer-links">
                                {column.links.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to}>{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="footer-copyright">
                <hr />
                <div className="footer-copyright-row">
                    <p>© {new Date().getFullYear()} Shopper — All rights reserved.</p>
                    <p className="footer-note">
                        A portfolio build. Product photography and copy are for
                        demonstration only.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
