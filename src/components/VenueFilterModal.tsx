import { useState, useEffect } from 'react';

interface VenueFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    minPrice: number;
    maxPrice: number;
    minRating: number;
    maxGuests: number;
    amenities: string[];
    city: string;
    country: string;
  }) => void;
  currentFilters: {
    minPrice: number;
    maxPrice: number;
    minRating: number;
    maxGuests: number;
    amenities: string[];
    city: string;
    country: string;
  };
  availableCities: string[];
  availableCountries: string[];
}

const VenueFilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
  availableCities,
  availableCountries,
}: VenueFilterModalProps) => {
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice);
  const [minRating, setMinRating] = useState(currentFilters.minRating);
  const [maxGuests, setMaxGuests] = useState(currentFilters.maxGuests);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    currentFilters.amenities
  );
  const [selectedCity, setSelectedCity] = useState(currentFilters.city);
  const [selectedCountry, setSelectedCountry] = useState(currentFilters.country);

  const availableAmenities = ['WiFi', 'Parking', 'Pet Friendly', 'Breakfast'];

  // Reset form when modal opens with current filters
  useEffect(() => {
    if (isOpen) {
      setMinPrice(currentFilters.minPrice);
      setMaxPrice(currentFilters.maxPrice);
      setMinRating(currentFilters.minRating);
      setMaxGuests(currentFilters.maxGuests);
      setSelectedAmenities(currentFilters.amenities);
      setSelectedCity(currentFilters.city);
      setSelectedCountry(currentFilters.country);
    }
  }, [isOpen, currentFilters]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      minPrice,
      maxPrice,
      minRating,
      maxGuests,
      amenities: selectedAmenities,
      city: selectedCity,
      country: selectedCountry,
    });
    onClose();
  };

  const handleReset = () => {
    setMinPrice(0);
    setMaxPrice(10000);
    setMinRating(0);
    setMaxGuests(0);
    setSelectedAmenities([]);
    setSelectedCity('');
    setSelectedCountry('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-holidaze-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-holidaze-gray m-0">
            Filter Venues
          </h2>
          <button
            onClick={onClose}
            className="text-holidaze-light-gray hover:text-holidaze-gray text-2xl leading-none bg-transparent border-none cursor-pointer p-0 w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-holidaze-gray mb-3">
              Price Range (per night)
            </label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label
                  htmlFor="filter-min-price"
                  className="block text-xs text-holidaze-light-gray mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  id="filter-min-price"
                  min="0"
                  value={minPrice || ''}
                  onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full py-2.5 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <span className="text-holidaze-light-gray mt-6">-</span>
              <div className="flex-1">
                <label
                  htmlFor="filter-max-price"
                  className="block text-xs text-holidaze-light-gray mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  id="filter-max-price"
                  min="0"
                  value={maxPrice || ''}
                  onChange={(e) => setMaxPrice(Number(e.target.value) || 10000)}
                  placeholder="10000"
                  className="w-full py-2.5 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-holidaze-gray mb-3">
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                  className={`flex-1 py-2.5 px-4 border rounded text-[15px] font-medium cursor-pointer transition-all ${
                    minRating >= rating
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-holidaze-gray border-holidaze-border hover:bg-gray-50'
                  }`}>
                  {rating}+ ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Max Guests */}
          <div className="mb-6">
            <label
              htmlFor="filter-max-guests"
              className="block text-sm font-medium text-holidaze-gray mb-3">
              Maximum Guests
            </label>
            <input
              type="number"
              id="filter-max-guests"
              min="0"
              value={maxGuests || ''}
              onChange={(e) => setMaxGuests(Number(e.target.value) || 0)}
              placeholder="No limit"
              className="w-full py-2.5 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="text-xs text-holidaze-light-gray mt-1">
              Leave empty or set to 0 for no limit
            </p>
          </div>

          {/* Location Filters */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-holidaze-gray mb-3">
              Location
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="filter-city"
                  className="block text-xs text-holidaze-light-gray mb-1">
                  City
                </label>
                <select
                  id="filter-city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full py-2.5 px-4 pr-9 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray appearance-none cursor-pointer"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                  }}>
                  <option value="">All Cities</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="filter-country"
                  className="block text-xs text-holidaze-light-gray mb-1">
                  Country
                </label>
                <select
                  id="filter-country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full py-2.5 px-4 pr-9 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray appearance-none cursor-pointer"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                  }}>
                  <option value="">All Countries</option>
                  {availableCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-holidaze-gray mb-3">
              Amenities
            </label>
            <div className="flex flex-wrap gap-3">
              {availableAmenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`py-2.5 px-4 border rounded text-[15px] font-medium cursor-pointer transition-all ${
                    selectedAmenities.includes(amenity)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-holidaze-gray border-holidaze-border hover:bg-gray-50'
                  }`}>
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-holidaze-border">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2.5 px-5 bg-white text-holidaze-gray border border-holidaze-border rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-gray-100">
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-2.5 px-5 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueFilterModal;

