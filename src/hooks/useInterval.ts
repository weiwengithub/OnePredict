import { useRef, useEffect } from "react";

export function useInterval(callback: () => void, delay: number, immediate: boolean = false) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (immediate) {
            callback();
        }
    }, [immediate]);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            callback();
        }, delay);
        return () => clearInterval(timerRef.current as NodeJS.Timeout);
    }, [callback, delay]);
}