import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingFormModal from '../components/BookingFormModal';
import BookingConfirmationModal from '../components/BookingConfirmationModal';
import { venuesApi } from '../services/api';

interface VenueData {
  id: string;
  name: string;
  location: string;
  price: number;
  maxGuests: number;
  description: string;
  rating: number;
  totalReviews?: number;
  amenities: Array<{ icon: string; name: string }>;
  images: string[];
  rooms?: Array<{
    type: string;
    available: number;
    price: number;
    capacity: number;
  }>;
  reviews?: Array<{
    id: number;
    guestName: string;
    rating: number;
    date: string;
    comment: string;
  }>;
  mapLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

const VenueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    venueName: string;
    venueImage: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    bookingId?: string;
  } | null>(null);

  // Fetch venue data from API
  const [venueData, setVenueData] = useState<VenueData | null>(null);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id) {
        setError('Venue ID is required');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await venuesApi.getById(id);
        console.log('✅ Fetched venue:', response);

        if (response.data) {
          const apiVenue = response.data as {
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

          if (!apiVenue.id || !apiVenue.name) {
            throw new Error('Invalid venue data received from API');
          }

          // Build location string
          const locationParts: string[] = [];
          if (apiVenue.location?.city)
            locationParts.push(apiVenue.location.city);
          if (apiVenue.location?.country)
            locationParts.push(apiVenue.location.country);
          const locationString =
            locationParts.length > 0
              ? locationParts.join(', ')
              : apiVenue.location?.address || 'Unknown Location';

          // Extract images from media array
          const images =
            apiVenue.media
              ?.map((m) => m.url || '')
              .filter((url) => url !== '') || [];

          // Build amenities array from meta object
          const amenities: Array<{ icon: string; name: string }> = [];
          if (apiVenue.meta?.wifi) amenities.push({ icon: '🌐', name: 'WiFi' });
          if (apiVenue.meta?.parking)
            amenities.push({ icon: '🅿️', name: 'Parking' });
          if (apiVenue.meta?.breakfast)
            amenities.push({ icon: '🍳', name: 'Breakfast' });
          if (apiVenue.meta?.pets)
            amenities.push({ icon: '🐾', name: 'Pet Friendly' });

          const transformedVenue: VenueData = {
            id: apiVenue.id,
            name: apiVenue.name,
            location: locationString,
            price: apiVenue.price || 0,
            maxGuests: apiVenue.maxGuests || 0,
            description: apiVenue.description || 'No description available.',
            rating: apiVenue.rating || 0,
            amenities: amenities.length > 0 ? amenities : [],
            images:
              images.length > 0
                ? images
                : ['https://via.placeholder.com/1200x800?text=No+Image'],
          };

          setVenueData(transformedVenue);
        } else {
          throw new Error('Venue not found');
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load venue. Please try again.';
        console.error('❌ Error fetching venue:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenue();
  }, [id]);

  const handleBookNow = () => {
    setIsBookingFormOpen(true);
  };

  const handleSaveBooking = (bookingData: {
    venueId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => {
    if (!venueData) return;

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = venueData.price * nights;

    setConfirmedBooking({
      venueName: venueData.name,
      venueImage: venueData.images[0] || '',
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      totalPrice,
      bookingId: Date.now().toString(),
    });

    setIsBookingFormOpen(false);
    setIsConfirmationOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-lg text-holidaze-light-gray">Loading venue...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error || !venueData) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">
              {error || 'Venue not found'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="py-2.5 px-5 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
              Go Back Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        {/* Hero Section with Image Gallery */}
        <section className="w-full bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {/* Main Image */}
            <div className="mb-4">
              <div className="w-full aspect-[16/9] rounded-lg overflow-hidden relative">
                <img
                  src={
                    venueData.images[selectedImage] || venueData.images[0] || ''
                  }
                  alt={venueData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {venueData.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 sm:gap-4">
                {venueData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-black scale-105'
                        : 'border-holidaze-border hover:border-holidaze-gray'
                    }`}>
                    <img
                      src={image}
                      alt={`${venueData.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Venue Info Section */}
        <section className="w-full py-8 sm:py-12 px-4 sm:px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-holidaze-gray m-0 mb-2 tracking-tight">
                {venueData.name}
              </h1>
              <p className="text-base sm:text-lg text-holidaze-light-gray m-0">
                {venueData.location}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xl">⭐</span>
                <span className="text-lg font-semibold text-holidaze-gray">
                  {venueData.rating}
                </span>
                <span className="text-base text-holidaze-light-gray">
                  ({venueData.totalReviews} reviews)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-holidaze-gray m-0 mb-4">
                About this venue
              </h2>
              <p className="text-base text-holidaze-gray leading-relaxed m-0 max-w-3xl">
                {venueData.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-holidaze-gray m-0 mb-6">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {venueData.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-white border border-holidaze-border rounded-lg hover:shadow-md transition-shadow">
                    <span className="text-2xl">{amenity.icon}</span>
                    <span className="text-sm sm:text-base text-holidaze-gray font-medium">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Now Section */}
            <div className="bg-gray-50 border border-holidaze-border rounded-lg p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-holidaze-gray m-0 mb-2">
                    Ready to book?
                  </h3>
                  <p className="text-base text-holidaze-light-gray m-0">
                    Reserve your stay at {venueData.name}
                  </p>
                </div>
                <button
                  onClick={handleBookNow}
                  className="py-3 px-8 bg-black text-white border-none rounded text-base sm:text-lg font-medium cursor-pointer transition-all hover:bg-holidaze-gray whitespace-nowrap">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Rooms and Pricing Section - Only show if rooms data exists */}
        {venueData.rooms && venueData.rooms.length > 0 && (
          <section className="w-full py-8 sm:py-12 px-4 sm:px-6 bg-[#e5e7eb4c]">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-holidaze-gray m-0 mb-8">
                Available Rooms
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {venueData.rooms.map((room, index) => (
                  <div
                    key={index}
                    className="bg-white border border-holidaze-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-holidaze-gray m-0 mb-1">
                          {room.type}
                        </h3>
                        <p className="text-sm text-holidaze-light-gray m-0">
                          Up to {room.capacity} guests
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-holidaze-gray">
                          ${room.price}
                        </div>
                        <div className="text-sm text-holidaze-light-gray">
                          per night
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-holidaze-gray">
                        Available:
                      </span>
                      <span className="text-base font-semibold text-black">
                        {room.available} rooms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Reviews Section - Only show if reviews data exists */}
        {venueData.reviews && venueData.reviews.length > 0 && (
          <section className="w-full py-8 sm:py-12 px-4 sm:px-6 bg-white">
            <div className="max-w-[1200px] mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-holidaze-gray m-0">
                  Guest Reviews
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <span className="text-xl font-bold text-holidaze-gray">
                    {venueData.rating}
                  </span>
                  <span className="text-base text-holidaze-light-gray">
                    ({venueData.totalReviews} reviews)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {venueData.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-holidaze-border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-holidaze-gray m-0 mb-1">
                          {review.guestName}
                        </h3>
                        <p className="text-sm text-holidaze-light-gray m-0">
                          {new Date(review.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < review.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-base text-holidaze-gray leading-relaxed m-0">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Map Section - Only show if mapLocation data exists */}
        {venueData.mapLocation && (
          <section className="w-full py-8 sm:py-12 px-4 sm:px-6 bg-[#e5e7eb4c]">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-holidaze-gray m-0 mb-6">
                Location
              </h2>
              <div className="bg-white border border-holidaze-border rounded-lg overflow-hidden">
                <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px]">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      venueData.mapLocation.address
                    )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    title="Venue Location"></iframe>
                </div>
                <div className="p-4 sm:p-6 border-t border-holidaze-border">
                  <p className="text-base text-holidaze-gray font-medium m-0">
                    📍 {venueData.mapLocation.address}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />

      {/* Booking Form Modal */}
      <BookingFormModal
        isOpen={isBookingFormOpen}
        onClose={() => setIsBookingFormOpen(false)}
        onSave={handleSaveBooking}
        availableVenues={[
          {
            id: venueData.id,
            name: venueData.name,
            location: venueData.location,
            price: venueData.price,
            maxGuests: venueData.maxGuests,
            rating: venueData.rating,
            images: venueData.images,
          },
        ]}
        selectedVenue={{
          id: venueData.id,
          name: venueData.name,
          location: venueData.location,
          price: venueData.price,
          maxGuests: venueData.maxGuests,
          rating: venueData.rating,
          images: venueData.images,
        }}
      />

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        bookingData={confirmedBooking}
      />
    </div>
  );
};

export default VenueDetails;
