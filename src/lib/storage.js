/**
 * Versioned, failure-tolerant localStorage access.
 *
 * Every read has to survive four real-world cases: storage being blocked
 * entirely, a malformed value, a value written by an older shape of the
 * app, and a value of the wrong type. In all four we fall back to the
 * caller's default rather than letting a bad blob reach a reducer and
 * crash a render.
 */

const envelope = (version, value) => ({ version, value });

export const readStored = (key, fallback, { version = 1, validate } = {}) => {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return fallback;
        if (parsed.version !== version) return fallback;
        if (validate && !validate(parsed.value)) return fallback;

        return parsed.value;
    } catch {
        return fallback;
    }
};

export const writeStored = (key, value, { version = 1 } = {}) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(envelope(version, value)));
        return true;
    } catch {
        // Quota exceeded, or storage disabled in private browsing.
        return false;
    }
};

export const removeStored = (key) => {
    try {
        window.localStorage.removeItem(key);
    } catch {
        /* nothing to do */
    }
};
