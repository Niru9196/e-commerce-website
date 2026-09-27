/**
 * Newsletter subscription. Keeps a local list so a repeat submission
 * returns a realistic "already subscribed" conflict rather than silently
 * succeeding twice.
 */

import { ApiError, request } from "./client";
import { EMAIL_PATTERN } from "./auth";

const KEY = "shopper.newsletter.v1";

const read = () => {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const write = (list) => {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
        /* storage unavailable — subscription is in-memory only */
    }
};

export const subscribe = (rawEmail, options = {}) =>
    request(
        () => {
            const email = String(rawEmail || "").trim().toLowerCase();

            if (!email) {
                throw new ApiError("Enter your email address to subscribe.", {
                    status: 422,
                    code: "REQUIRED",
                });
            }
            if (!EMAIL_PATTERN.test(email)) {
                throw new ApiError(
                    "That doesn't look like a valid email address.",
                    { status: 422, code: "VALIDATION" }
                );
            }

            const existing = read();
            if (existing.includes(email)) {
                throw new ApiError("You're already on the list.", {
                    status: 409,
                    code: "ALREADY_SUBSCRIBED",
                });
            }

            write([...existing, email]);
            return {
                email,
                message: "You're on the list. Look out for Catalogue No. 4.",
            };
        },
        { canFail: false, ...options }
    );

export const isSubscribed = (email) =>
    read().includes(String(email || "").trim().toLowerCase());
