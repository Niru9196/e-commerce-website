/**
 * Fake auth API.
 *
 * Users live in localStorage. Passwords are stored as a non-reversible
 * digest rather than plaintext — not because this is secure (it is not,
 * and it never touches a server), but so the demo does not model a
 * practice that would be indefensible in real code.
 */

import { ApiError, request } from "./client";

const USERS_KEY = "shopper.users.v1";
const SESSION_KEY = "shopper.session.v1";

/* ------------------------------------------------------------------
   Storage helpers — every read is defensive, because a user can edit
   localStorage by hand and a malformed blob must not break sign-in.
   ------------------------------------------------------------------ */

const readJSON = (key, fallback) => {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
};

const writeJSON = (key, value) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Quota exceeded or storage disabled (private mode). The session
        // simply won't persist; the app stays usable in-memory.
    }
};

const readUsers = () => {
    const users = readJSON(USERS_KEY, []);
    return Array.isArray(users) ? users : [];
};

/** Small non-reversible digest. Sufficient to avoid storing plaintext. */
const digest = (value) => {
    let hash = 5381;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 33) ^ value.charCodeAt(i);
    }
    return (hash >>> 0).toString(36);
};

const publicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
});

/* ------------------------------------------------------------------
   Validation — mirrored by the form, but enforced here too so the
   "server" is the source of truth rather than the UI.
   ------------------------------------------------------------------ */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export const validateCredentials = ({ name, email, password }, mode) => {
    const errors = {};

    if (mode === "signup") {
        if (!name || name.trim().length < 2) {
            errors.name = "Please enter your name (at least 2 characters).";
        }
    }
    if (!email || !EMAIL_PATTERN.test(email.trim())) {
        errors.email = "Enter a valid email address, e.g. you@example.com.";
    }
    if (!password || password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    } else if (mode === "signup" && !/\d/.test(password)) {
        errors.password = "Include at least one number.";
    }

    return errors;
};

/* ------------------------------------------------------------------
   Endpoints
   ------------------------------------------------------------------ */

export const signup = ({ name, email, password }, options = {}) =>
    request(
        () => {
            const errors = validateCredentials(
                { name, email, password },
                "signup"
            );
            if (Object.keys(errors).length > 0) {
                const error = new ApiError("Please check the form.", {
                    status: 422,
                    code: "VALIDATION",
                });
                error.fieldErrors = errors;
                throw error;
            }

            const users = readUsers();
            const normalisedEmail = email.trim().toLowerCase();

            if (users.some((user) => user.email === normalisedEmail)) {
                const error = new ApiError(
                    "An account already exists with that email.",
                    { status: 409, code: "EMAIL_TAKEN" }
                );
                error.fieldErrors = {
                    email: "An account already exists with that email.",
                };
                throw error;
            }

            const user = {
                id: `u_${Date.now().toString(36)}`,
                name: name.trim(),
                email: normalisedEmail,
                passwordDigest: digest(password),
                createdAt: new Date().toISOString(),
            };

            writeJSON(USERS_KEY, [...users, user]);

            const session = {
                user: publicUser(user),
                issuedAt: new Date().toISOString(),
            };
            writeJSON(SESSION_KEY, session);
            return session;
        },
        { canFail: false, ...options }
    );

export const login = ({ email, password }, options = {}) =>
    request(
        () => {
            const errors = validateCredentials({ email, password }, "login");
            if (Object.keys(errors).length > 0) {
                const error = new ApiError("Please check the form.", {
                    status: 422,
                    code: "VALIDATION",
                });
                error.fieldErrors = errors;
                throw error;
            }

            const normalisedEmail = email.trim().toLowerCase();
            const user = readUsers().find(
                (candidate) => candidate.email === normalisedEmail
            );

            // Deliberately vague: revealing whether the email exists would
            // let anyone enumerate accounts.
            if (!user || user.passwordDigest !== digest(password)) {
                throw new ApiError("Email or password is incorrect.", {
                    status: 401,
                    code: "BAD_CREDENTIALS",
                });
            }

            const session = {
                user: publicUser(user),
                issuedAt: new Date().toISOString(),
            };
            writeJSON(SESSION_KEY, session);
            return session;
        },
        { canFail: false, ...options }
    );

export const logout = (options = {}) =>
    request(
        () => {
            try {
                window.localStorage.removeItem(SESSION_KEY);
            } catch {
                /* storage unavailable — nothing to clear */
            }
            return { ok: true };
        },
        { latency: 120, canFail: false, ...options }
    );

/** Synchronous read used to hydrate AuthContext on first render. */
export const getStoredSession = () => {
    const session = readJSON(SESSION_KEY, null);
    if (!session?.user?.email) return null;
    return session;
};

/** Seeded demo account, so a reviewer can sign in without registering. */
export const DEMO_CREDENTIALS = {
    email: "demo@shopper.test",
    password: "catalogue1",
};

export const ensureDemoUser = () => {
    const users = readUsers();
    if (users.some((user) => user.email === DEMO_CREDENTIALS.email)) return;

    writeJSON(USERS_KEY, [
        ...users,
        {
            id: "u_demo",
            name: "Demo Reviewer",
            email: DEMO_CREDENTIALS.email,
            passwordDigest: digest(DEMO_CREDENTIALS.password),
            createdAt: new Date().toISOString(),
        },
    ]);
};
