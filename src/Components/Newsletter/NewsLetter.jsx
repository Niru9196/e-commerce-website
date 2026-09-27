import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./NewsLetter.css";
import { subscribe } from "../../api/newsletter";
import { EMAIL_PATTERN } from "../../api/auth";
import { RevealOnScroll } from "../Motion/Reveal";

/**
 * Newsletter signup. Previously an input and a button with no state at all.
 *
 * Validation runs client-side for immediate feedback and again in the API,
 * so the "server" stays the source of truth. Errors are tied to the input
 * with aria-describedby and announced via role="alert".
 */
const NewsLetter = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");
    const prefersReduced = useReducedMotion();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (status === "pending") return;

        const trimmed = email.trim();

        if (!trimmed) {
            setStatus("error");
            setMessage("Enter your email address to subscribe.");
            return;
        }
        if (!EMAIL_PATTERN.test(trimmed)) {
            setStatus("error");
            setMessage("That doesn't look like a valid email address.");
            return;
        }

        setStatus("pending");
        setMessage("");

        try {
            const result = await subscribe(trimmed);
            setStatus("success");
            setMessage(result.message);
            setEmail("");
        } catch (error) {
            setStatus("error");
            setMessage(error.message || "Something went wrong. Try again.");
        }
    };

    const isError = status === "error";

    return (
        <RevealOnScroll
            as="section"
            className="newsletter"
            aria-labelledby="newsletter-heading"
        >
            <span className="cat-index newsletter-index">05 / SUBSCRIBE</span>
            <h1 id="newsletter-heading">Get exclusive offers by email</h1>
            <p>
                One letter a month: new arrivals, restocks and the occasional
                reduction. No noise.
            </p>

            <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
                <label className="sr-only" htmlFor="newsletter-email">
                    Email address
                </label>
                <div className="newsletter-field">
                    <input
                        id="newsletter-email"
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            if (status !== "idle") {
                                setStatus("idle");
                                setMessage("");
                            }
                        }}
                        aria-invalid={isError || undefined}
                        aria-describedby={
                            message ? "newsletter-message" : undefined
                        }
                        autoComplete="email"
                    />
                    <button
                        type="submit"
                        disabled={status === "pending"}
                        aria-disabled={status === "pending"}
                    >
                        {status === "pending" ? "Sending…" : "Subscribe"}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {message && (
                        <motion.p
                            key={message}
                            id="newsletter-message"
                            className={`newsletter-message ${
                                isError
                                    ? "newsletter-message-error"
                                    : "newsletter-message-success"
                            }`}
                            role={isError ? "alert" : "status"}
                            initial={
                                prefersReduced
                                    ? { opacity: 0 }
                                    : { opacity: 0, y: -4 }
                            }
                            animate={
                                prefersReduced
                                    ? { opacity: 1 }
                                    : { opacity: 1, y: 0 }
                            }
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {message}
                        </motion.p>
                    )}
                </AnimatePresence>
            </form>
        </RevealOnScroll>
    );
};

export default NewsLetter;
