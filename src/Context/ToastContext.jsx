import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import Toasts from "../Components/Toast/Toasts";

export const ToastContext = createContext(null);

const DEFAULT_DURATION = 4000;

/**
 * Lightweight toast queue.
 *
 * Toasts are announced through a polite live region (see Toasts.jsx) so a
 * screen-reader user learns that something was added to their bag without
 * the announcement interrupting them mid-sentence.
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);
    const timersRef = useRef(new Map());

    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const push = useCallback(
        ({
            title,
            message,
            tone = "default",
            duration = DEFAULT_DURATION,
            action,
        }) => {
            idRef.current += 1;
            const id = idRef.current;

            setToasts((current) => {
                const next = [...current, { id, title, message, tone, action }];
                // Cap the stack so rapid adds can't cover the viewport.
                return next.slice(-3);
            });

            if (duration > 0) {
                timersRef.current.set(
                    id,
                    setTimeout(() => dismiss(id), duration)
                );
            }

            return id;
        },
        [dismiss]
    );

    const value = useMemo(
        () => ({
            toasts,
            push,
            dismiss,
            success: (opts) => push({ ...opts, tone: "success" }),
            error: (opts) => push({ ...opts, tone: "error" }),
        }),
        [toasts, push, dismiss]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toasts toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used inside <ToastProvider>");
    }
    return context;
};

export default ToastProvider;
