import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import AuthProvider from "./Context/AuthContext";
import ShopContextProvider from "./Context/ShopContext";
import ToastProvider from "./Context/ToastContext";

/**
 * Provider order matters:
 *  - BrowserRouter is outermost because ToastProvider renders <Link>s
 *    ("View bag" on the add-to-cart toast).
 *  - AuthProvider sits above the shop so route guards and the navbar
 *    account menu can read the session.
 *  - ToastProvider is innermost so anything below it can raise a toast.
 */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>
        <AuthProvider>
            <ShopContextProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </ShopContextProvider>
        </AuthProvider>
    </BrowserRouter>
);

reportWebVitals();
