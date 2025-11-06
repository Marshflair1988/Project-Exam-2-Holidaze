import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingFormModal from '../components/BookingFormModal';
import {
  profilesApi,
  removeAccessToken,
  removeUserData,
  getUserData,
} from '../services/api';

interface Booking {
  id: string;
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
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [username, setUsername] = useState<string>('');
  const navigate = useNavigate();

  // Get username from stored user data
  useEffect(() => {
    const userData = getUserData();
    if (userData?.name) {
      setUsername(userData.name);
    }
  }, []);

  // Sample data - replace with actual API data
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      venueName: 'Luxury Beach Villa',
      venueImage:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
      checkIn: '2024-02-15',
      checkOut: '2024-02-20',
      guests: 4,
      totalPrice: 2250,
      status: 'confirmed',
    },
    {
      id: '2',
      venueName: 'Modern City Apartment',
      venueImage:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
      checkIn: '2024-02-22',
      checkOut: '2024-02-25',
      guests: 2,
      totalPrice: 540,
      status: 'confirmed',
    },
    {
      id: '3',
      venueName: 'Cozy Mountain Cabin',
      venueImage:
        'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600&h=400&fit=crop',
      checkIn: '2024-03-10',
      checkOut: '2024-03-15',
      guests: 2,
      totalPrice: 1600,
      status: 'pending',
    },
  ]);

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

  const [profileData, setProfileData] = useState({
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  });

  const handleCreateBooking = (venue?: Venue) => {
    setSelectedVenue(venue || null);
    setIsBookingFormOpen(true);
  };

  const handleSaveBooking = (bookingData: {
    venueId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => {
    const venue = availableVenues.find((v) => v.id === bookingData.venueId);
    if (!venue) return;

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = venue.price * nights;

    const newBooking: Booking = {
      id: Date.now().toString(),
      venueName: venue.name,
      venueImage: venue.images[0],
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      totalPrice,
      status: 'pending',
    };

    setBookings([...bookings, newBooking]);
    setIsBookingFormOpen(false);
    setSelectedVenue(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
        )
      );
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          avatar: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
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

              {bookings.length === 0 ? (
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
                                <button
                                  onClick={() =>
                                    handleCancelBooking(booking.id)
                                  }
                                  className="py-2 px-4 bg-white text-red-600 border border-red-200 rounded text-sm font-medium cursor-pointer transition-all hover:bg-red-50">
                                  Cancel Booking
                                </button>
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
                </div>

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
    </div>
  );
};

export default UserProfile;
