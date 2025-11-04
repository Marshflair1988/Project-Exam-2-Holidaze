const features = [
  {
    icon: '🔒',
    title: 'Secure Booking',
    description:
      'Your payments and personal information are always protected with our secure booking system.',
  },
  {
    icon: '🎧',
    title: '24/7 Support',
    description:
      'Get help whenever you need it with our round-the-clock customer support team.',
  },
  {
    icon: '⭐',
    title: 'Verified Reviews',
    description:
      'Read authentic reviews from real guests to make informed booking decisions.',
  },
];

const WhyChoose = () => {
  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10 sm:mb-12 lg:mb-[60px]">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-holidaze-gray m-0 tracking-tight">
            Why Choose Holidaze?
          </h2>
          <p className="text-base sm:text-lg text-holidaze-light-gray mt-2 sm:mt-3">
            Experience the best in accommodation booking
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full border-2 border-holidaze-border flex items-center justify-center bg-white">
                <span className="text-[32px]">{feature.icon}</span>
              </div>
              <h3 className="text-[22px] font-semibold text-holidaze-gray m-0">
                {feature.title}
              </h3>
              <p className="text-base text-holidaze-light-gray leading-relaxed m-0 max-w-[320px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
