import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingFormModal from '../components/BookingFormModal';
import {
  profilesApi,
  bookingsApi,
  venuesApi,
  removeAccessToken,
  removeUserData,
  getUserData,
  setUserData,
} from '../services/api';

interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  venueImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface Venue {
  id: string;
  name: string;
  location: string;
  price: number;
  maxGuests: number;
  rating: number;
  images: string[];
}

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>(
    'bookings'
  );
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const navigate = useNavigate();

  // Get username from stored user data
  useEffect(() => {
    const userData = getUserData();
    if (userData?.name) {
      setUsername(userData.name);
    }
  }, []);

  // Fetch user profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      const userData = getUserData();
      if (!userData?.name) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        const response = await profilesApi.getProfile(userData.name);
        if (response.data) {
          const profile = response.data as {
            name?: string;
            email?: string;
            avatar?: { url: string; alt?: string };
            bio?: string;
          };

          setProfileData({
            name: profile.name || userData.name || '',
            email: profile.email || userData.email || '',
            avatar:
              profile.avatar?.url ||
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
          });
        }
      } catch (err: unknown) {
        console.error('Error fetching profile:', err);
        // Fallback to stored user data
        const userData = getUserData();
        if (userData) {
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            avatar:
              userData.avatar?.url ||
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
          });
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, []);

  // Fetch user bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoadingBookings(true);
      try {
        // Get current user's name
        const userData = getUserData();
        if (!userData?.name) {
          console.warn('⚠️ No user data found, cannot fetch bookings');
          setBookings([]);
          setIsLoadingBookings(false);
          return;
        }

        // Try profile-specific endpoint first, fallback to getAll if it doesn't exist
        let response;
        try {
          response = await bookingsApi.getByProfile(userData.name);
          console.log('✅ Fetched bookings via profile endpoint:', userData.name, response);
        } catch (err) {
          // If profile endpoint doesn't exist, use getAll and filter client-side
          console.log('⚠️ Profile endpoint not available, using getAll and filtering:', err);
          const allBookingsResponse = await bookingsApi.getAll();
          
          // Filter bookings by customer name if available
          if (allBookingsResponse.data && Array.isArray(allBookingsResponse.data)) {
            const filteredBookings = allBookingsResponse.data.filter((booking: unknown) => {
              const b = booking as { customer?: { name?: string }; customerName?: string };
              const customerName = b.customer?.name || b.customerName;
              return customerName === userData.name;
            });
            response = { ...allBookingsResponse, data: filteredBookings };
            console.log(`✅ Filtered ${filteredBookings.length} bookings for user ${userData.name} from ${allBookingsResponse.data.length} total`);
          } else {
            response = allBookingsResponse;
          }
        }
        
        console.log('✅ Using bookings response:', response);

        if (response.data && Array.isArray(response.data)) {
          // Log first booking to see structure
          if (response.data.length > 0) {
            console.log('📋 Sample booking structure:', response.data[0]);
            console.log('📋 Full booking keys:', Object.keys(response.data[0]));
          }

          // Transform API bookings to local Booking format
          const transformedBookings = await Promise.all(
            response.data.map(async (booking: unknown) => {
              const apiBooking = booking as {
                id?: string;
                dateFrom?: string;
                dateTo?: string;
                guests?: number;
                venue?: { id?: string; name?: string; media?: Array<{ url?: string }>; price?: number };
                venueId?: string;
                created?: string;
                updated?: string;
              };

              // Check for id and venueId (venueId might be nested in venue object)
              const bookingId = apiBooking.id;
              const venueId = apiBooking.venueId || apiBooking.venue?.id;

              if (!bookingId) {
                console.warn('⚠️ Booking missing id:', apiBooking);
                return null;
              }

              // If venueId is missing, skip this booking
              if (!venueId) {
                console.warn('⚠️ Booking missing venueId:', apiBooking);
                return null;
              }

              // Get venue details - check if venue is already included in booking response
              let venueName = 'Unknown Venue';
              let venueImage =
                'https://via.placeholder.com/600x400?text=No+Image';
              let venuePrice = 0;

              // If venue data is already included in the booking response, use it
              if (apiBooking.venue) {
                venueName = apiBooking.venue.name || 'Unknown Venue';
                venueImage =
                  apiBooking.venue.media?.[0]?.url ||
                  'https://via.placeholder.com/600x400?text=No+Image';
                venuePrice = apiBooking.venue.price || 0;
              } else {
                // Otherwise, fetch venue details separately
                try {
                  const venueResponse = await venuesApi.getById(venueId);
                  if (venueResponse.data) {
                    const venue = venueResponse.data as {
                      name?: string;
                      media?: Array<{ url?: string }>;
                      price?: number;
                    };
                    venueName = venue.name || 'Unknown Venue';
                    venueImage =
                      venue.media?.[0]?.url ||
                      'https://via.placeholder.com/600x400?text=No+Image';
                    venuePrice = venue.price || 0;
                  }
                } catch (err) {
                  console.warn(
                    `⚠️ Could not fetch venue ${venueId}:`,
                    err
                  );
                }
              }

              // Calculate total price
              const checkInDate = new Date(apiBooking.dateFrom || '');
              const checkOutDate = new Date(apiBooking.dateTo || '');
              const nights = Math.ceil(
                (checkOutDate.getTime() - checkInDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const totalPrice = venuePrice * nights;

              return {
                id: bookingId,
                venueId,
                venueName,
                venueImage,
                checkIn: apiBooking.dateFrom || '',
                checkOut: apiBooking.dateTo || '',
                guests: apiBooking.guests || 1,
                totalPrice,
                status: 'confirmed' as const, // API bookings are confirmed when created
              };
            })
          );

          // Filter out null values
          const validBookings = transformedBookings.filter(
            (b): b is Booking => b !== null
          );
          setBookings(validBookings);
          console.log(`✅ Transformed ${validBookings.length} bookings`);
        }
      } catch (err: unknown) {
        console.error('❌ Error fetching bookings:', err);
        // If user is not authenticated, bookings will be empty
        setBookings([]);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Available venues for booking
  const availableVenues: Venue[] = [
    {
      id: '1',
      name: 'Luxury Beach Villa',
      location: 'Malibu, California',
      price: 450,
      maxGuests: 8,
      rating: 4.9,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
      ],
    },
    {
      id: '2',
      name: 'Modern City Apartment',
      location: 'New York, NY',
      price: 180,
      maxGuests: 4,
      rating: 4.7,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
      ],
    },
    {
      id: '3',
      name: 'Cozy Mountain Cabin',
      location: 'Aspen, Colorado',
      price: 320,
      maxGuests: 6,
      rating: 4.8,
      images: [
        'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600&h=400&fit=crop',
      ],
    },
  ];

  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>({
    name: '',
    email: '',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  });

  const handleCreateBooking = (venue?: Venue) => {
    setSelectedVenue(venue || null);
    setIsBookingFormOpen(true);
  };

  const handleSaveBooking = async (bookingData: {
    venueId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => {
    try {
      // Create booking via API
      const response = await bookingsApi.create({
        dateFrom: bookingData.checkIn,
        dateTo: bookingData.checkOut,
        guests: bookingData.guests,
        venueId: bookingData.venueId,
      });

      console.log('✅ Booking created:', response);

      // Fetch venue details to get name, image, and price
      let venueName = 'Unknown Venue';
      let venueImage = 'https://via.placeholder.com/600x400?text=No+Image';
      let venuePrice = 0;

      try {
        const venueResponse = await venuesApi.getById(bookingData.venueId);
        if (venueResponse.data) {
          const venue = venueResponse.data as {
            name?: string;
            media?: Array<{ url?: string }>;
            price?: number;
          };
          venueName = venue.name || 'Unknown Venue';
          venueImage =
            venue.media?.[0]?.url ||
            'https://via.placeholder.com/600x400?text=No+Image';
          venuePrice = venue.price || 0;
        }
      } catch (err) {
        console.warn(`⚠️ Could not fetch venue ${bookingData.venueId}:`, err);
      }

      // Calculate total price
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = venuePrice * nights;

      // Extract booking ID from response
      const bookingId = (response.data as { id?: string })?.id || Date.now().toString();

      const newBooking: Booking = {
        id: bookingId,
        venueName,
        venueImage,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalPrice,
        status: 'confirmed', // API bookings are confirmed when created
      };

      setBookings([...bookings, newBooking]);
      setIsBookingFormOpen(false);
      setSelectedVenue(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to create booking. Please try again.';
      console.error('❌ Error creating booking:', err);
      alert(errorMessage);
    }
  };

  const handleEditBooking = async (booking: Booking) => {
    setSelectedBooking(booking);
    
    // Fetch venue details for the booking
    try {
      const venueResponse = await venuesApi.getById(booking.venueId);
      if (venueResponse.data) {
        const venue = venueResponse.data as {
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
          media?: Array<{ url?: string }>;
        };
        
        const locationParts: string[] = [];
        if (venue.location?.city) locationParts.push(venue.location.city);
        if (venue.location?.country) locationParts.push(venue.location.country);
        const locationString =
          locationParts.length > 0
            ? locationParts.join(', ')
            : venue.location?.address || 'Unknown Location';

        const venueData: Venue = {
          id: venue.id || booking.venueId,
          name: venue.name || booking.venueName,
          location: locationString,
          price: venue.price || 0,
          maxGuests: venue.maxGuests || booking.guests,
          rating: venue.rating || 0,
          images: venue.media?.map((m) => m.url || '').filter((url) => url !== '') || [booking.venueImage],
        };
        
        setSelectedVenue(venueData);
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch venue for editing:', err);
      // Use a minimal venue object if fetch fails
      setSelectedVenue({
        id: booking.venueId,
        name: booking.venueName,
        location: '',
        price: 0,
        maxGuests: booking.guests,
        rating: 0,
        images: [booking.venueImage],
      });
    }
    
    setIsEditBookingOpen(true);
  };

  const handleUpdateBooking = async (bookingData: {
    venueId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => {
    if (!selectedBooking) return;

    try {
      // Update booking via API
      const response = await bookingsApi.update(selectedBooking.id, {
        dateFrom: bookingData.checkIn,
        dateTo: bookingData.checkOut,
        guests: bookingData.guests,
      });

      console.log('✅ Booking updated:', response);

      // Fetch venue details to recalculate price
      let venuePrice = 0;
      try {
        const venueResponse = await venuesApi.getById(bookingData.venueId);
        if (venueResponse.data) {
          const venue = venueResponse.data as { price?: number };
          venuePrice = venue.price || 0;
        }
      } catch (err) {
        console.warn(`⚠️ Could not fetch venue ${bookingData.venueId}:`, err);
      }

      // Calculate new total price
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = venuePrice * nights;

      // Update booking in the list
      setBookings(
        bookings.map((b) =>
          b.id === selectedBooking.id
            ? {
                ...b,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                guests: bookingData.guests,
                totalPrice,
              }
            : b
        )
      );

      setIsEditBookingOpen(false);
      setSelectedBooking(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to update booking. Please try again.';
      console.error('❌ Error updating booking:', err);
      alert(errorMessage);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsApi.delete(bookingId);
        console.log('✅ Booking cancelled:', bookingId);
        // Remove booking from list
        setBookings(bookings.filter((b) => b.id !== bookingId));
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to cancel booking. Please try again.';
        console.error('❌ Error cancelling booking:', err);
        alert(errorMessage);
      }
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Read file as data URL for immediate preview
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        
        // Update local state for immediate UI feedback
        setProfileData({
          ...profileData,
          avatar: dataUrl,
        });

        // Save to API
        // Note: The API expects avatar as { url: string, alt?: string }
        // If dataUrl is a base64 string, we'll use it as the URL
        // In production, you'd typically upload to a service first
        try {
          await profilesApi.updateProfile({
            avatar: {
              url: dataUrl,
              alt: profileData.name || 'Profile avatar',
            },
          });
          console.log('✅ Avatar updated successfully');
          
          // Update user data in localStorage
          const userData = getUserData();
          if (userData) {
            setUserData({
              ...userData,
              avatar: { url: dataUrl, alt: profileData.name || 'Profile avatar' },
            });
          }
        } catch (err) {
          console.error('❌ Error updating avatar:', err);
          alert('Failed to save avatar. Please try again.');
          // Revert to previous avatar on error
          const userData = getUserData();
          if (userData?.avatar?.url) {
            setProfileData({
              ...profileData,
              avatar: userData.avatar.url,
            });
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('❌ Error reading file:', err);
      alert('Failed to read image file. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete your profile and all associated data.'
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await profilesApi.deleteProfile();
      // Clear local storage
      removeAccessToken();
      removeUserData();
      // Redirect to home page
      navigate('/');
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(
        error.message || 'Failed to delete account. Please try again later.'
      );
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Profile Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-holidaze-gray m-0 mb-2 tracking-tight">
              {username ? `Welcome back ${username}` : 'My Profile'}
            </h1>
            <p className="text-base text-holidaze-light-gray m-0">
              Manage your bookings and profile settings
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-holidaze-border">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-3 px-6 border-b-2 border-transparent text-[15px] font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'border-black text-black'
                  : 'text-holidaze-light-gray hover:text-holidaze-gray'
              }`}>
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-6 border-b-2 border-transparent text-[15px] font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-black text-black'
                  : 'text-holidaze-light-gray hover:text-holidaze-gray'
              }`}>
              Profile
            </button>
          </div>

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-holidaze-gray m-0">
                  My Bookings ({bookings.length})
                </h2>
              </div>

              {isLoadingBookings ? (
                <div className="bg-white border border-holidaze-border rounded-lg p-12 text-center">
                  <p className="text-base text-holidaze-light-gray">
                    Loading bookings...
                  </p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white border border-holidaze-border rounded-lg p-12 text-center">
                  <p className="text-base text-holidaze-light-gray">
                    You don't have any bookings yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-holidaze-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                          <img
                            src={booking.venueImage}
                            alt={booking.venueName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-semibold text-holidaze-gray m-0 mb-1">
                                    {booking.venueName}
                                  </h3>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    booking.status
                                  )}`}>
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1)}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                                <div>
                                  <span className="text-holidaze-light-gray">
                                    Check-in:
                                  </span>
                                  <p className="text-holidaze-gray font-medium m-0 mt-1">
                                    {formatDate(booking.checkIn)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-holidaze-light-gray">
                                    Check-out:
                                  </span>
                                  <p className="text-holidaze-gray font-medium m-0 mt-1">
                                    {formatDate(booking.checkOut)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-holidaze-light-gray">
                                    Guests:
                                  </span>
                                  <p className="text-holidaze-gray font-medium m-0 mt-1">
                                    {booking.guests}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-between sm:min-w-[120px]">
                              <div className="text-right mb-4">
                                <p className="text-sm text-holidaze-light-gray m-0">
                                  Total Price
                                </p>
                                <p className="text-2xl font-bold text-holidaze-gray m-0">
                                  ${booking.totalPrice}
                                </p>
                              </div>
                              {booking.status !== 'cancelled' && (
                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleEditBooking(booking)}
                                    className="py-2 px-4 bg-black text-white border-none rounded text-sm font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
                                    Edit Booking
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleCancelBooking(booking.id)
                                    }
                                    className="py-2 px-4 bg-white text-red-600 border border-red-200 rounded text-sm font-medium cursor-pointer transition-all hover:bg-red-50">
                                    Cancel Booking
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Venues for Quick Booking */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-holidaze-gray m-0 mb-6">
                  Available Venues
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableVenues.map((venue) => (
                    <div
                      key={venue.id}
                      className="bg-white border border-holidaze-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="w-full aspect-[16/10] relative overflow-hidden">
                        <img
                          src={venue.images[0]}
                          alt={venue.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5">
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
                              {venue.rating}
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
                        <button
                          onClick={() => handleCreateBooking(venue)}
                          className="w-full py-3 px-6 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-holidaze-gray m-0 mb-6">
                Profile Settings
              </h2>

              <div className="bg-white border border-holidaze-border rounded-lg p-6 sm:p-8 max-w-2xl">
                {isLoadingProfile ? (
                  <div className="text-center py-8">
                    <p className="text-holidaze-light-gray">Loading profile...</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8">
                    <div className="flex flex-col items-center sm:items-start">
                      <div className="relative mb-4">
                        <img
                          src={profileData.avatar}
                          alt="Profile"
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-holidaze-border"
                        />
                      <label
                        htmlFor="user-avatar-upload"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-holidaze-gray transition-colors"
                        title="Change avatar">
                        <span className="text-sm">📷</span>
                        <input
                          type="file"
                          id="user-avatar-upload"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-holidaze-light-gray text-center sm:text-left">
                      Click the camera icon to update your profile picture
                    </p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <label
                        htmlFor="profile-name"
                        className="block text-sm font-medium text-holidaze-gray mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="profile-name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="profile-email"
                        className="block text-sm font-medium text-holidaze-gray mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="profile-email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <button className="py-2.5 px-5 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
                      Save Changes
                    </button>
                  </div>
                </div>
                )}

                {/* Delete Account Section */}
                <div className="mt-8 pt-8 border-t border-holidaze-border">
                  <h3 className="text-lg font-semibold text-holidaze-gray m-0 mb-2">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-holidaze-light-gray m-0 mb-4">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="py-2.5 px-5 bg-red-600 text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Booking Form Modal */}
      <BookingFormModal
        isOpen={isBookingFormOpen}
        onClose={() => {
          setIsBookingFormOpen(false);
          setSelectedVenue(null);
        }}
        onSave={handleSaveBooking}
        availableVenues={availableVenues}
        selectedVenue={selectedVenue}
      />

      {/* Edit Booking Modal */}
      {selectedBooking && selectedVenue && (
        <BookingFormModal
          isOpen={isEditBookingOpen}
          onClose={() => {
            setIsEditBookingOpen(false);
            setSelectedBooking(null);
            setSelectedVenue(null);
          }}
          onSave={handleUpdateBooking}
          availableVenues={[selectedVenue]}
          selectedVenue={selectedVenue}
          preSelectedDates={{
            checkIn: new Date(selectedBooking.checkIn),
            checkOut: new Date(selectedBooking.checkOut),
            guests: selectedBooking.guests,
          }}
          isEditMode={true}
        />
      )}
    </div>
  );
};

export default UserProfile;
