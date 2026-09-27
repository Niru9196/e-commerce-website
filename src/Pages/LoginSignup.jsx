import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./CSS/LoginSignup.css";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import Breadcrumbs from "../Components/Breadcrums/Breadcrumbs";
import { validateCredentials } from "../api/auth";

/**
 * Sign in / create account.
 *
 * Replaces a completely static form: no state, no validation, a button with
 * no handler, and a "Login here" span that wasn't a link.
 *
 * Validation runs here for immediate feedback and again in the API, which
 * returns `fieldErrors` — those are merged in so server-side problems (like
 * a duplicate email) attach to the right input.
 */
const LoginSignup = () => {
    const [mode, setMode] = useState("login");
    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",
        terms: false,
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");

    const { login, signup, isPending, demoCredentials } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const prefersReduced = useReducedMotion();

    const redirectTo = useMemo(() => {
        const raw = searchParams.get("redirect");
        // Only allow in-app paths — an absolute URL here would be an open
        // redirect.
        return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
    }, [searchParams]);

    const isSignup = mode === "signup";

    const setField = (field) => (event) => {
        const value =
            event.target.type === "checkbox"
                ? event.target.checked
                : event.target.value;
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setFormError("");
    };

    const switchMode = () => {
        setMode((m) => (m === "login" ? "signup" : "login"));
        setErrors({});
        setFormError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isPending) return;

        const nextErrors = validateCredentials(values, mode);
        if (isSignup && !values.terms) {
            nextErrors.terms = "Please accept the terms to continue.";
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        const result = isSignup
            ? await signup({
                  name: values.name,
                  email: values.email,
                  password: values.password,
              })
            : await login({ email: values.email, password: values.password });

        if (result.ok) {
            toast.success({
                title: isSignup ? "Account created" : "Signed in",
                message: `Welcome${result.user?.name ? `, ${result.user.name.split(" ")[0]}` : ""}.`,
            });
            navigate(redirectTo, { replace: true });
            return;
        }

        if (result.fieldErrors) setErrors(result.fieldErrors);
        setFormError(result.error?.message || "Something went wrong.");
    };

    const fieldMotion = {
        initial: prefersReduced ? { opacity: 0 } : { opacity: 0, height: 0 },
        animate: prefersReduced
            ? { opacity: 1 }
            : { opacity: 1, height: "auto" },
        exit: prefersReduced ? { opacity: 0 } : { opacity: 0, height: 0 },
        transition: { duration: 0.25 },
    };

    return (
        <>
            <Breadcrumbs label={isSignup ? "Create account" : "Sign in"} />

            <div className="loginsignup">
                <div className="loginsignup-container">
                    <span className="cat-index">
                        {isSignup ? "09 / REGISTER" : "09 / SIGN IN"}
                    </span>
                    <h1>{isSignup ? "Create an account" : "Sign in"}</h1>
                    <p className="loginsignup-lede">
                        {isSignup
                            ? "An account saves your wishlist and keeps your bag across devices."
                            : "Sign in to reach your wishlist and saved bag."}
                    </p>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="loginsignup-fields">
                            <AnimatePresence initial={false}>
                                {isSignup && (
                                    <motion.div
                                        key="name"
                                        className="field"
                                        {...fieldMotion}
                                    >
                                        <label htmlFor="name">Your name</label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={values.name}
                                            onChange={setField("name")}
                                            aria-invalid={
                                                Boolean(errors.name) || undefined
                                            }
                                            aria-describedby={
                                                errors.name
                                                    ? "name-error"
                                                    : undefined
                                            }
                                            autoComplete="name"
                                        />
                                        {errors.name && (
                                            <p
                                                className="field-error"
                                                id="name-error"
                                                role="alert"
                                            >
                                                {errors.name}
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="field">
                                <label htmlFor="email">Email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={values.email}
                                    onChange={setField("email")}
                                    aria-invalid={
                                        Boolean(errors.email) || undefined
                                    }
                                    aria-describedby={
                                        errors.email ? "email-error" : undefined
                                    }
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <p
                                        className="field-error"
                                        id="email-error"
                                        role="alert"
                                    >
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={values.password}
                                    onChange={setField("password")}
                                    aria-invalid={
                                        Boolean(errors.password) || undefined
                                    }
                                    aria-describedby={
                                        errors.password
                                            ? "password-error"
                                            : "password-hint"
                                    }
                                    autoComplete={
                                        isSignup
                                            ? "new-password"
                                            : "current-password"
                                    }
                                />
                                {errors.password ? (
                                    <p
                                        className="field-error"
                                        id="password-error"
                                        role="alert"
                                    >
                                        {errors.password}
                                    </p>
                                ) : (
                                    isSignup && (
                                        <p
                                            className="field-hint"
                                            id="password-hint"
                                        >
                                            At least 8 characters, including a
                                            number.
                                        </p>
                                    )
                                )}
                            </div>
                        </div>

                        {formError && (
                            <p className="loginsignup-form-error" role="alert">
                                {formError}
                            </p>
                        )}

                        <AnimatePresence initial={false}>
                            {isSignup && (
                                <motion.div
                                    key="terms"
                                    className="loginsignup-agree"
                                    {...fieldMotion}
                                >
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={values.terms}
                                        onChange={setField("terms")}
                                        aria-invalid={
                                            Boolean(errors.terms) || undefined
                                        }
                                        aria-describedby={
                                            errors.terms
                                                ? "terms-error"
                                                : undefined
                                        }
                                    />
                                    <div>
                                        <label htmlFor="terms">
                                            I agree to the terms of use and
                                            privacy policy.
                                        </label>
                                        {errors.terms && (
                                            <p
                                                className="field-error"
                                                id="terms-error"
                                                role="alert"
                                            >
                                                {errors.terms}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            className="btn btn-primary loginsignup-submit"
                            disabled={isPending}
                            aria-disabled={isPending}
                        >
                            {isPending
                                ? "Please wait…"
                                : isSignup
                                ? "Create account"
                                : "Sign in"}
                        </button>
                    </form>

                    <p className="loginsignup-login">
                        {isSignup
                            ? "Already have an account?"
                            : "Don't have an account?"}{" "}
                        <button
                            type="button"
                            className="loginsignup-switch"
                            onClick={switchMode}
                        >
                            {isSignup ? "Sign in" : "Create one"}
                        </button>
                    </p>

                    <div className="loginsignup-demo">
                        <span className="sku-tag">Demo account</span>
                        <p>
                            <code>{demoCredentials.email}</code> /{" "}
                            <code>{demoCredentials.password}</code>
                        </p>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                                setMode("login");
                                setErrors({});
                                setFormError("");
                                setValues({
                                    name: "",
                                    email: demoCredentials.email,
                                    password: demoCredentials.password,
                                    terms: false,
                                });
                            }}
                        >
                            Fill demo credentials
                        </button>
                    </div>

                    <p className="loginsignup-back">
                        <Link to="/">Back to the catalogue</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default LoginSignup;
