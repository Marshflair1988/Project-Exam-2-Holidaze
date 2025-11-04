import VenueCard from './VenueCard';

const featuredVenues = [
  {
    id: 1,
    title: 'Luxury Beach Villa',
    location: 'Malibu, California',
    rating: 4.9,
    price: 450,
    image: 'beach-villa',
  },
  {
    id: 2,
    title: 'Modern City Apartment',
    location: 'New York, NY',
    rating: 4.9,
    price: 180,
    image: 'city-apartment',
  },
  {
    id: 3,
    title: 'Cozy Mountain Cabin',
    location: 'Aspen, Colorado',
    rating: 4.9,
    price: 320,
    image: 'mountain-cabin',
  },
];

const FeaturedVenues = () => {
  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#e5e7eb4c]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-holidaze-gray m-0 tracking-tight">
            Featured Venues
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto">
            <button className="py-2.5 px-5 bg-white text-holidaze-gray border border-holidaze-border rounded text-sm sm:text-[15px] font-medium cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-gray-100 w-full sm:w-auto">
              <span className="text-base">⚙️</span>
              Filters
            </button>
            <div className="relative w-full sm:w-auto">
              <select
                className="py-2.5 px-4 pr-9 border border-holidaze-border rounded text-sm sm:text-[15px] bg-white text-holidaze-gray appearance-none cursor-pointer w-full"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}>
                <option>Sort by recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {featuredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
        <div className="flex justify-center">
          <button className="py-3 px-6 sm:px-8 bg-white text-holidaze-gray border border-holidaze-border rounded text-sm sm:text-base font-medium cursor-pointer transition-all hover:bg-gray-100 hover:border-holidaze-gray w-full sm:w-auto">
            Load More Venues
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVenues;
