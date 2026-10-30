import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function shouldShowScrollToTop(scrollY: number, threshold = 350): boolean {
  return scrollY > threshold;
}

export function triggerScrollToTop(smooth = true): void {
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'instant',
    });
  }
}

interface ScrollToTopKnappProps {
  threshold?: number;
}

export const ScrollToTopKnapp: React.FC<ScrollToTopKnappProps> = ({ threshold = 350 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY ?? document.documentElement?.scrollTop ?? 0;
      setVisible(shouldShowScrollToTop(currentScroll, threshold));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => triggerScrollToTop(true)}
      data-testid="scroll-to-top-knapp"
      aria-label="Scrolla upp till toppen"
      title="Till toppen"
      className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40 flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-950 text-amber-400 hover:text-amber-300 border border-slate-700/80 shadow-xl backdrop-blur-xs transition-all active:scale-95 cursor-pointer text-sm font-semibold"
    >
      <ArrowUp className="w-5 h-5 shrink-0 stroke-[2.5]" aria-hidden="true" />
      <span className="hidden sm:inline">Till toppen</span>
      <span className="sm:hidden text-xs">Upp</span>
    </button>
  );
};
