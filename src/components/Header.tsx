const Header = () => {
  return (
    <header className="w-full bg-white border-b border-holidaze-border shadow-sm sticky top-0 z-[1000]">
      <div className="max-w-[1200px] mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <h1 className="text-2xl font-semibold text-holidaze-gray m-0 tracking-tight">
            Holidaze
          </h1>
          <nav className="flex gap-8 items-center">
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
        </div>
        <div className="flex items-center gap-4">
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
      </div>
    </header>
  );
};

export default Header;
