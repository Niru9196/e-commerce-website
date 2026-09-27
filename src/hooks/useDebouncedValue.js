import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stopped changing for `delay` ms.
 * Used so the search typeahead fires one request per pause rather than one
 * per keystroke.
 */
const useDebouncedValue = (value, delay = 250) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
};

export default useDebouncedValue;
