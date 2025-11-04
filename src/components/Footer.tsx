const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-holidaze-border pt-8 sm:pt-12 lg:pt-[60px] px-4 sm:px-6 pb-6 mt-8 sm:mt-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 sm:gap-12 lg:gap-[60px] mb-8 sm:mb-10">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-holidaze-gray m-0 tracking-tight">
              Holidaze
            </h3>
            <p className="text-sm sm:text-[15px] text-holidaze-light-gray leading-relaxed m-0 max-w-[300px]">
              Your trusted partner for unique accommodation experiences
              worldwide.
            </p>
            <div className="flex gap-3 mt-2">
              <a
                href="www.facebook.com"
                className="w-8 h-8 rounded-full border border-holidaze-border flex items-center justify-center no-underline text-holidaze-gray text-sm font-medium transition-all hover:bg-gray-100 hover:border-holidaze-gray"
                aria-label="Facebook">
                f
              </a>
              <a
                href="www.x.com"
                className="w-8 h-8 rounded-full border border-holidaze-border flex items-center justify-center no-underline text-holidaze-gray text-sm font-medium transition-all hover:bg-gray-100 hover:border-holidaze-gray"
                aria-label="X">
                x
              </a>
              <a
                href="www.instagram.com"
                className="w-8 h-8 rounded-full border border-holidaze-border flex items-center justify-center no-underline text-holidaze-gray text-sm font-medium transition-all hover:bg-gray-100 hover:border-holidaze-gray"
                aria-label="Instagram">
                i
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <div className="flex flex-col gap-4">
              <h4 className="text-base font-semibold text-holidaze-gray m-0">
                For Guests
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    Browse Venues
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    My Bookings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    Cancellation Policy
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-base font-semibold text-holidaze-gray m-0">
                For Hosts
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    List Your Property
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    Manage Venues
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    Host Resources
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-base font-semibold text-holidaze-gray m-0">
                Company
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-holidaze-light-gray no-underline text-[15px] transition-colors hover:text-holidaze-gray">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center pt-6 border-t border-holidaze-border">
          <p className="text-sm text-holidaze-light-gray m-0">
            © 2023 Holidaze. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
