import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.9,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
            infinite: false,
            syncTouch: false,
        });

        // 1. Function to instantly snap Lenis to the top
        const handleScrollToTop = () => {
            lenis.scrollTo(0, { immediate: true });
        };

        // 2. Listen to browser navigation history changes natively
        window.addEventListener("popstate", handleScrollToTop);

        // 3. Patch the standard history pushState to catch programmatic route clicks
        const originalPushState = history.pushState;
        history.pushState = function (...args) {
            const result = originalPushState.apply(this, args);
            handleScrollToTop(); // Trigger scroll up when a new page is pushed
            return result;
        };

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            cancelAnimationFrame(rafId);
            window.removeEventListener("popstate", handleScrollToTop);
            history.pushState = originalPushState; // Restore native behavior on cleanup
        };
    }, []);

    return <>{children}</>;
}
