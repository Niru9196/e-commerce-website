/**
 * Mock API transport.
 *
 * Every data read in the app goes through here rather than importing the
 * data module directly. That gives us a single seam to swap for a real
 * HTTP client later, and it means the UI has to deal with genuine
 * asynchrony — loading, empty and error states are real code paths rather
 * than hypothetical ones.
 */

/** Simulated round-trip time, in ms. */
export const LATENCY = {
    min: 180,
    max: 520,
};

/**
 * Probability (0–1) that a request fails, so error + retry states can be
 * demonstrated. Off by default; enable at runtime from the console with
 *   window.__SHOPPER_FAIL_RATE = 0.5
 * or permanently via REACT_APP_API_FAIL_RATE.
 */
const envFailRate = Number(process.env.REACT_APP_API_FAIL_RATE);
const DEFAULT_FAIL_RATE = Number.isFinite(envFailRate) ? envFailRate : 0;

const failRate = () => {
    const override =
        typeof window !== "undefined" ? window.__SHOPPER_FAIL_RATE : undefined;
    return Number.isFinite(Number(override))
        ? Number(override)
        : DEFAULT_FAIL_RATE;
};

export class ApiError extends Error {
    constructor(message, { status = 500, code = "UNKNOWN" } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

const randomLatency = () =>
    LATENCY.min + Math.random() * (LATENCY.max - LATENCY.min);

export const delay = (ms = randomLatency()) =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wraps a synchronous resolver in simulated network behaviour.
 *
 * @param {Function} resolver returns the payload (may throw ApiError)
 * @param {Object}   options
 * @param {number}   options.latency override the random latency
 * @param {boolean}  options.canFail whether random failure applies
 * @param {AbortSignal} options.signal cancels the in-flight request
 */
export const request = async (resolver, options = {}) => {
    const { latency, canFail = true, signal } = options;

    await delay(latency);

    if (signal?.aborted) {
        throw new ApiError("Request aborted", {
            status: 0,
            code: "ABORTED",
        });
    }

    if (canFail && Math.random() < failRate()) {
        throw new ApiError(
            "We couldn't reach the catalogue. Please try again.",
            { status: 503, code: "NETWORK" }
        );
    }

    return resolver();
};

/** Deep clone so callers can never mutate the underlying data module. */
export const clone = (value) =>
    typeof structuredClone === "function"
        ? structuredClone(value)
        : JSON.parse(JSON.stringify(value));

/** Shared helper for paginated list responses. */
export const paginate = (items, { page = 1, perPage = 12 } = {}) => {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
    const start = (safePage - 1) * perPage;
    const end = start + perPage;

    return {
        items: items.slice(0, end), // cumulative — supports "load more"
        pageItems: items.slice(start, end),
        page: safePage,
        perPage,
        total,
        totalPages,
        showingFrom: total === 0 ? 0 : 1,
        showingTo: Math.min(end, total),
        hasMore: end < total,
    };
};
