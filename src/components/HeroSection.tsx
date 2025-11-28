import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VenueManagerRegisterModal from './VenueManagerRegisterModal';
import LoginModal from './LoginModal';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isVenueManagerRegisterOpen, setIsVenueManagerRegisterOpen] =
    useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const switchToVenueManagerRegister = () => {
    setIsLoginOpen(false);
    setIsVenueManagerRegisterOpen(true);
  };

  const switchToLogin = () => {
    setIsVenueManagerRegisterOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-[60px] items-center">
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 w-full lg:w-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-holidaze-gray leading-tight m-0 tracking-[-1px]">
            Find Your Perfect Stay
          </h1>
          <p className="text-base sm:text-lg text-holidaze-gray leading-relaxed m-0 max-w-[540px]">
            Discover unique accommodations around the world. From cozy
            apartments to luxury villas, book your next adventure with Holidaze.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <button
              onClick={() => navigate('/venues')}
              className="py-3 sm:py-3.5 px-6 sm:px-8 text-sm sm:text-base font-medium rounded cursor-pointer transition-all bg-[#0369a1] text-white border-none hover:opacity-90 w-full sm:w-auto text-center">
              Browse Venues
            </button>
            <button
              onClick={() => setIsVenueManagerRegisterOpen(true)}
              className="py-3 sm:py-3.5 px-6 sm:px-8 text-sm sm:text-base font-medium rounded cursor-pointer transition-all bg-white text-holidaze-gray border border-holidaze-gray hover:bg-gray-100 w-full sm:w-auto text-center">
              Become a Host
            </button>
          </div>
        </div>
        <div className="flex-1 w-full lg:max-w-[50%]">
          <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop"
              alt="Luxury overwater bungalows with turquoise water"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <VenueManagerRegisterModal
        isOpen={isVenueManagerRegisterOpen}
        onClose={() => setIsVenueManagerRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={switchToVenueManagerRegister}
      />
    </section>
  );
};

export default HeroSection;
