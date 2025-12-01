import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VenueFormModal from '../components/VenueFormModal';
import AvatarUpdateModal from '../components/AvatarUpdateModal';
import {
  getAccessToken,
  getUserData,
  setUserData,
  removeAccessToken,
  removeUserData,
  venuesApi,
  profilesApi,
  bookingsApi,
} from '../services/api';

interface Venue {
  id: string;
  name: string;
  location: string;
  price: number;
  maxGuests: number;
  rating: number;
  images: string[];
  description?: string;
  amenities?: string[];
}

interface Booking {
  id: string;
  venueName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const VenueManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'venues' | 'bookings' | 'profile'>(
    'venues'
  );
  const [isVenueFormOpen, setIsVenueFormOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isFetchingVenues, setIsFetchingVenues] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check authentication and authorization
  useEffect(() => {
    const token = getAccessToken();
    const userData = getUserData();

    if (!token || !userData) {
      // Not logged in - redirect to login
      navigate('/login/venue-manager');
      return;
    }

    if (!userData.venueManager) {
      // Not a venue manager - redirect to user profile
      navigate('/user/profile');
      return;
    }
  }, [navigate]);

  // Fetch venues from API
  const [venues, setVenues] = useState<Venue[]>([]);

  // Transform API venue data to our Venue interface
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
      owner?: {
        name?: string;
        email?: string;
      };
      meta?: {
        wifi?: boolean;
        parking?: boolean;
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
    if (venue.meta?.pets) amenities.push('Pet Friendly');

    return {
      id: venue.id,
      name: venue.name,
      location: locationString,
      price: venue.price || 0,
      maxGuests: venue.maxGuests || 0,
      rating: venue.rating || 0,
      images: images,
      description: venue.description,
      amenities: amenities.length > 0 ? amenities : undefined,
    };
  };

