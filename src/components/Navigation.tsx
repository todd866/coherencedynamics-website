'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/papers', label: 'Research' },
  { href: '/simulations', label: 'Simulations' },
  { href: '/fiction', label: 'Fiction' },
  { href: '/about', label: 'About' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-800">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-base sm:text-xl font-bold tracking-tight text-white">
              <span className="sm:hidden">CD</span>
              <span className="hidden sm:inline">Coherence Dynamics</span>
            </Link>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-6 lg:space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
