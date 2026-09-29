import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { askAssistant, splitAnswer } from "../../api/rag";
import useFocusTrap from "../../hooks/useFocusTrap";
import { findProductById } from "../../data/products";
import { CATEGORIES } from "../../data/catalog";
import { money } from "../CartItems/CartLine";
import "./AskWidget.css";

export const EXAMPLE_QUESTIONS = [
    "Warm knitwear under $100",
    "Something linen for summer",
    "A dress for an occasion",
    "Everyday clothes for kids",
];

/** After this long, explain that the free-tier backend may be waking up. */
export const SLOW_AFTER_MS = 5000;

let nextId = 0;
const newId = () => {
    nextId += 1;
    return `ask-${nextId}`;
};

const ChatIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path
            d="M4 5.5h16v10H9.5L5 19.5v-4H4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
        />
        <path
            d="M8 10.5h.01M12 10.5h.01M16 10.5h.01"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
        />
    </svg>
);

/**
 * Backend ids match the local catalogue, so a match can borrow its
 * description and photo and link to the product page. If the id is
 * missing or unknown (old vector-store data), it renders as plain info.
 */
const ProductCard = ({ product, onNavigate }) => {
    const local = product.id != null ? findProductById(product.id) : undefined;
    const name = product.name || local?.name;
    const image = product.image || local?.image;
    const description = local?.description || product.description;
    const category =
        CATEGORIES.find((c) => c.key === product.category)?.label ||
        product.category;

    const body = (
        <>
            {image && (
                <img
                    className="ask-product-image"
                    src={image}
                    alt=""
                    loading="lazy"
                />
            )}
            <div className="ask-product-body">
                {name && <p className="ask-product-name">{name}</p>}
                {(category || Number.isFinite(product.price)) && (
                    <p className="ask-product-meta">
                        {category && <span className="sku-tag">{category}</span>}
                        {Number.isFinite(product.price) && (
                            <span className="ask-product-price">
                                {money(product.price)}
                            </span>
                        )}
                    </p>
                )}
                {description && (
                    <p className="ask-product-desc">{description}</p>
                )}
            </div>
        </>
    );

    return (
        <li className="ask-product">
            {local ? (
                <Link
                    className="ask-product-inner"
                    to={`/product/${local.id}`}
                    onClick={onNavigate}
                >
                    {body}
                </Link>
            ) : (
                <div className="ask-product-inner">{body}</div>
            )}
        </li>
    );
};

