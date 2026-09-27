import React from "react";
import { Link } from "react-router-dom";
import "./States.css";

/**
 * Shown when a request succeeded but returned nothing. Always offers a way
 * out — an empty screen with no action is a dead end.
 */
export const EmptyState = ({
    eyebrow = "NO RESULTS",
    title = "Nothing here yet",
    message,
    actionLabel,
    onAction,
    linkTo,
    linkLabel,
    children,
}) => (
    <div className="state-block">
        <span className="cat-index">{eyebrow}</span>
        <h2>{title}</h2>
        {message && <p>{message}</p>}
        {children}
        <div className="state-actions">
            {onAction && actionLabel && (
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={onAction}
                >
                    {actionLabel}
                </button>
            )}
            {linkTo && linkLabel && (
                <Link className="btn btn-outline btn-sm" to={linkTo}>
                    {linkLabel}
                </Link>
            )}
        </div>
    </div>
);

/**
 * Shown when a request failed. `role="alert"` so assistive technology
 * announces the failure rather than leaving the user waiting.
 */
export const ErrorState = ({
    title = "Something went wrong",
    error,
    onRetry,
    retryLabel = "Try again",
}) => (
    <div className="state-block state-block-error" role="alert">
        <span className="cat-index">ERROR</span>
        <h2>{title}</h2>
        <p>
            {error?.message ||
                "We couldn't load this just now. Please try again."}
        </p>
        {onRetry && (
            <div className="state-actions">
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={onRetry}
                >
                    {retryLabel}
                </button>
            </div>
        )}
    </div>
);

export default EmptyState;
