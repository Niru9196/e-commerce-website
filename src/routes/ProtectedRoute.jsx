import React, { useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

/**
 * Gates a route behind authentication.
 *
 * The intended destination is passed through as `?redirect=`, so signing in
 * returns the user to where they were heading rather than dumping them on
 * the home page. AuthContext reads the stored session synchronously on
 * first render, so an already-signed-in user never sees a redirect flash.
 *
 * `wasAllowed` exists because of how page transitions work here. Routes are
 * rendered inside AnimatePresence `mode="wait"` and receive an explicit
 * `location` prop, which pins the *old* location for the outgoing subtree.
 * So when a user signs out from /account, this component stays mounted,
 * still believes it is on /account, and re-renders with no session — and it
 * would immediately redirect to /login, making the sign-out look broken.
 *
 * Once children have been shown, losing the session means the user signed
 * out deliberately; the sign-out handler is already navigating away, so this
 * renders nothing rather than competing with it. A genuine unauthenticated
 * arrival still redirects, because `wasAllowed` is false on first render.
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const wasAllowed = useRef(false);

    if (!isAuthenticated) {
        if (wasAllowed.current) {
            // Signing out: the page is on its way out, don't navigate.
            return null;
        }
        const target = `${location.pathname}${location.search}`;
        return (
            <Navigate
                to={`/login?redirect=${encodeURIComponent(target)}`}
                replace
            />
        );
    }

    wasAllowed.current = true;
    return children;
};

export default ProtectedRoute;
