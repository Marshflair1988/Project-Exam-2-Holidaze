import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import VenueFilterModal from '../components/VenueFilterModal';
import { venuesApi } from '../services/api';

interface Venue {
  id: string;
  name: string;
  location: string;
  city?: string;
  country?: string;
  price: number;
  maxGuests: number;
  rating: number;
  images: string[];
  description?: string;
  amenities?: string[];
}

const VenueList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [displayedVenues, setDisplayedVenues] = useState<Venue[]>([]);
  const [venuesToShow, setVenuesToShow] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    minRating: 0,
    maxGuests: 0,
    amenities: [] as string[],
    city: '',
    country: '',
  });

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
      description?: string;
      meta?: {
        wifi?: boolean;
        parking?: boolean;
        breakfast?: boolean;
        pets?: boolean;
        [key: string]: unknown;
      };
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

    // Build amenities array from meta object
    const amenities: string[] = [];
    if (venue.meta?.wifi) amenities.push('WiFi');
    if (venue.meta?.parking) amenities.push('Parking');
    if (venue.meta?.breakfast) amenities.push('Breakfast');
    if (venue.meta?.pets) amenities.push('Pet Friendly');

    return {
      id: venue.id,
      name: venue.name,
      location: locationString,
      city: venue.location?.city,
      country: venue.location?.country,
      price: venue.price || 0,
      maxGuests: venue.maxGuests || 0,
      rating: venue.rating || 0,
      images:
        images.length > 0
          ? images
          : ['https://via.placeholder.com/600x400?text=No+Image'],
      description: venue.description,
      amenities: amenities.length > 0 ? amenities : undefined,
    };
  };

  // Read city from URL parameters and set filter
  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam) {
      setFilters((prev) => ({
        ...prev,
        city: cityParam,
      }));
    }
  }, [searchParams]);

  // Fetch all venues from API (with pagination)
  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all venues across all pages
        console.log('🔄 Fetching all venues with pagination...');
        const allVenuesData = await venuesApi.getAllPaginated(false);
        console.log(
          `✅ Fetched ${allVenuesData.length} venues across all pages`
        );

        if (Array.isArray(allVenuesData)) {
          const transformedVenues = allVenuesData
            .map((venue) => transformVenueData(venue))
            .filter((venue): venue is Venue => venue !== null);

          setVenues(transformedVenues);
          setFilteredVenues(transformedVenues);
          console.log(`✅ Transformed ${transformedVenues.length} venues`);
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load venues. Please try again.';
        console.error('❌ Error fetching venues:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Filter and sort venues based on search query, filters, and sort option
  useEffect(() => {
    let filtered = venues;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (venue) =>
          venue.name.toLowerCase().includes(query) ||
          venue.location.toLowerCase().includes(query) ||
          venue.description?.toLowerCase().includes(query)
      );
    }

    // Apply price filter
    if (filters.minPrice > 0 || filters.maxPrice < 10000) {
      filtered = filtered.filter(
        (venue) =>
          venue.price >= filters.minPrice && venue.price <= filters.maxPrice
      );
    }

    // Apply rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter((venue) => venue.rating >= filters.minRating);
    }

    // Apply max guests filter
    if (filters.maxGuests > 0) {
      filtered = filtered.filter(
        (venue) => venue.maxGuests <= filters.maxGuests
      );
    }

    // Apply amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter((venue) => {
        if (!venue.amenities || venue.amenities.length === 0) return false;
        // Check if venue has all selected amenities
        return filters.amenities.every((amenity) =>
          venue.amenities?.includes(amenity)
        );
      });
    }

    // Apply city filter
    if (filters.city.trim()) {
      filtered = filtered.filter(
        (venue) => venue.city?.toLowerCase() === filters.city.toLowerCase()
      );
    }

    // Apply country filter
    if (filters.country.trim()) {
      filtered = filtered.filter(
        (venue) =>
          venue.country?.toLowerCase() === filters.country.toLowerCase()
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'recommended':
      default:
        // Keep original order (recommended)
        break;
    }

    setFilteredVenues(sorted);
  }, [searchQuery, venues, sortBy, filters]);

  // Update displayed venues when filtered venues or venuesToShow changes
  useEffect(() => {
    setDisplayedVenues(filteredVenues.slice(0, venuesToShow));
  }, [filteredVenues, venuesToShow]);

  // Reset displayed count when filters or search change
  useEffect(() => {
    setVenuesToShow(30);
  }, [searchQuery, filters]);

  const handleLoadMore = () => {
    setVenuesToShow((prev) => prev + 30);
  };

  const handleVenueClick = (venueId: string) => {
    navigate(`/venue/${venueId}`);
  };

  const handleApplyFilters = (newFilters: {
    minPrice: number;
    maxPrice: number;
    minRating: number;
    maxGuests: number;
    amenities: string[];
    city: string;
    country: string;
  }) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.minPrice > 0 ||
      filters.maxPrice < 10000 ||
      filters.minRating > 0 ||
      filters.maxGuests > 0 ||
      filters.amenities.length > 0 ||
      filters.city.trim() !== '' ||
      filters.country.trim() !== ''
    );
  };

  // Get unique cities and countries from venues
  const uniqueCities = Array.from(
    new Set(venues.map((v) => v.city).filter((c): c is string => !!c))
  ).sort();

  const uniqueCountries = Array.from(
    new Set(venues.map((v) => v.country).filter((c): c is string => !!c))
  ).sort();

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full bg-white">
        {/* Search Bar Section */}
        <SearchBar />

        {/* Venues Section */}
        <section className="w-full py-8 sm:py-12 px-4 sm:px-6">
          <div className="max-w-[1200px] mx-auto">
            {/* Header with Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-holidaze-gray m-0 mb-2 tracking-tight">
                  All Venues
                </h1>
                <p className="text-base text-holidaze-light-gray m-0">
                  {isLoading
                    ? 'Loading venues...'
                    : filteredVenues.length === venues.length
                    ? `Discover ${venues.length} amazing venues`
                    : `Found ${filteredVenues.length} of ${venues.length} venues`}
                  {!isLoading && displayedVenues.length > 0 && (
                    <span className="ml-2">
                      (Showing {displayedVenues.length} of{' '}
                      {filteredVenues.length})
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto">
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className={`py-2.5 px-5 bg-white text-holidaze-gray border rounded text-sm sm:text-[15px] font-medium cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-gray-100 w-full sm:w-auto ${
                    hasActiveFilters()
                      ? 'border-black border-2'
                      : 'border-holidaze-border'
                  }`}>
                  <span className="text-base">⚙️</span>
                  Filters
                  {hasActiveFilters() && (
                    <span className="ml-1 text-xs bg-black text-white rounded-full px-2 py-0.5">
                      {
                        [
                          filters.minPrice > 0 || filters.maxPrice < 10000,
                          filters.minRating > 0,
                          filters.maxGuests > 0,
                          filters.amenities.length > 0,
                          filters.city.trim() !== '',
                          filters.country.trim() !== '',
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </button>
                <div className="relative w-full sm:w-auto">
                  <label htmlFor="venue-sort" className="sr-only">
                    Sort venues
                  </label>
                  <select
                    id="venue-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="py-2.5 px-4 pr-9 border border-holidaze-border rounded text-sm sm:text-[15px] bg-white text-holidaze-gray appearance-none cursor-pointer w-full"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                    }}>
                    <option value="recommended">Sort by recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <label htmlFor="venue-search" className="sr-only">
                Search venues
              </label>
              <input
                type="text"
                id="venue-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venues by name, location, or description..."
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <p className="text-lg text-holidaze-light-gray">
                  Loading venues...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-12">
                <p className="text-lg text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="py-2.5 px-5 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
                  Try Again
                </button>
              </div>
            )}

            {/* No Venues Found */}
            {!isLoading &&
              !error &&
              displayedVenues.length === 0 &&
              filteredVenues.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-holidaze-light-gray mb-4">
                    {searchQuery
                      ? 'No venues found matching your search.'
                      : 'No venues available at the moment.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="py-2.5 px-5 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
                      Clear Search
                    </button>
                  )}
                </div>
              )}

            {/* Venues Grid */}
            {!isLoading && !error && displayedVenues.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedVenues.map((venue) => (
                    <div
                      key={venue.id}
                      onClick={() => handleVenueClick(venue.id)}
                      className="bg-white border border-holidaze-border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col">
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
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-xl font-semibold text-holidaze-gray m-0 mb-1">
                          {venue.name}
                        </h3>
                        <p className="text-[15px] text-holidaze-light-gray m-0 mb-3">
                          {venue.location}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-1">
                            <span className="text-base">⭐</span>
                            <span className="text-[15px] font-medium text-holidaze-gray">
                              {venue.rating > 0
                                ? venue.rating.toFixed(1)
                                : 'N/A'}
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
                        {venue.maxGuests > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-holidaze-light-gray">
                              👥
                            </span>
                            <span className="text-sm text-holidaze-gray">
                              Up to {venue.maxGuests} guests
                            </span>
                          </div>
                        )}
                        {venue.amenities && venue.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {venue.amenities
                              .slice(0, 3)
                              .map((amenity, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-50 text-xs text-holidaze-gray rounded border border-holidaze-border">
                                  {amenity}
                                </span>
                              ))}
                            {venue.amenities.length > 3 && (
                              <span className="px-2 py-1 bg-gray-50 text-xs text-holidaze-gray rounded border border-holidaze-border">
                                +{venue.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        <button className="w-full py-3 px-6 bg-[#0369a1] text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:opacity-90 mt-auto">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {filteredVenues.length > venuesToShow && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      className="py-3 px-6 sm:px-8 bg-white text-holidaze-gray border border-holidaze-border rounded text-sm sm:text-base font-medium cursor-pointer transition-all hover:bg-gray-100 hover:border-holidaze-gray">
                      Load More Venues ({filteredVenues.length - venuesToShow}{' '}
                      remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {/* Filter Modal */}
      <VenueFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        availableCities={uniqueCities}
        availableCountries={uniqueCountries}
      />
    </div>
  );
};

export default VenueList;