  // Fetch venues on component mount
  useEffect(() => {
    const fetchVenues = async () => {
      const token = getAccessToken();
      const userData = getUserData();

      if (!token || !userData || !userData.venueManager) {
        return;
      }

      setIsFetchingVenues(true);
      setError(null);

      try {
        // Use the profile-specific endpoint to get only venues owned by the current user
        const response = await venuesApi.getByProfile(userData.name);

        if (response.data && Array.isArray(response.data)) {
          // The profile-specific endpoint already filters by owner, so we just need to transform
          const transformedVenues = response.data
            .map((venue) => transformVenueData(venue))
            .filter((venue): venue is Venue => venue !== null);

          setVenues(transformedVenues);
        } else {
          setVenues([]);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load venues. Please try again.';
        setError(errorMessage);
        setVenues([]);
      } finally {
        setIsFetchingVenues(false);
      }
    };

    fetchVenues();
  }, []);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch profile data from API
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
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
          });
        }
      } catch (err: unknown) {
        // Fallback to stored user data
        const userData = getUserData();
        if (userData) {
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            avatar:
              userData.avatar?.url ||
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
          });
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, []);

  // Function to fetch bookings for all venues owned by the venue manager
  const refreshBookings = async () => {
    const userData = getUserData();
    if (!userData?.name || !userData.venueManager) {
      setIsLoadingBookings(false);
      return;
    }

    setIsLoadingBookings(true);
    try {
      // Use current venues state if available, otherwise fetch from API
      let venueIds: string[] = [];

      if (venues.length > 0) {
        // Use existing venues
        venueIds = venues.map((v) => v.id);
      } else {
        // Fetch venues if not already loaded
        const venuesResponse = await venuesApi.getByProfile(userData.name);
        if (venuesResponse.data && Array.isArray(venuesResponse.data)) {
          venueIds = venuesResponse.data
            .map((venue: unknown) => {
              const v = venue as { id?: string };
              return v.id;
            })
            .filter((id): id is string => !!id);
        }
      }

      if (venueIds.length === 0) {
        setBookings([]);
        setIsLoadingBookings(false);
        return;
      }

      // Fetch bookings for each venue using the bookings API endpoint
      const allBookings: Booking[] = [];
      for (const venueId of venueIds) {
        try {
          // Use bookingsApi.getByVenue which includes customer information
          const venueResponse = await bookingsApi.getByVenue(venueId);
          const venue = venueResponse.data as {
            id?: string;
            name?: string;
            price?: number;
            bookings?: Array<{
              id?: string;
              dateFrom?: string;
              dateTo?: string;
              guests?: number;
              customer?: { name?: string; email?: string };
            }>;
          };

          if (venue.bookings && Array.isArray(venue.bookings)) {
            const venueBookings = venue.bookings
              .filter((b) => b.id && b.dateFrom && b.dateTo)
              .map((b) => {
                const checkInDate = new Date(b.dateFrom!);
                const checkOutDate = new Date(b.dateTo!);
                const nights = Math.ceil(
                  (checkOutDate.getTime() - checkInDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                const venuePrice = venue.price || 0;
                const totalPrice = venuePrice * nights;

                return {
                  id: b.id!,
                  venueName: venue.name || 'Unknown Venue',
                  guestName: b.customer?.name || 'Unknown Guest',
                  checkIn: b.dateFrom!,
                  checkOut: b.dateTo!,
                  guests: b.guests || 1,
                  totalPrice,
                  status: 'confirmed' as const,
                };
              });

            allBookings.push(...venueBookings);
          }
        } catch (err) {
          // Could not fetch bookings for venue
        }
      }

      // Sort bookings by check-in date (upcoming first)
      allBookings.sort((a, b) => {
        const dateA = new Date(a.checkIn).getTime();
        const dateB = new Date(b.checkIn).getTime();
        return dateA - dateB;
      });

      setBookings(allBookings);
    } catch (err) {
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch bookings when component mounts or when venues change
  useEffect(() => {
    // Only fetch bookings if we have venues or if venues are still loading
    if (venues.length > 0 || !isFetchingVenues) {
      refreshBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues.length]); // Refresh when number of venues changes

  // Refresh bookings when bookings tab is opened
  useEffect(() => {
    if (activeTab === 'bookings' && venues.length > 0) {
      refreshBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Refresh when bookings tab is activated

  // Refresh venues after creating/updating/deleting
  const refreshVenues = async () => {
    const token = getAccessToken();
    const userData = getUserData();

    if (!token || !userData || !userData.venueManager) {
      return;
    }

    try {
      // Use the profile-specific endpoint to get only venues owned by the current user
      const response = await venuesApi.getByProfile(userData.name);
      if (response.data && Array.isArray(response.data)) {
        // The profile-specific endpoint already filters by owner, so we just need to transform
        const transformedVenues = response.data
          .map((venue) => transformVenueData(venue))
          .filter((venue): venue is Venue => venue !== null);
        setVenues(transformedVenues);

        // Refresh bookings after venues are updated
        await refreshBookings();
      }
    } catch (err: unknown) {
      // Error refreshing venues
    }
  };

  const handleCreateVenue = () => {
    setEditingVenue(null);
    setIsVenueFormOpen(true);
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setIsVenueFormOpen(true);
  };

  const handleDeleteVenue = async (venueId: string) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) {
      return;
    }

    setError(null);

    try {
      await venuesApi.delete(venueId);

      // Refresh venues list after successful delete
      await refreshVenues();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to delete venue. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleSaveVenue = async (venueData: Omit<Venue, 'id'>) => {
    setError(null);

    try {
      // Format data for API
      // Filter out empty images and base64 data URLs (API only accepts HTTP/HTTPS URLs)
      const validImages = venueData.images
        .filter((img) => img.trim() !== '')
        .filter((img) => {
          // Only accept HTTP/HTTPS URLs, not base64 data URLs
          const trimmed = img.trim();
          return (
            trimmed.startsWith('http://') || trimmed.startsWith('https://')
          );
        });

      if (validImages.length === 0) {
        throw new Error(
          'At least one valid image URL (HTTP/HTTPS) is required. Base64 images are not supported. Please use image URLs instead.'
        );
      }

      // Parse location - try to extract city and country
      const locationParts = venueData.location.split(',').map((p) => p.trim());
      const city = locationParts[0] || venueData.location;
      const country = locationParts[1] || venueData.location;

      const apiData: Record<string, unknown> = {
        name: venueData.name.trim(),
        description: (venueData.description || venueData.name).trim(), // Description is required
        media: validImages.map((url) => ({
          url: url.trim(),
          alt: venueData.name.trim(),
        })),
        price: Number(venueData.price),
        maxGuests: Number(venueData.maxGuests),
        location: {
          address: venueData.location.trim(),
          city: city.trim(),
          zip: '',
          country: country.trim(),
          continent: '',
          lat: 0,
          lng: 0,
        },
        meta: {
          wifi: venueData.amenities?.includes('WiFi') || false,
          parking: venueData.amenities?.includes('Parking') || false,
          breakfast: false,
          pets: venueData.amenities?.includes('Pet Friendly') || false,
        },
      };

      // Don't include rating on creation (it's calculated by the API)
      // Only include rating when updating if it exists
      if (editingVenue && venueData.rating) {
        apiData.rating = venueData.rating;
      }

      if (editingVenue) {
        // Update existing venue
        const response = await venuesApi.update(editingVenue.id, apiData);
        if (response.data) {
          const updatedVenue: Venue = {
            id: editingVenue.id,
            name: (response.data as { name?: string }).name || venueData.name,
            location: venueData.location,
            price:
              (response.data as { price?: number }).price || venueData.price,
            maxGuests:
              (response.data as { maxGuests?: number }).maxGuests ||
              venueData.maxGuests,
            rating:
              (response.data as { rating?: number }).rating ||
              venueData.rating ||
              0,
            images: venueData.images,
            description: venueData.description,
            amenities: venueData.amenities,
          };
          setVenues(
            venues.map((v) => (v.id === editingVenue.id ? updatedVenue : v))
          );
        }
      } else {
        // Create new venue
        const response = await venuesApi.create(apiData);
        if (response.data) {
          const venueResponse = response.data as {
            id?: string;
            name?: string;
            price?: number;
            maxGuests?: number;
            rating?: number;
            media?: Array<{ url?: string; alt?: string }>;
          };

          const newVenue: Venue = {
            id: venueResponse.id || Date.now().toString(),
            name: venueResponse.name || venueData.name,
            location: venueData.location,
            price: venueResponse.price || venueData.price,
            maxGuests: venueResponse.maxGuests || venueData.maxGuests,
            rating: venueResponse.rating || venueData.rating || 0,
            images:
              venueResponse.media?.map((m) => m.url || '') || venueData.images,
            description: venueData.description,
            amenities: venueData.amenities,
          };
          setVenues([...venues, newVenue]);
        }
      }

      setIsVenueFormOpen(false);
      setEditingVenue(null);

      // Refresh venues list after successful save
      await refreshVenues();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to save venue. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleAvatarUpdated = (newAvatar: string) => {
    // Update local state
    setProfileData({
      ...profileData,
      avatar: newAvatar,
    });

    // Update user data in localStorage
    const userData = getUserData();
    if (userData) {
      setUserData({
        ...userData,
        avatar: {
          url: newAvatar,
          alt: profileData.name || 'Profile avatar',
        },
      });
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
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-holidaze-gray m-0 mb-2 tracking-tight">
              Venue Manager Dashboard
            </h1>
            <p className="text-base text-holidaze-light-gray m-0">
              Manage your venues, bookings, and profile
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-holidaze-border">
            <button
              onClick={() => setActiveTab('venues')}
              className={`py-3 px-6 border-b-2 border-transparent text-[15px] font-medium transition-colors ${
                activeTab === 'venues'
                  ? 'border-black text-black'
                  : 'text-holidaze-light-gray hover:text-holidaze-gray'
              }`}>
              My Venues
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-3 px-6 border-b-2 border-transparent text-[15px] font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'border-black text-black'
                  : 'text-holidaze-light-gray hover:text-holidaze-gray'
              }`}>
              Upcoming Bookings
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

          {/* Venues Tab */}
          {activeTab === 'venues' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-holidaze-gray m-0">
                  My Venues ({venues.length})
                </h2>
                <button
                  onClick={handleCreateVenue}
                  className="py-2.5 px-5 bg-[#0369a1] text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:opacity-90">
                  + Create New Venue
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              {isFetchingVenues ? (
                <div className="bg-white border border-holidaze-border rounded-lg p-12 text-center">
                  <p className="text-base text-holidaze-light-gray">
                    Loading venues...
                  </p>
                </div>
              ) : venues.length === 0 ? (
                <div className="bg-white border border-holidaze-border rounded-lg p-12 text-center">
                  <p className="text-base text-holidaze-light-gray mb-4">
                    You haven't created any venues yet.
                  </p>
                  <button
                    onClick={handleCreateVenue}
                    className="py-2.5 px-5 bg-[#0369a1] text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:opacity-90">
                    Create Your First Venue
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {venues.map((venue) => (
                    <div
                      key={venue.id}
                      className="bg-white border border-holidaze-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="w-full aspect-[16/10] relative overflow-hidden">
                        <img
                          src={venue.images?.[0] || ''}
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
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditVenue(venue)}
                              className="flex-1 py-2.5 px-4 bg-white text-holidaze-gray border border-holidaze-border rounded text-sm font-medium cursor-pointer transition-all hover:bg-gray-100">
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVenue(venue.id)}
                              className="flex-1 py-2.5 px-4 bg-white text-red-600 border border-red-200 rounded text-sm font-medium cursor-pointer transition-all hover:bg-red-50">
                              Delete
                            </button>
                          </div>
                          <button
                            onClick={() => navigate(`/venue/${venue.id}`)}
                            className="w-full py-2.5 px-4 bg-[#0369a1] text-white border-none rounded text-sm font-medium cursor-pointer transition-all hover:opacity-90">
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-holidaze-gray m-0">
                  Upcoming Bookings ({bookings.length})
                </h2>
                <button
                  onClick={refreshBookings}
                  disabled={isLoadingBookings}
                  className="py-2.5 px-5 bg-white text-holidaze-gray border border-holidaze-border rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoadingBookings ? 'Refreshing...' : 'Refresh'}
                </button>
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
                    You don't have any upcoming bookings yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-holidaze-border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-holidaze-gray m-0 mb-1">
                                {booking.venueName}
                              </h3>
                              <p className="text-[15px] text-holidaze-light-gray m-0">
                                Guest: {booking.guestName}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                booking.status
                              )}`}>
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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
                          <div className="text-right mb-2">
                            <p className="text-sm text-holidaze-light-gray m-0">
                              Total Price
                            </p>
                            <p className="text-2xl font-bold text-holidaze-gray m-0">
                              ${booking.totalPrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    <p className="text-holidaze-light-gray">
                      Loading profile...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 mb-8">
                    <div className="bg-gray-50 border border-holidaze-border rounded-lg p-6">
                      <label className="block text-sm font-semibold text-holidaze-gray mb-4">
                        Profile Picture
                      </label>
                      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <img
                              src={profileData.avatar}
                              alt="Profile"
                              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-[3px] border-white shadow-md"
                              onError={(e) => {
                                e.currentTarget.src =
                                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop';
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center sm:items-start">
                          <button
                            type="button"
                            onClick={() => setIsAvatarModalOpen(true)}
                            className="py-2.5 px-5 bg-[#0369a1] text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:opacity-90">
                            Update Avatar
                          </button>
                          <p className="text-xs text-holidaze-light-gray mt-3 text-center sm:text-left">
                            Click to update your profile picture with an image
                            URL
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-holidaze-gray mb-2">
                          Name
                        </label>
                        <input
                          type="text"
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
                        <label className="block text-sm font-medium text-holidaze-gray mb-2">
                          Email
                        </label>
                        <input
                          type="email"
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

                    {/* Delete Account Section */}
                    <div className="mt-8 pt-8 border-t border-holidaze-border">
                      <h3 className="text-lg font-semibold text-holidaze-gray m-0 mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-holidaze-light-gray m-0 mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="py-2.5 px-5 bg-red-600 text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Venue Form Modal */}
      <VenueFormModal
        isOpen={isVenueFormOpen}
        onClose={() => {
          setIsVenueFormOpen(false);
          setEditingVenue(null);
        }}
        onSave={handleSaveVenue}
        editingVenue={editingVenue}
      />

      {/* Avatar Update Modal */}
      <AvatarUpdateModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={profileData.avatar}
        userName={profileData.name}
        onAvatarUpdated={handleAvatarUpdated}
      />
    </div>
  );
};

export default VenueManagerDashboard;
