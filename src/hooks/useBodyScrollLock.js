import { useEffect } from "react";

/**
 * Locks page scroll while an overlay is open.
 *
 * Compensates for the scrollbar width so locking doesn't cause the layout
 * behind the overlay to jump sideways, and counts nested locks so closing
 * one overlay while another is still open doesn't release the lock early.
 */
let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

const useBodyScrollLock = (active) => {
    useEffect(() => {
        if (!active) return undefined;

        if (lockCount === 0) {
            const { body } = document;
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;

            savedOverflow = body.style.overflow;
            savedPaddingRight = body.style.paddingRight;

            body.style.overflow = "hidden";
            if (scrollbarWidth > 0) {
                body.style.paddingRight = `${scrollbarWidth}px`;
            }
        }
        lockCount += 1;

        return () => {
            lockCount -= 1;
            if (lockCount === 0) {
                document.body.style.overflow = savedOverflow;
                document.body.style.paddingRight = savedPaddingRight;
            }
        };
    }, [active]);
};

export default useBodyScrollLock;
