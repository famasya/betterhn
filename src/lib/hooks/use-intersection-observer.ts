import { useCallback, useRef } from "react";

type UseIntersectionObserverOptions = {
	threshold?: number;
	rootMargin?: string;
	onIntersect: () => void;
};

export function useIntersectionObserver({
	threshold = 0.1,
	rootMargin = "100px",
	onIntersect,
}: UseIntersectionObserverOptions) {
	const observer = useRef<IntersectionObserver | null>(null);

	const elementRef = useCallback(
		(node: HTMLElement | null) => {
			if (observer.current) {
				observer.current.disconnect();
			}

			if (node) {
				observer.current = new IntersectionObserver(
					([entry]) => {
						if (entry.isIntersecting) {
							onIntersect();
						}
					},
					{
						threshold,
						rootMargin,
					}
				);

				observer.current.observe(node);
			}
		},
		[threshold, rootMargin, onIntersect]
	);

	return elementRef;
}
