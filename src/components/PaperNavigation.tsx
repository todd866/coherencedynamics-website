'use client';

import { useEffect } from 'react';
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
    <nav className="flex justify-between items-center border-t border-gray-800 pt-8 mt-8">
      {prev ? (
        <Link
          href={`/papers/${prev.slug}`}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors max-w-[45%]"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
          <div className="text-left">
            <div className="text-xs text-gray-500 mb-1">Previous</div>
            <div className="text-sm line-clamp-2">{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/papers/${next.slug}`}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors max-w-[45%] text-right"
        >
          <div>
            <div className="text-xs text-gray-500 mb-1">Next</div>
            <div className="text-sm line-clamp-2">{next.title}</div>
          </div>
          <span className="text-xl group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
