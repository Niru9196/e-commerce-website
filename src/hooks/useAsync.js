import { useCallback, useEffect, useRef, useState } from "react";

export const STATUS = {
    idle: "idle",
    loading: "loading",
    success: "success",
    error: "error",
};

/**
 * Runs an async function and exposes an explicit status machine plus a
 * retry. Used by every page that reads from src/api.
 *
 * Two things this handles that a bare useEffect + useState does not:
 *  - A stale response from a superseded request can't overwrite newer data
 *    (guarded by a monotonically increasing run id).
 *  - State is never set after unmount.
 *
 * @param {Function} asyncFn receives { signal } for cancellation
 * @param {Array}    deps    re-runs when these change
 * @param {Object}   config  { immediate, initialData }
 */
const useAsync = (asyncFn, deps = [], config = {}) => {
    const { immediate = true, initialData = null } = config;

    const [data, setData] = useState(initialData);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(
        immediate ? STATUS.loading : STATUS.idle
    );

    const mountedRef = useRef(true);
    const runIdRef = useRef(0);
    const fnRef = useRef(asyncFn);
    fnRef.current = asyncFn;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const execute = useCallback(async () => {
        const runId = runIdRef.current + 1;
        runIdRef.current = runId;

        const controller = new AbortController();

        setStatus(STATUS.loading);
        setError(null);

        try {
            const result = await fnRef.current({ signal: controller.signal });
            // Ignore results from a request that has since been superseded.
            if (!mountedRef.current || runIdRef.current !== runId) return;
            setData(result);
            setStatus(STATUS.success);
        } catch (err) {
            if (!mountedRef.current || runIdRef.current !== runId) return;
            if (err?.code === "ABORTED") return;
            setError(err);
            setStatus(STATUS.error);
        }

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!immediate) return;
        execute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return {
        data,
        error,
        status,
        isIdle: status === STATUS.idle,
        isLoading: status === STATUS.loading,
        isSuccess: status === STATUS.success,
        isError: status === STATUS.error,
        retry: execute,
        run: execute,
        setData,
    };
};

export default useAsync;
