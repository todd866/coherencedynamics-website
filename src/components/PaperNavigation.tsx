'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PaperInfo {
  slug: string;
  title: string;
}

interface PaperNavigationProps {
  prev: PaperInfo | null;
  next: PaperInfo | null;
}

export default function PaperNavigation({ prev, next }: PaperNavigationProps) {
  const router = useRouter();
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    // Stop the pulse animation after 3 seconds
    const timer = setTimeout(() => setShowPulse(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && prev) {
        router.push(`/papers/${prev.slug}`);
      } else if (e.key === 'ArrowRight' && next) {
        router.push(`/papers/${next.slug}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prev, next, router]);

  return (
    <>
      {/* Fixed side navigation tabs */}
      {prev && (
        <Link
          href={`/papers/${prev.slug}`}
          className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 group hidden md:flex items-center justify-center w-8 h-16 bg-gray-800 border-y border-r border-gray-700 hover:bg-gray-700 hover:w-10 transition-all rounded-r-md ${
            showPulse ? 'animate-pulse-subtle' : ''
          }`}
          title={prev.title}
        >
          <span className="text-lg text-gray-400 group-hover:text-white transition-colors">
            ←
          </span>
        </Link>
      )}

      {next && (
        <Link
          href={`/papers/${next.slug}`}
          className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 group hidden md:flex items-center justify-center w-8 h-16 bg-gray-800 border-y border-l border-gray-700 hover:bg-gray-700 hover:w-10 transition-all rounded-l-md ${
            showPulse ? 'animate-pulse-subtle' : ''
          }`}
          title={next.title}
        >
          <span className="text-lg text-gray-400 group-hover:text-white transition-colors">
            →
          </span>
        </Link>
      )}

      {/* Mobile: fixed bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 border-t border-gray-800 backdrop-blur-sm">
        <div className="flex justify-between items-center px-4 py-3">
          {prev ? (
            <Link
              href={`/papers/${prev.slug}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="text-sm truncate max-w-[120px]">Prev</span>
            </Link>
          ) : (
            <div />
          )}

          <span className="text-xs text-gray-600">← →</span>

          {next ? (
            <Link
              href={`/papers/${next.slug}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-sm truncate max-w-[120px]">Next</span>
              <span>→</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </nav>

      {/* Desktop: bottom "What's next" section */}
      {(prev || next) && (
        <nav className="hidden md:block border-t border-gray-800 pt-8 mt-12">
          <h3 className="text-sm text-gray-500 mb-4">Continue reading</h3>
          <div className="flex justify-between gap-8">
            {prev ? (
              <Link
                href={`/papers/${prev.slug}`}
                className="group flex-1 p-4 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all"
              >
                <div className="text-xs text-gray-500 mb-1">← Previous</div>
                <div className="text-sm text-gray-300 group-hover:text-white transition-colors line-clamp-2">{prev.title}</div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {next ? (
              <Link
                href={`/papers/${next.slug}`}
                className="group flex-1 p-4 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all text-right"
              >
                <div className="text-xs text-gray-500 mb-1">Next →</div>
                <div className="text-sm text-gray-300 group-hover:text-white transition-colors line-clamp-2">{next.title}</div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </nav>
      )}

      {/* Spacer for mobile bottom bar */}
      <div className="md:hidden h-16" />
    </>
  );
}
