/**
 * Contact form submission. Validation lives here as well as in the form so
 * the "server" rejects bad input independently of the UI.
 */

import { ApiError, request } from "./client";
import { EMAIL_PATTERN } from "./auth";

export const CONTACT_TOPICS = [
    { value: "order", label: "An existing order" },
    { value: "returns", label: "Returns or exchanges" },
    { value: "sizing", label: "Sizing and fit advice" },
    { value: "stock", label: "Stock and restocks" },
    { value: "press", label: "Press or wholesale" },
    { value: "other", label: "Something else" },
];

export const validateContact = ({ name, email, topic, message }) => {
    const errors = {};

    if (!name || name.trim().length < 2) {
        errors.name = "Please tell us your name.";
    }
    if (!email || !EMAIL_PATTERN.test(String(email).trim())) {
        errors.email = "Enter a valid email so we can reply.";
    }
    if (!topic) {
        errors.topic = "Choose what your message is about.";
    }
    if (!message || message.trim().length < 20) {
        errors.message = `Please give us a little more detail (at least 20 characters — currently ${
            message ? message.trim().length : 0
        }).`;
    }

    return errors;
};

export const submitContactForm = (payload, options = {}) =>
    request(
        () => {
            const errors = validateContact(payload);
            if (Object.keys(errors).length > 0) {
                const error = new ApiError("Please check the form.", {
                    status: 422,
                    code: "VALIDATION",
                });
                error.fieldErrors = errors;
                throw error;
            }

            const reference = `MSG-${Date.now().toString(36).toUpperCase()}`;
            return {
                reference,
                message: `Thanks — your message is with us. We reply to everything within one working day, and your reference is ${reference}.`,
            };
        },
        { latency: 700, canFail: false, ...options }
    );
