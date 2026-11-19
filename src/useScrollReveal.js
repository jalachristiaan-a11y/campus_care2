import { useEffect } from 'react';

export default function useScrollReveal(refreshKey, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const elements = document.querySelectorAll('[data-scroll-reveal]');
    if (!elements.length) return undefined;

    document.documentElement.classList.add('has-scroll-reveal');
    const revealVisibleElements = () => {
      elements.forEach((element) => {
        if (element.classList.contains('is-visible')) return;
        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight - 24 && bounds.bottom > 24) {
          element.classList.add('is-visible');
        }
      });
    };

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -24px 0px',
      });
      elements.forEach((element) => observer.observe(element));
    }

    window.addEventListener('scroll', revealVisibleElements, { passive: true });
    window.addEventListener('resize', revealVisibleElements);
    revealVisibleElements();

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', revealVisibleElements);
      window.removeEventListener('resize', revealVisibleElements);
    };
  }, [enabled, refreshKey]);
}
