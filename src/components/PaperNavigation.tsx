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
    <nav className="border-t border-gray-800 pt-8 mt-8">
      <div className="flex justify-between items-stretch gap-4">
        {prev ? (
          <Link
            href={`/papers/${prev.slug}`}
            className="group flex-1 flex items-center gap-3 p-4 rounded-lg border border-gray-700 hover:border-gray-500 hover:bg-gray-900/50 transition-all"
          >
            <span
              className={`text-3xl text-gray-500 group-hover:text-white group-hover:-translate-x-2 transition-all duration-300 ${
                showPulse ? 'animate-bounce-left' : ''
              }`}
            >
              ←
            </span>
            <div className="text-left min-w-0">
              <div className="text-xs text-gray-500 mb-1">Previous</div>
              <div className="text-sm text-gray-300 group-hover:text-white line-clamp-2 transition-colors">{prev.title}</div>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {next ? (
          <Link
            href={`/papers/${next.slug}`}
            className="group flex-1 flex items-center justify-end gap-3 p-4 rounded-lg border border-gray-700 hover:border-gray-500 hover:bg-gray-900/50 transition-all text-right"
          >
            <div className="min-w-0">
              <div className="text-xs text-gray-500 mb-1">Next</div>
              <div className="text-sm text-gray-300 group-hover:text-white line-clamp-2 transition-colors">{next.title}</div>
            </div>
            <span
              className={`text-3xl text-gray-500 group-hover:text-white group-hover:translate-x-2 transition-all duration-300 ${
                showPulse ? 'animate-bounce-right' : ''
              }`}
            >
              →
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-gray-600 mt-4">
        Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400 font-mono">←</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400 font-mono">→</kbd> to navigate between papers
      </p>

      {/* CSS for bounce animations */}
      <style jsx>{`
        @keyframes bounce-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-6px); }
        }
        @keyframes bounce-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        .animate-bounce-left {
          animation: bounce-left 0.6s ease-in-out infinite;
        }
        .animate-bounce-right {
          animation: bounce-right 0.6s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
}
