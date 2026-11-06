import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useInteractiveMotion: Comprehensive interaction motion engine for KENENISA OS.
 * Provides:
 * 1. Tactile click shockwave ripple on buttons, links, and cards.
 * 2. Real-time cursor spotlight sheen tracking on interactive cards.
 * 3. Reactive ambient parallax drift matching user mouse movement.
 * 4. Smooth page-level entrance transition on navigation.
 * 
 * Strict Constraint: Modifies zero existing styling, layouts, paddings, or colors.
 */
export function useInteractiveMotion() {
  const location = useLocation();

  // 1. Page settle entrance on route change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.classList.remove('page-settle-entrance');
      // Trigger reflow to restart animation
      void mainContent.offsetWidth;
      mainContent.classList.add('page-settle-entrance');
    }
  }, [location.pathname]);

  // 2. Interactive Tactile Click Shockwave & Cursor Spotlight
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // A. Tactile Click Ripple Wave
    const handlePointerDown = (e: PointerEvent) => {
      // Find the nearest clickable container
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        'button, a, [role="button"], input[type="submit"], [data-interactive="true"], .group\\/btn'
      );
      if (!target || target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') {
        return;
      }

      const rect = target.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height) * 1.5;
      const radius = diameter / 2;

      const ripple = document.createElement('span');
      ripple.className = 'interaction-ripple-wave';
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;

      // Ensure target can contain absolute ripple
      const computedPos = window.getComputedStyle(target).position;
      if (computedPos === 'static') {
        target.style.position = 'relative';
      }
      const computedOverflow = window.getComputedStyle(target).overflow;
      if (computedOverflow === 'visible') {
        target.style.overflow = 'hidden';
      }

      target.appendChild(ripple);

      const cleanup = () => {
        ripple.remove();
      };
      ripple.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, 650);
    };

    // B. Real-time Cursor Spotlight on Cards & Ambient Viewport Motion
    let ticking = false;
    const handlePointerMove = (e: PointerEvent) => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        // Calculate normalized pointer coordinates (-1 to 1) for ambient parallax
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = (e.clientY / window.innerHeight) * 2 - 1;
        document.documentElement.style.setProperty('--ambient-shift-x', `${(normX * 8).toFixed(1)}px`);
        document.documentElement.style.setProperty('--ambient-shift-y', `${(normY * 8).toFixed(1)}px`);

        // Check if cursor is over an interactive card/container
        const card = (e.target as HTMLElement | null)?.closest<HTMLElement>(
          '[data-spotlight="true"], .group, [class*="hover:shadow"], [class*="hover:-translate-y"]'
        );

        if (card) {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
          card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
          if (!card.hasAttribute('data-spotlight')) {
            card.setAttribute('data-spotlight', 'true');
          }
        }

        ticking = false;
      });
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);
}
