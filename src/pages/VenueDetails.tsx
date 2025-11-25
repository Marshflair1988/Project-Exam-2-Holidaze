import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingFormModal from '../components/BookingFormModal';
import BookingConfirmationModal from '../components/BookingConfirmationModal';
import { venuesApi, bookingsApi } from '../services/api';

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
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
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
  const [bookings, setBookings] = useState<
    Array<{ dateFrom: string; dateTo: string }>
  >([]);

  // Fetch bookings separately if not included in venue response
  useEffect(() => {
    const fetchBookings = async () => {
      if (!id) return;

      // If we already have bookings from venue response, don't fetch again
      if (bookings.length > 0) {
        return;
      }
      try {
        // Try to fetch bookings separately - the API might return bookings in the venue data
        // or we might need to fetch from a different endpoint
        const bookingsResponse = await bookingsApi.getByVenue(id);

        if (bookingsResponse.data) {
          // Check if response.data is an array of bookings or a venue object with bookings
          let bookingsArray: unknown[] = [];

          if (Array.isArray(bookingsResponse.data)) {
            bookingsArray = bookingsResponse.data;
          } else {
            // If it's a venue object, check for bookings property
            const venueData = bookingsResponse.data as { bookings?: unknown[] };
            if (venueData.bookings && Array.isArray(venueData.bookings)) {
              bookingsArray = venueData.bookings;
            }
          }

          if (bookingsArray.length > 0) {
            const validBookings = bookingsArray
              .filter((b: unknown) => {
                const booking = b as { dateFrom?: string; dateTo?: string };
                return (
                  booking.dateFrom &&
                  booking.dateTo &&
                  typeof booking.dateFrom === 'string' &&
                  typeof booking.dateTo === 'string'
                );
              })
              .map((b: unknown) => {
                const booking = b as { dateFrom: string; dateTo: string };
                return {
                  dateFrom: booking.dateFrom,
                  dateTo: booking.dateTo,
                };
              });
            setBookings(validBookings);
          }
        }
      } catch (err) {
        // If bookings require auth and user is not logged in, that's okay
        // Calendar will just show all dates as available
      }
    };

    if (venueData) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, venueData]);

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
            bookings?: Array<{ dateFrom?: string; dateTo?: string }>;
            meta?: {
              wifi?: boolean;
              parking?: boolean;
              breakfast?: boolean;
              pets?: boolean;
              [key: string]: unknown;
            };
          };

          // Extract bookings from venue response if available
          if (apiVenue.bookings && Array.isArray(apiVenue.bookings)) {
            const validBookings = apiVenue.bookings
              .filter(
                (b) =>
                  b.dateFrom &&
                  b.dateTo &&
                  typeof b.dateFrom === 'string' &&
                  typeof b.dateTo === 'string'
              )
              .map((b) => ({
                dateFrom: b.dateFrom!,
                dateTo: b.dateTo!,
              }));
            setBookings(validBookings);
          }

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
            totalReviews: 0, // API doesn't provide this, set to 0
            amenities: amenities.length > 0 ? amenities : [],
            images:
              images.length > 0
                ? images
                : ['https://via.placeholder.com/1200x800?text=No+Image'],
            reviews: undefined, // API doesn't provide reviews in venue data
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
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenue();
  }, [id]);

  const handleBookNow = () => {
    if (!checkInDate || !checkOutDate) {
      // If dates not selected, alert user
      alert('Please select both check-in and check-out dates');
      return;
    }
    setIsBookingFormOpen(true);
  };

  // Get booked dates for date picker exclusion
  const getBookedDates = (): Date[] => {
    const booked: Date[] = [];
    bookings.forEach((booking) => {
      const start = new Date(booking.dateFrom);
      const end = new Date(booking.dateTo);
      const current = new Date(start);
      // Reset time to midnight for accurate date comparison
      current.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      while (current <= end) {
        booked.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });
    return booked;
  };

  const isDateBooked = (date: Date): boolean => {
    // Normalize date to midnight for comparison
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return bookings.some((booking) => {
      const start = new Date(booking.dateFrom);
      start.setHours(0, 0, 0, 0);
      const end = new Date(booking.dateTo);
      end.setHours(23, 59, 59, 999);

      return checkDate >= start && checkDate <= end;
    });
  };

  const handleDateSelect = (date: Date | null, isCheckIn: boolean) => {
    if (isCheckIn) {
      setCheckInDate(date);
      if (checkOutDate && date && checkOutDate <= date) {
        setCheckOutDate(null);
      }
    } else {
      setCheckOutDate(date);
    }
  };

  const handleSaveBooking = async (bookingData: {
    venueId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => {
    if (!venueData) return;

    try {
      // Create booking via API

      const response = await bookingsApi.create({
        dateFrom: bookingData.checkIn,
        dateTo: bookingData.checkOut,
        guests: bookingData.guests,
        venueId: bookingData.venueId,
      });


      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = venueData.price * nights;

      // Extract booking ID from response
      const bookingId =
        (response.data as { id?: string })?.id || Date.now().toString();

      setConfirmedBooking({
        venueName: venueData.name,
        venueImage: venueData.images[0] || '',
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalPrice,
        bookingId,
      });

      setIsBookingFormOpen(false);
      setIsConfirmationOpen(true);
      // Reset dates after booking
      setCheckInDate(null);
      setCheckOutDate(null);
      setGuests(1);

      // Refresh bookings to show the new booking in the calendar
      if (id) {
        try {
          const bookingsResponse = await bookingsApi.getByVenue(id);
          if (bookingsResponse.data) {
            const venueData = bookingsResponse.data as { bookings?: unknown[] };
            if (venueData.bookings && Array.isArray(venueData.bookings)) {
              const validBookings = venueData.bookings
                .filter((b: unknown) => {
                  const booking = b as { dateFrom?: string; dateTo?: string };
                  return (
                    booking.dateFrom &&
                    booking.dateTo &&
                    typeof booking.dateFrom === 'string' &&
                    typeof booking.dateTo === 'string'
                  );
                })
                .map((b: unknown) => {
                  const booking = b as { dateFrom: string; dateTo: string };
                  return {
                    dateFrom: booking.dateFrom,
                    dateTo: booking.dateTo,
                  };
                });
              setBookings(validBookings);
            }
          }
        } catch (err) {
          // Could not refresh bookings
        }
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to create booking. Please try again.';
      alert(errorMessage);
    }
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
                  alt=""
                  className="w-full h-full object-cover"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {venueData.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-6">
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
                      alt=""
                      className="w-full h-full object-cover"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Venue Name */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-holidaze-gray m-0 mb-2 tracking-tight">
                {venueData.name}
              </h1>
              <p className="text-base sm:text-lg text-holidaze-light-gray m-0 mb-3">
                {venueData.location}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <span className="text-lg font-semibold text-holidaze-gray">
                  {venueData.rating}
                </span>
                {venueData.totalReviews !== undefined &&
                  venueData.totalReviews > 0 && (
                    <span className="text-base text-holidaze-light-gray">
                      ({venueData.totalReviews} reviews)
                    </span>
                  )}
              </div>
            </div>
          </div>
        </section>

        {/* Venue Info Section */}
        <section className="w-full py-8 sm:py-12 px-4 sm:px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
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
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-holidaze-gray m-0 mb-2">
                  Ready to book?
                </h3>
                <p className="text-base text-holidaze-light-gray m-0">
                  Reserve your stay at {venueData.name}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="venue-checkin"
                    className="text-sm font-medium text-holidaze-gray">
                    Check-in
                  </label>
                  <DatePicker
                    id="venue-checkin"
                    selected={checkInDate}
                    onChange={(date: Date | null) =>
                      handleDateSelect(date, true)
                    }
                    selectsStart
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={new Date()}
                    excludeDates={getBookedDates()}
                    filterDate={(date) => !isDateBooked(date)}
                    placeholderText="Select check-in"
                    dateFormat="MM/dd/yyyy"
                    className="py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full placeholder:text-holidaze-lighter-gray"
                    wrapperClassName="w-full"
                    aria-label="Check-in date"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="venue-checkout"
                    className="text-sm font-medium text-holidaze-gray">
                    Check-out
                  </label>
                  <DatePicker
                    id="venue-checkout"
                    selected={checkOutDate}
                    onChange={(date: Date | null) =>
                      handleDateSelect(date, false)
                    }
                    selectsEnd
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={checkInDate || new Date()}
                    excludeDates={getBookedDates()}
                    filterDate={(date) => !isDateBooked(date)}
                    placeholderText="Select check-out"
                    dateFormat="MM/dd/yyyy"
                    className="py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full placeholder:text-holidaze-lighter-gray"
                    wrapperClassName="w-full"
                    aria-label="Check-out date"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="venue-guests"
                    className="text-sm font-medium text-holidaze-gray">
                    Guests
                  </label>
                  <select
                    id="venue-guests"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full">
                    {Array.from(
                      { length: venueData.maxGuests },
                      (_, i) => i + 1
                    ).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleBookNow}
                  disabled={!checkInDate || !checkOutDate}
                  className={`py-3 px-8 border-none rounded text-base sm:text-lg font-medium cursor-pointer transition-all whitespace-nowrap ${
                    checkInDate && checkOutDate
                      ? 'bg-[#0369a1] text-white hover:opacity-90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}>
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
                  {venueData.totalReviews !== undefined &&
                    venueData.totalReviews > 0 && (
                      <span className="text-base text-holidaze-light-gray">
                        ({venueData.totalReviews} reviews)
                      </span>
                    )}
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
        preSelectedDates={{
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: guests,
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
