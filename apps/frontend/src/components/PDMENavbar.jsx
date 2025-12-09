import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sun, Moon, Menu, X, ChevronDown, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useTheme } from '../context/ThemeContext';

function PDMENavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/about', label: 'About Us' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
        isScrolled 
          ? 'bg-background/80 backdrop-blur-lg border-white/5 shadow-lg py-3' 
          : 'bg-transparent py-5'
      )}
      style={isScrolled ? { backgroundColor: 'var(--navbar-bg)' } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-neon group-hover:scale-110 transition-transform">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-heading text-text-primary tracking-tight">
              PDME
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  clsx(
                    'text-sm font-medium transition-colors hover:text-primary relative py-1',
                    isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-neon"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* History Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary transition-colors py-1"
                onClick={() => setIsHistoryDropdownOpen(!isHistoryDropdownOpen)}
                onMouseEnter={() => setIsHistoryDropdownOpen(true)}
              >
                History
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              
              <AnimatePresence>
                {isHistoryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseLeave={() => setIsHistoryDropdownOpen(false)}
                    className="absolute top-full right-0 mt-2 w-48 bg-background-light/90 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden py-1"
                  >
                    <Link
                      to="/history/floods"
                      className="block px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-primary transition-colors"
                    >
                      Floods History
                    </Link>
                    {/* <Link
                      to="/history/earthquakes"
                      className="block px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-primary transition-colors"
                    >
                      Earthquake History
                    </Link> */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/5 text-text-secondary hover:text-primary transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background-light/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'block text-lg font-medium',
                      isActive ? 'text-primary' : 'text-text-secondary'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="pt-4 border-t border-white/10">
                <div className="text-sm font-medium text-gray-500 mb-2">History</div>
                <Link
                  to="/history/floods"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-gray-300 hover:text-primary"
                >
                  Floods History
                </Link>
                {/* <Link
                  to="/history/earthquakes"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-gray-300 hover:text-primary"
                >
                  Earthquake History
                </Link> */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default PDMENavbar;
