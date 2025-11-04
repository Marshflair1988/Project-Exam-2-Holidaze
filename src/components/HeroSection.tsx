const HeroSection = () => {
  return (
    <section className="w-full py-20 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto flex gap-[60px] items-center">
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-5xl font-bold text-holidaze-gray leading-tight m-0 tracking-[-1px]">
            Find Your Perfect Stay
          </h2>
          <p className="text-lg text-holidaze-gray leading-relaxed m-0 max-w-[540px]">
            Discover unique accommodations around the world. From cozy
            apartments to luxury villas, book your next adventure with Holidaze.
          </p>
          <div className="flex gap-4 mt-2">
            <button className="py-3.5 px-8 text-base font-medium rounded cursor-pointer transition-all bg-black text-white border-none hover:bg-holidaze-gray">
              Browse Venues
            </button>
            <button className="py-3.5 px-8 text-base font-medium rounded cursor-pointer transition-all bg-white text-holidaze-gray border border-holidaze-gray hover:bg-gray-100">
              Become a Host
            </button>
          </div>
        </div>
        <div className="flex-1 max-w-[50%]">
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center relative overflow-hidden">
            <span
              className="relative z-10 text-white text-lg font-medium"
              style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
              Overwater Bungalows
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
