import { useEffect, useRef, useState } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const config = {
      threshold: 0.1,
      triggerOnce: true,
      ...options,
    };

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);

      if (entry.isIntersecting && config.triggerOnce) {
        observer.unobserve(element);
      }
    }, config);

    observer.observe(element);

    return () => {
      if (element && !config.triggerOnce) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.root, options.rootMargin, options.triggerOnce]);

  return [elementRef, isIntersecting];
};
