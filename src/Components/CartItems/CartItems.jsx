import React, { useContext, useEffect, useState } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import remove_icon from "../Assets/cart_cross_icon.png";

const CartItems = () => {
    const [isMobile, setIsMobile] = useState(false);
    const { all_product, cartItems, removeFromCart, getTotalCartAmount } =
        useContext(ShopContext);

    useEffect(() => {
        const checkScreenWidth = () => {
            setIsMobile(window.innerWidth < 746);
        };

        checkScreenWidth();

        window.addEventListener("resize", checkScreenWidth);

        return () => {
            window.removeEventListener("resize", checkScreenWidth);
        };
    }, []);

    return (
        <div className="cartitems">
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            {!isMobile && <hr />}
            {all_product.map((e) => {
                if (cartItems[e.id] > 0) {
                    return isMobile ? (
                        <div key={e.id} className="cartitems-format-mobile">
                            <div className="cartitems-format-main-mobile">
                                <img
                                    src={e.image}
                                    alt=""
                                    className="carticon-product-icon"
                                />
                                <p>{e.name}</p>
                                <img
                                    className="cartitems-remove-icon"
                                    src={remove_icon}
                                    onClick={() => {
                                        removeFromCart(e.id);
                                    }}
                                    alt=""
                                />
                            </div>
                            <div className="cartItems-price">
                                <div className="cartItem-price-quantity">
                                    <p>Price</p>
                                    <p className="cartItem-price-tag">
                                        ${e.new_price}
                                    </p>
                                </div>
                                <div className="cartItem-price-quantity">
                                    <p>Quantity</p>
                                    <button className="cartitems-quantity cartItem-price-tag">
                                        {cartItems[e.id]}
                                    </button>
                                </div>
                                <div className="cartItem-price-quantity">
                                    <p>Total</p>
                                    <p className="cartItem-price-tag">
                                        ${e.new_price * cartItems[e.id]}
                                    </p>
                                </div>
                            </div>
                            <hr />
                        </div>
                    ) : (
                        <div key={e.id}>
                            <div className="cartitems-format cartitems-format-main">
                                <img
                                    src={e.image}
                                    alt=""
                                    className="carticon-product-icon"
                                />
                                <p>{e.name}</p>
                                <p>${e.new_price}</p>
                                <button className="cartitems-quantity">
                                    {cartItems[e.id]}
                                </button>
                                <p>${e.new_price * cartItems[e.id]}</p>
                                <img
                                    className="cartitems-remove-icon"
                                    src={remove_icon}
                                    onClick={() => {
                                        removeFromCart(e.id);
                                    }}
                                    alt=""
                                />
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Total</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Subtotal</p>
                            <p>${getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h1>Total</h1>
                            <h3>${getTotalCartAmount()}</h3>
                        </div>
                    </div>
                    <button>PROCEED TO CHECKOUT</button>
                </div>
                <div className="cartitems-promocode">
                    <p>If you have a promo code,Enter it here</p>
                    <div className="cartitems-promobox">
                        <input type="text" placeholder="promo code" />
                    </div>
                    <button className="cartitems-promobox-submit">
                        SUBMIT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItems;
