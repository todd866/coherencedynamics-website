'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Site navigation order (loops)
const PAGES = ['/', '/papers', '/simulations', '/about'];

export default function SiteNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Skip if on a sub-page (like /papers/[slug])
      const currentIndex = PAGES.indexOf(pathname);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowLeft') {
        const prevIndex = currentIndex === 0 ? PAGES.length - 1 : currentIndex - 1;
        router.push(PAGES[prevIndex]);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = currentIndex === PAGES.length - 1 ? 0 : currentIndex + 1;
        router.push(PAGES[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname, router]);

  return null;
}
