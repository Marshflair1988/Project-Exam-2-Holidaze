import { useState } from 'react';
import UserRegisterModal from './UserRegisterModal';
import VenueManagerRegisterModal from './VenueManagerRegisterModal';
import LoginModal from './LoginModal';

const JoinSection = () => {
  const [isUserRegisterOpen, setIsUserRegisterOpen] = useState(false);
  const [isVenueManagerRegisterOpen, setIsVenueManagerRegisterOpen] =
    useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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
    <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#e5e7eb4c]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10 sm:mb-12 lg:mb-[60px]">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-holidaze-gray m-0 tracking-tight">
            Join Holidaze
          </h2>
          <p className="text-base sm:text-lg text-holidaze-light-gray mt-2 sm:mt-3">
            Whether you're looking to book or host, we have you covered!
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          <div className="bg-white border border-holidaze-border rounded-lg p-6 sm:p-8 lg:p-10 flex flex-col items-center text-center gap-4 sm:gap-6">
            <div className="w-20 h-20 rounded-full border-2 border-holidaze-border flex items-center justify-center bg-white">
              <span className="text-[32px]">👤</span>
            </div>
            <h3 className="text-2xl font-semibold text-holidaze-gray m-0">
              For Travelers
            </h3>
            <p className="text-base text-holidaze-light-gray leading-relaxed m-0">
              Browse thousands of unique venues, read reviews, and book your
              perfect stay with ease.
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-3 w-full items-start">
              <li className="flex items-center gap-3 text-[15px] text-holidaze-gray">
                <span className="text-black font-bold text-lg">✓</span>
                Search and filter venues
              </li>
              <li className="flex items-center gap-3 text-[15px] text-holidaze-gray">
                <span className="text-black font-bold text-lg">✓</span>
                View availability calendar
              </li>
              <li className="flex items-center gap-3 text-[15px] text-holidaze-gray">
                <span className="text-black font-bold text-lg">✓</span>
                Manage bookings
              </li>
            </ul>
            <button
              onClick={() => setIsUserRegisterOpen(true)}
              className="py-3 sm:py-3.5 px-6 sm:px-8 text-sm sm:text-base font-medium rounded cursor-pointer transition-all border-none w-full mt-2 bg-[#0369a1] text-white hover:opacity-90">
              Sign Up as a Traveler
            </button>
          </div>
          <div className="bg-white border border-holidaze-border rounded-lg p-6 sm:p-8 lg:p-10 flex flex-col items-center text-center gap-4 sm:gap-6">
            <div className="w-20 h-20 rounded-full border-2 border-holidaze-border flex items-center justify-center bg-white">
              <span className="text-[32px]">🏢</span>
            </div>
            <h3 className="text-2xl font-semibold text-holidaze-gray m-0">
              For Venue Managers
            </h3>
            <p className="text-base text-holidaze-light-gray leading-relaxed m-0">
              List your properties, manage bookings, and connect with travelers
              from around the world.
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-3 w-full items-start">
              <li className="flex items-center gap-3 text-[15px] text-holidaze-gray">
                <span className="text-black font-bold text-lg">✓</span>
                Create and manage venues
              </li>
              <li className="flex items-center gap-3 text-[15px] text-holidaze-gray">
                <span className="text-black font-bold text-lg">✓</span>
                Track bookings and revenue
              </li>
              <li className="flex items-center gap-3 text-[15px] text-holidaze-gray">
                <span className="text-black font-bold text-lg">✓</span>
                Update availability
              </li>
            </ul>
            <button
              onClick={() => setIsVenueManagerRegisterOpen(true)}
              className="py-3 sm:py-3.5 px-6 sm:px-8 text-sm sm:text-base font-medium rounded cursor-pointer transition-all w-full mt-2 bg-white text-holidaze-gray border border-holidaze-gray hover:bg-gray-100">
              Sign Up as Venue Manager
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserRegisterModal
        isOpen={isUserRegisterOpen}
        onClose={() => setIsUserRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
        onSwitchToVenueManager={() => {
          setIsUserRegisterOpen(false);
          setIsVenueManagerRegisterOpen(true);
        }}
      />
      <VenueManagerRegisterModal
        isOpen={isVenueManagerRegisterOpen}
        onClose={() => setIsVenueManagerRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
        onSwitchToUser={() => {
          setIsVenueManagerRegisterOpen(false);
          setIsUserRegisterOpen(true);
        }}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={switchToUserRegister}
      />
    </section>
  );
};

export default JoinSection;
