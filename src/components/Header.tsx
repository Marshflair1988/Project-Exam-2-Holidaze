import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-white border-b border-holidaze-border shadow-sm sticky top-0 z-[1000]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <h1 className="text-xl sm:text-2xl font-semibold text-holidaze-gray tracking-tight">
            Holidaze
          </h1>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a
              href="#"
              className="text-holidaze-gray no-underline text-[15px] font-normal hover:text-black transition-colors">
              Browse Venues
            </a>
            <a
              href="#"
              className="text-holidaze-gray no-underline text-[15px] font-normal hover:text-black transition-colors">
              Manage Venues
            </a>
            <a
              href="#"
              className="text-holidaze-gray no-underline text-[15px] font-normal hover:text-black transition-colors">
              My Bookings
            </a>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search for venues..."
                className="py-2.5 pr-9 pl-4 border border-holidaze-border rounded text-sm w-[200px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray"
              />
              <span className="absolute right-3 text-base text-holidaze-light-gray">
                🔍
              </span>
            </div>
            <button className="py-2.5 px-5 text-[15px] font-medium rounded cursor-pointer transition-all bg-white text-holidaze-gray border-none hover:bg-gray-100">
              Sign In
            </button>
            <button className="py-2.5 px-5 text-[15px] font-medium rounded cursor-pointer transition-all bg-white text-holidaze-gray border border-holidaze-gray hover:bg-gray-100">
              Register
            </button>
          </div>

          {/* Mobile Right Side - Sign In/Register + Hamburger */}
          <div className="flex lg:hidden items-center gap-2 sm:gap-3">
            <button className="py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded cursor-pointer transition-all bg-white text-holidaze-gray border-none hover:bg-gray-100 whitespace-nowrap">
              Sign In
            </button>
            <button className="py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded cursor-pointer transition-all bg-white text-holidaze-gray border border-holidaze-gray hover:bg-gray-100 whitespace-nowrap">
              Register
            </button>
            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="flex flex-col gap-1.5 p-2 focus:outline-none"
              aria-label="Toggle menu">
              <span
                className={`block h-0.5 w-6 bg-holidaze-gray transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}></span>
              <span
                className={`block h-0.5 w-6 bg-holidaze-gray transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}></span>
              <span
                className={`block h-0.5 w-6 bg-holidaze-gray transition-all duration-300 ${
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
          <div className="flex flex-col gap-4 pb-4 border-t border-holidaze-border mt-4 pt-4">
            <nav className="flex flex-col gap-4">
              <a
                href="#"
                onClick={() => setIsMenuOpen(false)}
                className="text-holidaze-gray no-underline text-base font-normal hover:text-black transition-colors py-2">
                Browse Venues
              </a>
              <a
                href="#"
                onClick={() => setIsMenuOpen(false)}
                className="text-holidaze-gray no-underline text-base font-normal hover:text-black transition-colors py-2">
                Manage Venues
              </a>
              <a
                href="#"
                onClick={() => setIsMenuOpen(false)}
                className="text-holidaze-gray no-underline text-base font-normal hover:text-black transition-colors py-2">
                My Bookings
              </a>
            </nav>
            <div className="relative flex items-center pt-2">
              <input
                type="text"
                placeholder="Search for venues..."
                className="py-2.5 pr-9 pl-4 border border-holidaze-border rounded text-sm w-full bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray"
              />
              <span className="absolute right-3 text-base text-holidaze-light-gray">
                🔍
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
