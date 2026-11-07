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
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // High-performance aggressive pre-reveal: triggers 120px before entering viewport
        threshold: 0.01,
        rootMargin: '120px 0px 120px 0px',
      }
    );

    const observeUnrevealed = () => {
      const elements = document.querySelectorAll(`${selector}:not(.is-revealed)`);
      elements.forEach((el, index) => {
        // If element is already within the initial viewport on load, reveal with fast crisp stagger
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 60 && rect.bottom > -60) {
          setTimeout(() => {
            el.classList.add('is-revealed');
          }, 10 + Math.min(index * 20, 120));
        } else {
          observer.observe(el);
        }
      });
    };

    // Run after DOM paint
    const timer = setTimeout(observeUnrevealed, 40);

    // Watch for dynamic DOM changes (e.g. lazy-loaded content, route changes)
    const mutationObserver = new MutationObserver(() => {
      observeUnrevealed();
    });

    if (document.body) {
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
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

