import { useEffect, useState } from 'react';
import gsap from 'gsap';

export const usePrefersReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

export const useEntranceAnimation = (
  ref: React.RefObject<HTMLElement>,
  options?: gsap.TweenVars
) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', ...options }
    );
  }, [ref, prefersReducedMotion, options]);
};

export const useStaggerAnimation = (
  selector: string,
  containerRef: React.RefObject<HTMLElement>,
  options?: gsap.TweenVars
) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const elements = containerRef.current.querySelectorAll(selector);
    gsap.fromTo(
      elements,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        ...options
      }
    );
  }, [selector, containerRef, prefersReducedMotion, options]);
};
