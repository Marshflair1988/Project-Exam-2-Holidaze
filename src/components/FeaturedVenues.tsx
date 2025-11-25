import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { venuesApi } from '../services/api';

interface Venue {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  images: string[];
  maxGuests?: number;
}

const FeaturedVenues = () => {
  const navigate = useNavigate();
  const [topRatedVenues, setTopRatedVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transform API venue data to local Venue interface
  const transformVenueData = (apiVenue: unknown): Venue | null => {
    const venue = apiVenue as {
      id?: string;
      name?: string;
      location?: {
        address?: string;
        city?: string;
        country?: string;
      };
      price?: number;
      maxGuests?: number;
      rating?: number;
      media?: Array<{ url?: string; alt?: string }>;
    };

    if (!venue.id || !venue.name) {
      return null;
    }

    // Build location string from location object
    const locationParts: string[] = [];
    if (venue.location?.city) locationParts.push(venue.location.city);
    if (venue.location?.country) locationParts.push(venue.location.country);
    const locationString =
      locationParts.length > 0
        ? locationParts.join(', ')
        : venue.location?.address || 'Unknown Location';

    // Extract images from media array
    const images =
      venue.media?.map((m) => m.url || '').filter((url) => url !== '') || [];

    return {
      id: venue.id,
      name: venue.name,
      location: locationString,
      price: venue.price || 0,
      maxGuests: venue.maxGuests || 0,
      rating: venue.rating || 0,
      images:
        images.length > 0
          ? images
          : ['https://via.placeholder.com/600x400?text=No+Image'],
    };
  };

  // Fetch and filter 5-star venues
  useEffect(() => {
    const fetchTopRatedVenues = async () => {
      setIsLoading(true);
      try {
        // Fetch all venues across all pages
        const allVenuesData = await venuesApi.getAllPaginated(false);

        if (Array.isArray(allVenuesData)) {
          // Transform all venues
          const allVenues = allVenuesData
            .map((venue) => transformVenueData(venue))
            .filter((venue): venue is Venue => venue !== null);

          // Filter for 5-star rated venues (rating >= 5)
          const fiveStarVenues = allVenues.filter((venue) => venue.rating >= 5);

          // Get 3 random venues from 5-star venues
          const shuffled = [...fiveStarVenues].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 3);

          setTopRatedVenues(selected);
        }
      } catch (err: unknown) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopRatedVenues();
  }, []);

  const handleVenueClick = (venueId: string) => {
    navigate(`/venue/${venueId}`);
  };

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#e5e7eb4c]">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-holidaze-gray m-0 tracking-tight">
            Top Rated Accommodation
          </h2>
          <p className="text-base text-holidaze-light-gray mt-2">
            Discover our finest 5-star rated venues
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-holidaze-light-gray">
              Loading top rated venues...
            </p>
          </div>
        ) : topRatedVenues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-holidaze-light-gray">
              No 5-star rated venues available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {topRatedVenues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => handleVenueClick(venue.id)}
                className="bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] cursor-pointer">
                <div className="w-full aspect-[16/10] relative overflow-hidden">
                  <img
                    src={
                      venue.images[0] ||
                      'https://via.placeholder.com/600x400?text=No+Image'
                    }
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    aria-hidden="true"
                  />
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <h3 className="text-xl font-semibold text-holidaze-gray m-0">
                    {venue.name}
                  </h3>
                  <p className="text-[15px] text-holidaze-light-gray m-0">
                    {venue.location}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-base">⭐</span>
                      <span className="text-[15px] font-medium text-holidaze-gray">
                        {venue.rating > 0 ? venue.rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-[22px] font-bold text-holidaze-gray">
                        ${venue.price}
                      </span>
                      <span className="text-sm text-holidaze-light-gray ml-1">
                        / night
                      </span>
                    </div>
                  </div>
                  {venue.maxGuests && venue.maxGuests > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-holidaze-light-gray">
                        👥
                      </span>
                      <span className="text-sm text-holidaze-gray">
                        Up to {venue.maxGuests} guests
                      </span>
                    </div>
                  )}
                  <span className="py-3 px-6 bg-[#0369a1] text-white border-none rounded text-[15px] font-medium text-center block mt-auto">
                    View Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedVenues;
