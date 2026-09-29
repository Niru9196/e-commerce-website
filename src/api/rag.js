/**
 * Shop assistant API — the deployed RAG backend (rag-product-search).
 *
 * Unlike the rest of src/api this is a real HTTP call, not the mock
 * transport. The backend is stateless: every question is answered on its
 * own from a vector search over its catalogue plus an LLM synthesis.
 *
 *   POST /api/search  { query }
 *     -> { answer, matchedProducts: [{ id, name, category, price, image, content, score }] }
 *
 * `id` matches the frontend catalogue (src/data/products.js), so a match
 * can be linked to its product page.
 */

import { ApiError } from "./client";

export const RAG_API_URL = (
    process.env.REACT_APP_RAG_API_URL || "https://rag-product-search.onrender.com"
).replace(/\/+$/, "");

export const MAX_QUERY_LENGTH = 500;

/** Render's free tier sleeps when idle; a cold start plus LLM call is slow. */
export const TIMEOUT_MS = 90_000;

/**
 * The backend embeds each product as one string:
 *   "<name>. <description>. Category: <category>. Price: $<price>"
 * Split it back into fields; anything else is shown as-is.
 */
const CONTENT_PATTERN =
    /^(.+?)\.\s(.+)\.\sCategory:\s(.+?)\.\sPrice:\s\$(\d+(?:\.\d+)?)\s*$/s;

export const parseProductContent = (content) => {
    const text = String(content ?? "").trim();
    const match = text.match(CONTENT_PATTERN);
    if (!match) return { description: text };

    const [, name, description, category, price] = match;
    // Descriptions in the catalogue end with "." which the join doubles up.
    return {
        name: name.trim(),
        description: description.replace(/\.+$/, "").trim(),
        category: category.trim(),
        price: Number(price),
    };
};

/** Backend image paths are relative ("/images/product_27.png"). */
export const toImageUrl = (image) => {
    if (typeof image !== "string" || !image.trim()) return null;
    if (/^https?:\/\//i.test(image)) return image;
    return `${RAG_API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const numberOrNull = (value) => {
    if (value == null || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

/**
 * One matched product from the backend:
 *   { id, name, category, price, image, content, score }
 * id/name/category/price/image may be null while the vector store still
 * holds documents from the old catalogue; in that case fall back to
 * parsing the embedded `content` string.
 */
export const normalizeProduct = (raw) => {
    const parsed = parseProductContent(raw?.content);
    const price = numberOrNull(raw?.price);

    return {
        id: numberOrNull(raw?.id),
        name: raw?.name || parsed.name || null,
        category: raw?.category || parsed.category || null,
        price: price ?? (Number.isFinite(parsed.price) ? parsed.price : null),
        image: toImageUrl(raw?.image),
        description: parsed.name ? parsed.description : null,
    };
};

/**
 * The system prompt asks for
 *   "Constraints identified: …\nRecommendation: …"
 * Fall back to the whole text as the recommendation if the model strays.
 */
export const splitAnswer = (answer) => {
    const text = String(answer ?? "").trim();
    const index = text.search(/recommendation\s*:/i);
    if (index === -1) return { constraints: null, recommendation: text };

    const constraints = text
        .slice(0, index)
        .replace(/^\W*constraints identified\s*:\s*/i, "")
        .trim();
    const recommendation = text
        .slice(index)
        .replace(/^recommendation\s*:\s*/i, "")
        .trim();

    return { constraints: constraints || null, recommendation };
};

/**
 * @param {string} rawQuery
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<{ answer: string, products: Object[] }>}
 */
export const askAssistant = async (rawQuery, { signal } = {}) => {
    const query = String(rawQuery ?? "").trim().slice(0, MAX_QUERY_LENGTH);
    if (!query) {
        throw new ApiError("Please enter a question.", {
            status: 400,
            code: "INVALID",
        });
    }

    // One controller for both the caller's cancel and our timeout.
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, TIMEOUT_MS);
    const onCallerAbort = () => controller.abort();
    if (signal?.aborted) controller.abort();
    signal?.addEventListener?.("abort", onCallerAbort);

    let response;
    try {
        response = await fetch(`${RAG_API_URL}/api/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ query }),
            signal: controller.signal,
        });
    } catch (err) {
        if (timedOut) {
            throw new ApiError(
                "The assistant is taking too long to respond. Please try again.",
                { status: 0, code: "TIMEOUT" }
            );
        }
        if (signal?.aborted) {
            throw new ApiError("Request aborted", { status: 0, code: "ABORTED" });
        }
        throw new ApiError(
            "We couldn't reach the assistant. Please try again.",
            { status: 0, code: "NETWORK" }
        );
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener?.("abort", onCallerAbort);
    }

    if (!response.ok) {
        throw new ApiError(
            "The assistant couldn't answer that just now. Please try again.",
            { status: response.status, code: "HTTP" }
        );
    }

    let data;
    try {
        data = await response.json();
    } catch {
        throw new ApiError(
            "The assistant sent an unexpected response. Please try again.",
            { status: response.status, code: "BAD_RESPONSE" }
        );
    }

    const matched = Array.isArray(data?.matchedProducts)
        ? data.matchedProducts
        : [];

    return {
        answer: typeof data?.answer === "string" ? data.answer : "",
        products: matched.map(normalizeProduct),
    };
};
