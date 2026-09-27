import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Account.css";
import { useAuth } from "../Context/AuthContext";
import { useShop } from "../Context/ShopContext";
import { useToast } from "../Context/ToastContext";
import PageHeader from "../Components/PageHeader/PageHeader";
import RecentlyViewed from "../Components/RecentlyViewed/RecentlyViewed";
import { EmptyState } from "../Components/States/States";

const Account = () => {
    const { user, logout } = useAuth();
    const { wishlistCount, cartCount, totals } = useShop();
    const toast = useToast();
    const navigate = useNavigate();

    const joined = new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const handleLogout = async () => {
        await logout();
        toast.push({ title: "Signed out", message: "See you next time." });
        navigate("/", { replace: true });
    };

    return (
        <>
            <PageHeader
                index="10"
                eyebrow="ACCOUNT"
                title={`Hello, ${user.name.split(" ")[0]}`}
                lede="Your wishlist and bag are saved to this account and persist across reloads."
            />

            <div className="account">
                <section className="account-panel" aria-labelledby="profile-heading">
                    <h2 id="profile-heading">Profile</h2>
                    <dl className="account-details">
                        <div>
                            <dt>Name</dt>
                            <dd>{user.name}</dd>
                        </div>
                        <div>
                            <dt>Email</dt>
                            <dd>{user.email}</dd>
                        </div>
                        <div>
                            <dt>Member since</dt>
                            <dd>{joined}</dd>
                        </div>
                    </dl>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>
                </section>

                <section className="account-panel" aria-labelledby="activity-heading">
                    <h2 id="activity-heading">Your activity</h2>
                    <ul className="account-stats">
                        <li>
                            <span className="account-stat-value">
                                {wishlistCount}
                            </span>
                            <span className="account-stat-label">
                                saved {wishlistCount === 1 ? "piece" : "pieces"}
                            </span>
                            <Link to="/wishlist">View wishlist</Link>
                        </li>
                        <li>
                            <span className="account-stat-value">{cartCount}</span>
                            <span className="account-stat-label">
                                {cartCount === 1 ? "item" : "items"} in your bag
                            </span>
                            <Link to="/cart">View bag</Link>
                        </li>
                        <li>
                            <span className="account-stat-value">
                                ${totals.subtotal.toFixed(2)}
                            </span>
                            <span className="account-stat-label">
                                current bag subtotal
                            </span>
                        </li>
                    </ul>
                </section>

                <section className="account-panel" aria-labelledby="orders-heading">
                    <h2 id="orders-heading">Orders</h2>
                    <EmptyState
                        eyebrow="NO ORDERS"
                        title="No past orders"
                        message="Checkout isn't part of this build, so there's no order history to show. Everything up to the bag is fully functional."
                        linkTo="/new-arrivals"
                        linkLabel="Browse new arrivals"
                    />
                </section>
            </div>

            <RecentlyViewed index="11" limit={4} />
        </>
    );
};

export default Account;
