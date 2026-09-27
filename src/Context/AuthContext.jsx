import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import * as authApi from "../api/auth";

export const AuthContext = createContext(null);

export const AUTH_STATUS = {
    idle: "idle",
    pending: "pending",
    authenticated: "authenticated",
    anonymous: "anonymous",
};

/**
 * Fake auth over src/api/auth.
 *
 * The session is read synchronously on first render so a protected route
 * doesn't flash a redirect to /login for an already-signed-in user before
 * an async check resolves.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => authApi.getStoredSession()?.user || null);
    const [status, setStatus] = useState(() =>
        authApi.getStoredSession()?.user
            ? AUTH_STATUS.authenticated
            : AUTH_STATUS.anonymous
    );
    const [error, setError] = useState(null);

    // Seed a demo account so the auth flow can be tried without registering.
    useEffect(() => {
        authApi.ensureDemoUser();
    }, []);


    const run = useCallback(async (fn) => {
        setStatus(AUTH_STATUS.pending);
        setError(null);
        try {
            const session = await fn();
            setUser(session.user);
            setStatus(AUTH_STATUS.authenticated);
            return { ok: true, user: session.user };
        } catch (err) {
            setStatus(AUTH_STATUS.anonymous);
            setError(err);
            return {
                ok: false,
                error: err,
                fieldErrors: err?.fieldErrors || null,
            };
        }
    }, []);

    const login = useCallback(
        (credentials) => run(() => authApi.login(credentials)),
        [run]
    );

    const signup = useCallback(
        (details) => run(() => authApi.signup(details)),
        [run]
    );

    const logout = useCallback(async () => {
        await authApi.logout();
        setUser(null);
        setStatus(AUTH_STATUS.anonymous);
        setError(null);
    }, []);


    const clearError = useCallback(() => setError(null), []);

    const value = useMemo(
        () => ({
            user,
            status,
            error,
            isAuthenticated: Boolean(user),
            isPending: status === AUTH_STATUS.pending,
            login,
            signup,
            logout,
            clearError,
            demoCredentials: authApi.DEMO_CREDENTIALS,
        }),
        [
            user,
            status,
            error,
            login,
            signup,
            logout,
            clearError,
        ]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return context;
};

export default AuthProvider;
