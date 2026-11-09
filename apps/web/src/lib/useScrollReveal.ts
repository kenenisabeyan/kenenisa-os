import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollReveal: High-performance scroll-triggered reveal animation engine.
 * Automatically observes DOM elements with .scroll-reveal, .scroll-reveal-left,
 * .scroll-reveal-right, or .scroll-reveal-scale, smoothly activating them when
 * scrolled into view with GPU-accelerated cubic-bezier transitions.
 */
export function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const selector = '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale';

    // If IntersectionObserver is not supported or user prefers reduced motion, reveal everything immediately
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(selector).forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        }
      },
      {
        // High-performance aggressive pre-reveal: triggers 240px before entering viewport for instant zero-lag display
        threshold: 0.01,
        rootMargin: '240px 0px 240px 0px',
      }
    );

    const observeUnrevealed = () => {
      const elements = document.querySelectorAll(`${selector}:not(.is-revealed)`);
      const viewportCeiling = window.innerHeight * 1.5;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const rect = el.getBoundingClientRect();

        // Immediately reveal hero and the immediate next section so initial scroll is 100% fluid
        if (rect.top <= viewportCeiling) {
          el.classList.add('is-revealed');
        } else {
          observer.observe(el);
        }
      }
    };

    // Run on initial paint via RAF for zero layout thrashing
    const rafId = requestAnimationFrame(observeUnrevealed);

    // Watch for newly mounted DOM nodes (e.g. lazy-loaded content or tab switches) without monitoring class attributes
    let mutationRaf: number | null = null;
    const mutationObserver = new MutationObserver((mutations) => {
      let hasNewNodes = false;
      for (let i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length > 0) {
          hasNewNodes = true;
          break;
        }
      }
      if (hasNewNodes) {
        if (mutationRaf) cancelAnimationFrame(mutationRaf);
        mutationRaf = requestAnimationFrame(observeUnrevealed);
      }
    });

    if (document.body) {
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (mutationRaf) cancelAnimationFrame(mutationRaf);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);
}

/**
 * useScrollPosition: Returns live scroll metrics for scroll-driven parallax movements.
 */
export function useScrollPosition() {
  const [position, setPosition] = useState({
    scrollY: 0,
    scrollProgress: 0,
    scrollDirection: 'down' as 'down' | 'up',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = totalHeight > 0 ? Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100)) : 0;
          const direction = currentScrollY > lastScrollY ? 'down' : 'up';

          setPosition({
            scrollY: currentScrollY,
            scrollProgress: progress,
            scrollDirection: direction,
          });

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

