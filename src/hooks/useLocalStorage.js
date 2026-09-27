import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State persisted to localStorage, hardened against the things that
 * actually break in production:
 *
 *  - Storage being unavailable entirely (Safari private mode, blocked
 *    cookies) — falls back to in-memory state instead of throwing.
 *  - A malformed or hand-edited value — discarded in favour of the default.
 *  - A stored value written by an older shape of the app — rejected on a
 *    version mismatch rather than flowing into the reducer and crashing a
 *    render deep in the tree.
 *  - Quota exceeded on write.
 *
 * @param {string} key      storage key
 * @param {*}      initial  default value when nothing valid is stored
 * @param {Object} options
 * @param {number} options.version bump to invalidate older payloads
 * @param {Function} options.validate returns true if the parsed value is usable
 */
const useLocalStorage = (key, initial, options = {}) => {
    const { version = 1, validate } = options;
    const validateRef = useRef(validate);
    validateRef.current = validate;

    const read = useCallback(() => {
        try {
            const raw = window.localStorage.getItem(key);
            if (!raw) return initial;

            const parsed = JSON.parse(raw);
            if (
                !parsed ||
                typeof parsed !== "object" ||
                parsed.version !== version
            ) {
                return initial;
            }
            if (validateRef.current && !validateRef.current(parsed.value)) {
                return initial;
            }
            return parsed.value;
        } catch {
            // Corrupt JSON, blocked storage, or a SecurityError. Recovering
            // to the default is always better than a white screen.
            return initial;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, version]);

    const [value, setValue] = useState(read);

    useEffect(() => {
        try {
            window.localStorage.setItem(
                key,
                JSON.stringify({ version, value })
            );
        } catch {
            // Quota exceeded or storage disabled — state stays in memory.
        }
    }, [key, version, value]);

    return [value, setValue];
};

export default useLocalStorage;
