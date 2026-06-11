import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, UserButton, SignInButton } from '@clerk/clerk-react';
import { Menu, X, Wheat, LayoutDashboard, History, Phone } from 'lucide-react';
import { useConfig } from '../lib/useConfig.js';

export default function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const config = useConfig();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!event.target.closest('#mobile-menu') && !event.target.closest('#menu-btn')) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [open]);

  const links = [
    { to: '/', label: 'Products', labelBn: 'পণ্য', icon: <Wheat size={15} /> },
    ...(isSignedIn
      ? [
          { to: '/orders', label: 'My Orders', labelBn: 'আমার অর্ডার', icon: <History size={15} /> },
          { to: '/admin', label: 'Admin', labelBn: 'অ্যাডমিন', icon: <LayoutDashboard size={15} /> },
        ]
      : []),
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-green-800/60 bg-green-950/95 shadow-xl backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link to="/" className="group flex flex-shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-md transition-all group-hover:shadow-gold-400/40 sm:h-10 sm:w-10">
              <Wheat size={19} className="text-green-950" />
            </div>
            <div>
              <span className="block text-sm font-bold leading-none tracking-wide text-white sm:text-base">
                MS SUMA
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-400">
                TRADERS
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'border border-gold-500/30 bg-gold-500/20 text-gold-400'
                    : 'text-green-300 hover:bg-green-800/60 hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                <span className="hidden text-xs opacity-70 lg:inline">({link.labelBn})</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`tel:${config.phone}`}
              className="hidden items-center gap-1.5 text-xs text-green-400 transition-colors hover:text-green-300 sm:flex"
              title="Call for support"
            >
              <Phone size={14} />
              <span className="hidden lg:inline">{config.phone}</span>
            </a>

            {!isLoaded ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-green-800" />
            ) : isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      'w-8 h-8 sm:w-9 sm:h-9 ring-2 ring-gold-500/50 ring-offset-1 ring-offset-green-950',
                  },
                }}
              />
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <SignInButton mode="modal">
                  <button type="button" className="rounded-xl px-3 py-2 text-sm text-green-300 transition-all hover:bg-green-800/60 hover:text-white">
                    Sign In
                  </button>
                </SignInButton>
                <Link to="/sign-up" className="btn-primary px-4 py-2 text-sm">
                  Register
                </Link>
              </div>
            )}

            <button
              id="menu-btn"
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="rounded-xl p-2 text-green-300 transition-all hover:bg-green-800/60 hover:text-white md:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-b border-green-800/60 bg-green-950/98 pb-safe backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'text-green-300 hover:bg-green-800/60 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {link.icon}
                  {link.label}
                </span>
                <span className="text-xs text-green-500">{link.labelBn}</span>
              </Link>
            ))}

            {!isSignedIn && (
              <div className="flex gap-2 border-t border-green-800/40 pt-2">
                <Link to="/sign-in" className="btn-secondary flex-1 py-2.5 text-center text-sm">
                  Sign In
                </Link>
                <Link to="/sign-up" className="btn-primary flex-1 py-2.5 text-sm">
                  Register
                </Link>
              </div>
            )}

            <a
              href={`tel:${config.phone}`}
              className="flex items-center gap-2 px-4 py-3 text-sm text-green-400 transition-colors hover:text-gold-400"
            >
              <Phone size={15} />
              {config.phone}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
