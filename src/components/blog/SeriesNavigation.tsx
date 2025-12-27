'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define the series - order matters (left = previous, right = next)
const PROJECTION_SERIES = [
  '/blog/quantum-mechanics-without-math',
  '/blog/quantum-gravity-without-the-paradox',
  '/blog/time-from-dimensions',
];

export default function SeriesNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentIndex = PROJECTION_SERIES.indexOf(pathname);

    // Only activate if we're in this series
    if (currentIndex === -1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Calculate scroll percentage before navigating
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        const prevPath = PROJECTION_SERIES[currentIndex - 1];
        sessionStorage.setItem('seriesScrollPercent', scrollPercent.toString());
        router.push(prevPath);
      } else if (e.key === 'ArrowRight' && currentIndex < PROJECTION_SERIES.length - 1) {
        e.preventDefault();
        const nextPath = PROJECTION_SERIES[currentIndex + 1];
        sessionStorage.setItem('seriesScrollPercent', scrollPercent.toString());
        router.push(nextPath);
      }
    };

    // Restore scroll position if coming from series navigation
    const savedPercent = sessionStorage.getItem('seriesScrollPercent');
    if (savedPercent) {
      sessionStorage.removeItem('seriesScrollPercent');
      // Wait for content to render
      requestAnimationFrame(() => {
        const targetScroll = parseFloat(savedPercent) * (document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo(0, targetScroll);
      });
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname, router]);

  // Don't render anything - this is just for keyboard handling
  return null;
}
