import React, { useEffect, useRef, useState } from 'react';

export type ScrollAnimationType =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'tilt-up'
  | 'flip-up';

export interface RevealOnScrollProps {
  children: React.ReactNode;
  animation?: ScrollAnimationType;
  delay?: number; // in milliseconds
  duration?: number; // in milliseconds
  threshold?: number;
  rootMargin?: string;
  className?: string;
  once?: boolean;
  style?: React.CSSProperties;
}

/**
 * High-performance hardware-accelerated scroll reveal component.
 * Uses IntersectionObserver with spring-like cubic-bezier physics.
 */
export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 750,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  className = '',
  once = true,
  style = {},
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Immediate fallback for testing environments, SSR, or missing browser API
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // Respect accessibility motion preferences
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const el = ref.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) {
        observer.unobserve(el);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  // Initial pre-scroll states
  const getInitialClasses = () => {
    switch (animation) {
      case 'fade-up':
        return 'opacity-0 translate-y-10 scale-[0.98]';
      case 'fade-down':
        return 'opacity-0 -translate-y-10 scale-[0.98]';
      case 'fade-left':
        return 'opacity-0 translate-x-12';
      case 'fade-right':
        return 'opacity-0 -translate-x-12';
      case 'zoom-in':
        return 'opacity-0 scale-[0.92] blur-[1px]';
      case 'tilt-up':
        return 'opacity-0 translate-y-12 -rotate-1 scale-[0.96]';
      case 'flip-up':
        return 'opacity-0 [transform:perspective(1000px)_rotateX(18deg)_translateY(24px)]';
      default:
        return 'opacity-0 translate-y-10';
    }
  };

  // Active revealed state
  const getActiveClasses = () => {
    return 'opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0 blur-0 [transform:perspective(1000px)_rotateX(0deg)_translateY(0)]';
  };

  return (
    <div
      ref={ref}
      className={`transform-gpu transition-all ${
        isVisible ? getActiveClasses() : getInitialClasses()
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: isVisible ? 'auto' : 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number; // ms offset between child elements
  initialDelay?: number; // base delay ms
  animation?: ScrollAnimationType;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  once?: boolean;
}

/**
 * Automatically cascades scroll reveal across all direct child elements
 * with progressive staggered timing.
 */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 90,
  initialDelay = 0,
  animation = 'fade-up',
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  className = '',
  once = true,
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childArray.map((child, idx) => (
        <RevealOnScroll
          key={idx}
          animation={animation}
          delay={initialDelay + idx * staggerDelay}
          threshold={threshold}
          rootMargin={rootMargin}
          once={once}
          className="h-full"
        >
          {child}
        </RevealOnScroll>
      ))}
    </div>
  );
};
