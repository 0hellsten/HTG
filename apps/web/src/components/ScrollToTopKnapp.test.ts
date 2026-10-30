import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shouldShowScrollToTop, triggerScrollToTop } from './ScrollToTopKnapp';

describe('ScrollToTopKnapp logik', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    globalThis.window = {
      ...originalWindow,
      scrollTo: vi.fn(),
    } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    vi.restoreAllMocks();
  });

  it('visar inte knappen när scrollY är 0 eller lägre än tröskelvärdet', () => {
    expect(shouldShowScrollToTop(0)).toBe(false);
    expect(shouldShowScrollToTop(100)).toBe(false);
    expect(shouldShowScrollToTop(350)).toBe(false);
  });

  it('visar knappen när scrollY överstiger standardtröskeln 350', () => {
    expect(shouldShowScrollToTop(351)).toBe(true);
    expect(shouldShowScrollToTop(1000)).toBe(true);
  });

  it('respekterar anpassat tröskelvärde', () => {
    expect(shouldShowScrollToTop(200, 200)).toBe(false);
    expect(shouldShowScrollToTop(201, 200)).toBe(true);
    expect(shouldShowScrollToTop(500, 600)).toBe(false);
  });

  it('anropar window.scrollTo med smooth behavior som standard', () => {
    triggerScrollToTop(true);
    expect(globalThis.window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('kan anropa window.scrollTo med instant behavior', () => {
    triggerScrollToTop(false);
    expect(globalThis.window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'instant',
    });
  });
});
