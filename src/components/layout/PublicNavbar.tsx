import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Our Story', href: '/our-story' },
    { label: 'Menu', href: '/menu' },
    { label: 'Experience', href: '/experience' },
    { label: 'Chef', href: '/chef' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Private Dining', href: '/private-dining' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0D0D0E]/95 backdrop-blur-md border-b border-white/10 shadow-lg py-3.5'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="font-serif text-2xl sm:text-3xl tracking-[0.2em] uppercase text-white hover:text-[#C5A880] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A880]"
        >
          Aurelia
        </Link>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-sans uppercase tracking-[0.18em]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`transition-colors py-1 relative ${
                isActive(link.href)
                  ? 'text-[#C5A880] font-medium'
                  : 'text-[#D1CCC0] hover:text-white'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C5A880]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/reservations"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-sans font-medium uppercase tracking-[0.2em] bg-[#C5A880] text-[#0D0D0E] hover:bg-[#E0CEB5] transition-all duration-200 border border-[#C5A880] shadow-sm whitespace-nowrap"
          >
            Reserve Table
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 text-[#F6F4EE] hover:text-[#C5A880] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A880]"
            aria-label={isMobileOpen ? 'Close Navigation' : 'Open Navigation'}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 top-[65px] bg-[#0D0D0E] border-t border-white/10 z-50 flex flex-col justify-between p-6 sm:p-8">
          <nav className="flex flex-col gap-5 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-lg font-serif tracking-widest uppercase py-2 border-b border-white/5 transition-colors ${
                  isActive(link.href) ? 'text-[#C5A880]' : 'text-[#F6F4EE] hover:text-[#C5A880]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <Link
              to="/reservations"
              className="w-full flex items-center justify-center py-3.5 text-xs font-sans font-semibold uppercase tracking-[0.2em] bg-[#C5A880] text-[#0D0D0E] hover:bg-[#E0CEB5] transition-colors"
            >
              Reserve Table
            </Link>
            <div className="text-center text-xs text-[#D1CCC0] space-y-1">
              <p>442 Mayfair Boulevard, Upper East Side, NY</p>
              <p className="text-[#C5A880]">+1 (212) 555-0198</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
