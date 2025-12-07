import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import UserRegisterModal from './UserRegisterModal';
import VenueManagerRegisterModal from './VenueManagerRegisterModal';
import {
  getAccessToken,
  getUserData,
  removeAccessToken,
  removeUserData,
} from '../services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserRegisterOpen, setIsUserRegisterOpen] = useState(false);
  const [isVenueManagerRegisterOpen, setIsVenueManagerRegisterOpen] =
    useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: { url: string; alt?: string };
    venueManager?: boolean;
  } | null>(null);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessToken();
      const userData = getUserData();
      if (token && userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    };

    checkAuth();
    // Check auth state periodically (in case it changes in another tab)
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    removeAccessToken();
    removeUserData();
    setUser(null);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const switchToUserRegister = () => {
    setIsLoginOpen(false);
    setIsUserRegisterOpen(true);
  };

  const switchToLogin = () => {
    setIsUserRegisterOpen(false);
    setIsVenueManagerRegisterOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-white focus:text-[#0369a1] focus:rounded focus:font-medium focus:shadow-lg">
        Skip to main content
      </a>
      <header className="w-full border-b border-white/20 shadow-sm sticky top-0 z-[1000] bg-[#0369a1]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl sm:text-2xl font-semibold text-white tracking-tight no-underline hover:text-gray-100 transition-colors">
            Holidaze
          </Link>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Navigation Links */}
            <nav aria-label="Main navigation" className="flex items-center gap-6">
              <Link
                to="/"
                className="text-white no-underline text-[15px] font-normal hover:text-gray-100 transition-colors">
                Home
              </Link>
              <Link
                to="/venues"
                className="text-white no-underline text-[15px] font-normal hover:text-gray-100 transition-colors">
                Browse Venues
              </Link>
              {user && user.venueManager && (
                <Link
                  to="/venue-manager/dashboard"
                  className="text-white no-underline text-[15px] font-normal hover:text-gray-100 transition-colors">
                  Manage Venues
                </Link>
              )}
              {user && !user.venueManager && (
                <Link
                  to="/user/profile"
                  className="text-white no-underline text-[15px] font-normal hover:text-gray-100 transition-colors">
                  My Bookings
                </Link>
              )}
            </nav>
            {user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label={`${user.name} menu`}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-3 py-2 px-3 rounded cursor-pointer transition-all hover:bg-white/20">
                  <img
                    src={
                      user.avatar?.url ||
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop'
                    }
                    alt={user.avatar?.alt || user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  />
                  <span className="text-[15px] font-medium text-white">
                    {user.name}
                  </span>
                </button>
                {isUserMenuOpen && (
                  <div 
                    role="menu"
                    aria-label="User account menu"
                    className="absolute right-0 mt-2 w-48 bg-white border border-holidaze-border rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <Link
                        to={
                          user.venueManager
                            ? '/venue-manager/dashboard'
                            : '/user/profile'
                        }
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-holidaze-gray hover:bg-gray-100 no-underline">
                        {user.venueManager ? 'Dashboard' : 'My Profile'}
                      </Link>
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        aria-label="Log out of your account"
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="py-2.5 px-5 text-[15px] font-medium rounded cursor-pointer transition-all bg-white text-[#0369a1] border-none hover:bg-gray-100">
                  Sign In
                </button>
                <button
                  onClick={() => setIsUserRegisterOpen(true)}
                  className="py-2.5 px-5 text-[15px] font-medium rounded cursor-pointer transition-all bg-white text-[#0369a1] border border-white hover:bg-gray-100">
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Right Side - User Menu or Sign In/Register + Hamburger */}
          <div className="flex lg:hidden items-center gap-2 sm:gap-3">
            {user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 py-2 px-3 rounded cursor-pointer transition-all hover:bg-white/20">
                  <img
                    src={
                      user.avatar?.url ||
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop'
                    }
                    alt={user.avatar?.alt || user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  />
                  <span className="text-xs sm:text-sm font-medium text-white">
                    {user.name}
                  </span>
                </button>
                {isUserMenuOpen && (
                  <div 
                    role="menu"
                    aria-label="User account menu"
                    className="absolute right-0 mt-2 w-48 bg-white border border-holidaze-border rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <Link
                        to={
                          user.venueManager
                            ? '/venue-manager/dashboard'
                            : '/user/profile'
                        }
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-holidaze-gray hover:bg-gray-100 no-underline">
                        {user.venueManager ? 'Dashboard' : 'My Profile'}
                      </Link>
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        aria-label="Log out of your account"
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded cursor-pointer transition-all bg-white text-[#0369a1] border-none hover:bg-gray-100 whitespace-nowrap">
                  Sign In
                </button>
                <button
                  onClick={() => setIsUserRegisterOpen(true)}
                  className="py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded cursor-pointer transition-all bg-white text-[#0369a1] border border-white hover:bg-gray-100 whitespace-nowrap">
                  Register
                </button>
              </>
            )}
            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="flex flex-col gap-1.5 p-2 focus:outline-none"
              aria-label="Toggle menu">
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}></span>
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}></span>
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}>
          <div className="flex flex-col gap-4 pb-4 border-t border-white/20 mt-4 pt-4">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-white no-underline text-base font-normal hover:text-gray-100 transition-colors py-2">
                Home
              </Link>
              <Link
                to="/venues"
                onClick={() => setIsMenuOpen(false)}
                className="text-white no-underline text-base font-normal hover:text-gray-100 transition-colors py-2">
                Browse Venues
              </Link>
              {user && user.venueManager && (
                <Link
                  to="/venue-manager/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white no-underline text-base font-normal hover:text-gray-100 transition-colors py-2">
                  Manage Venues
                </Link>
              )}
              {user && !user.venueManager && (
                <Link
                  to="/user/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white no-underline text-base font-normal hover:text-gray-100 transition-colors py-2">
                  My Bookings
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          // Refresh user state after login
          const token = getAccessToken();
          const userData = getUserData();
          if (token && userData) {
            setUser(userData);
          }
        }}
        onSwitchToRegister={switchToUserRegister}
      />
      <UserRegisterModal
        isOpen={isUserRegisterOpen}
        onClose={() => {
          setIsUserRegisterOpen(false);
          // Refresh user state after registration
          const token = getAccessToken();
          const userData = getUserData();
          if (token && userData) {
            setUser(userData);
          }
        }}
        onSwitchToLogin={switchToLogin}
        onSwitchToVenueManager={() => {
          setIsUserRegisterOpen(false);
          setIsVenueManagerRegisterOpen(true);
        }}
      />
      <VenueManagerRegisterModal
        isOpen={isVenueManagerRegisterOpen}
        onClose={() => {
          setIsVenueManagerRegisterOpen(false);
          // Refresh user state after registration
          const token = getAccessToken();
          const userData = getUserData();
          if (token && userData) {
            setUser(userData);
          }
        }}
        onSwitchToLogin={switchToLogin}
        onSwitchToUser={() => {
          setIsVenueManagerRegisterOpen(false);
          setIsUserRegisterOpen(true);
        }}
      />
    </header>
    </>
  );
};

export default Header;