const AssistantReply = ({ message, isSlow, onRetry, onNavigate }) => {
    if (message.status === "pending") {
        return (
            <div className="ask-bubble ask-bubble-assistant">
                <span className="ask-typing" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </span>
                <span className="sr-only">Assistant is thinking…</span>
                {isSlow && (
                    <p className="ask-hint">
                        Waking up the assistant — the first answer can take up
                        to a minute.
                    </p>
                )}
            </div>
        );
    }

    if (message.status === "error") {
        return (
            <div className="ask-bubble ask-bubble-assistant ask-bubble-error">
                <p>{message.error}</p>
                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => onRetry(message)}
                >
                    Try again
                </button>
            </div>
        );
    }

    const { constraints, recommendation } = splitAnswer(message.answer);

    return (
        <div className="ask-bubble ask-bubble-assistant">
            {constraints && (
                <div className="ask-constraints">
                    <span className="cat-index">CONSTRAINTS IDENTIFIED</span>
                    <p className="ask-text">{constraints}</p>
                </div>
            )}
            <div>
                <span className="cat-index">RECOMMENDATION</span>
                <p className="ask-text">
                    {recommendation || "No recommendation was returned."}
                </p>
            </div>
            {message.products.length > 0 && (
                <div>
                    <span className="cat-index">MATCHED PRODUCTS</span>
                    <ul className="ask-products">
                        {message.products.map((product, index) => (
                            <ProductCard
                                key={product.id ?? index}
                                product={product}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

/**
 * Floating "Ask the shop" assistant, fixed bottom-right on every page.
 * Talks to the RAG backend, which is stateless, so each question is
 * answered independently; the thread only lives for this session.
 */
const AskWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isSlow, setIsSlow] = useState(false);

    const controllerRef = useRef(null);
    const threadRef = useRef(null);

    const close = useCallback(() => setIsOpen(false), []);
    const panelRef = useFocusTrap(isOpen, close);

    const isPending = messages.some((m) => m.status === "pending");

    // Cancel any in-flight request if the widget unmounts.
    useEffect(() => () => controllerRef.current?.abort(), []);

    useEffect(() => {
        if (!isPending) return undefined;
        const timer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
        return () => {
            clearTimeout(timer);
            setIsSlow(false);
        };
    }, [isPending]);

    // Keep the newest message in view.
    useEffect(() => {
        const thread = threadRef.current;
        if (thread) thread.scrollTop = thread.scrollHeight;
    }, [messages, isSlow, isOpen]);

    const updateMessage = (id, patch) =>
        setMessages((list) =>
            list.map((m) => (m.id === id ? { ...m, ...patch } : m))
        );

    const run = async (id, query) => {
        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            const { answer, products } = await askAssistant(query, {
                signal: controller.signal,
            });
            updateMessage(id, { status: "done", answer, products });
        } catch (err) {
            if (err?.code === "ABORTED") return;
            updateMessage(id, {
                status: "error",
                error: err?.message || "Something went wrong. Please try again.",
            });
        } finally {
            if (controllerRef.current === controller) {
                controllerRef.current = null;
            }
        }
    };

    const ask = (text) => {
        const query = text.trim();
        if (!query || isPending) return;

        const replyId = newId();
        setMessages((list) => [
            ...list,
            { id: newId(), role: "user", text: query },
            { id: replyId, role: "assistant", status: "pending", query },
        ]);
        setInput("");
        run(replyId, query);
    };

    const retry = (message) => {
        if (isPending) return;
        updateMessage(message.id, { status: "pending", error: null });
        run(message.id, message.query);
    };

    const onSubmit = (event) => {
        event.preventDefault();
        ask(input);
    };

    return (
        <div className="ask-widget">
            <AnimatePresence>
                {isOpen && (
                    <motion.section
                        ref={panelRef}
                        id="ask-panel"
                        className="ask-panel"
                        role="dialog"
                        aria-labelledby="ask-title"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.2 }}
                    >
                        <header className="ask-head">
                            <div>
                                <span className="cat-index">AI ASSISTANT</span>
                                <h2 id="ask-title">Ask the shop</h2>
                            </div>
                            <button
                                type="button"
                                className="ask-close"
                                onClick={close}
                                aria-label="Close assistant"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </header>

                        <div
                            ref={threadRef}
                            className="ask-thread"
                            aria-live="polite"
                        >
                            {messages.length === 0 ? (
                                <div className="ask-intro">
                                    <p>
                                        Describe what you need in plain
                                        language and get a recommendation from
                                        the catalogue.
                                    </p>
                                    <ul className="ask-examples">
                                        {EXAMPLE_QUESTIONS.map((question) => (
                                            <li key={question}>
                                                <button
                                                    type="button"
                                                    className="ask-example"
                                                    onClick={() => ask(question)}
                                                >
                                                    {question}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                messages.map((message) =>
                                    message.role === "user" ? (
                                        <div
                                            key={message.id}
                                            className="ask-bubble ask-bubble-user"
                                        >
                                            <p className="ask-text">
                                                {message.text}
                                            </p>
                                        </div>
                                    ) : (
                                        <AssistantReply
                                            key={message.id}
                                            message={message}
                                            isSlow={isSlow}
                                            onRetry={retry}
                                            onNavigate={close}
                                        />
                                    )
                                )
                            )}
                        </div>

                        <form className="ask-form" onSubmit={onSubmit}>
                            <label className="sr-only" htmlFor="ask-input">
                                Your question
                            </label>
                            <input
                                id="ask-input"
                                type="text"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="e.g. waterproof jacket under $50"
                                maxLength={500}
                                autoComplete="off"
                                data-autofocus
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                disabled={isPending || !input.trim()}
                            >
                                Send
                            </button>
                        </form>
                    </motion.section>
                )}
            </AnimatePresence>

            <button
                type="button"
                className="ask-launcher"
                onClick={() => setIsOpen((open) => !open)}
                aria-label="Ask the shop assistant"
                aria-expanded={isOpen}
                aria-controls="ask-panel"
            >
                {isOpen ? (
                    <span className="ask-launcher-x" aria-hidden="true">
                        &times;
                    </span>
                ) : (
                    <ChatIcon />
                )}
            </button>
        </div>
    );
};

export default AskWidget;
