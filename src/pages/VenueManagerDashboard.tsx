import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VenueFormModal from '../components/VenueFormModal';

interface Venue {
  id: string;
  name: string;
  location: string;
  price: number;
  maxGuests: number;
  rating: number;
  images: string[];
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

  // Sample data - replace with actual API data
  const [venues, setVenues] = useState<Venue[]>([
    {
      id: '1',
      name: 'Luxury Beach Villa',
      location: 'Malibu, California',
      price: 450,
      maxGuests: 8,
      rating: 4.9,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&h=400&fit=crop',
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
  ]);

  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      venueName: 'Luxury Beach Villa',
      guestName: 'Sarah Johnson',
      checkIn: '2024-02-15',
      checkOut: '2024-02-20',
      guests: 4,
      totalPrice: 2250,
      status: 'confirmed',
    },
    {
      id: '2',
      venueName: 'Modern City Apartment',
      guestName: 'Michael Chen',
      checkIn: '2024-02-22',
      checkOut: '2024-02-25',
      guests: 2,
      totalPrice: 540,
      status: 'confirmed',
    },
    {
      id: '3',
      venueName: 'Luxury Beach Villa',
      guestName: 'Emma Williams',
      checkIn: '2024-03-01',
      checkOut: '2024-03-05',
      guests: 6,
      totalPrice: 1800,
      status: 'pending',
    },
  ]);

  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  });

  const handleCreateVenue = () => {
    setEditingVenue(null);
    setIsVenueFormOpen(true);
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setIsVenueFormOpen(true);
  };

  const handleDeleteVenue = (venueId: string) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      setVenues(venues.filter((v) => v.id !== venueId));
    }
  };

  const handleSaveVenue = (venueData: Omit<Venue, 'id'>) => {
    if (editingVenue) {
      setVenues(
        venues.map((v) =>
          v.id === editingVenue.id ? { ...venueData, id: editingVenue.id } : v
        )
      );
    } else {
      const newVenue: Venue = {
        ...venueData,
        id: Date.now().toString(),
      };
      setVenues([...venues, newVenue]);
    }
    setIsVenueFormOpen(false);
    setEditingVenue(null);
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
                  className="py-2.5 px-5 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
                  + Create New Venue
                </button>
              </div>

              {venues.length === 0 ? (
                <div className="bg-white border border-holidaze-border rounded-lg p-12 text-center">
                  <p className="text-base text-holidaze-light-gray mb-4">
                    You haven't created any venues yet.
                  </p>
                  <button
                    onClick={handleCreateVenue}
                    className="py-2.5 px-5 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
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
              <h2 className="text-2xl font-bold text-holidaze-gray m-0 mb-6">
                Upcoming Bookings ({bookings.length})
              </h2>

              {bookings.length === 0 ? (
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
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8">
                  <div className="flex flex-col items-center sm:items-start">
                    <div className="relative mb-4">
                      <img
                        src={profileData.avatar}
                        alt="Profile"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-holidaze-border"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-holidaze-gray transition-colors"
                        title="Change avatar">
                        <span className="text-sm">📷</span>
                        <input
                          type="file"
                          id="avatar-upload"
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
    </div>
  );
};

export default VenueManagerDashboard;
