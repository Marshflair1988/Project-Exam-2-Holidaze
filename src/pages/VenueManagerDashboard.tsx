import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VenueDetails = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Sample data - replace with actual API data
  const venueData = {
    name: 'Luxury Beach Villa',
    location: 'Malibu, California',
    description:
      'Experience the ultimate in luxury beachfront living at our stunning villa. With breathtaking ocean views, private beach access, and world-class amenities, this is the perfect escape for your next vacation. The property features spacious rooms, a fully equipped kitchen, and a stunning infinity pool.',
    rating: 4.9,
    totalReviews: 127,
    amenities: [
      { icon: '🏊', name: 'Infinity Pool' },
      { icon: '🏖️', name: 'Private Beach Access' },
      { icon: '🅿️', name: 'Free Parking' },
      { icon: '🌐', name: 'WiFi' },
      { icon: '🍳', name: 'Full Kitchen' },
      { icon: '🧺', name: 'Laundry' },
      { icon: '❄️', name: 'Air Conditioning' },
      { icon: '🔥', name: 'Fireplace' },
      { icon: '📺', name: 'Smart TV' },
      { icon: '🏋️', name: 'Gym Access' },
    ],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop',
    ],
    rooms: [
      { type: 'Master Suite', available: 2, price: 450, capacity: 2 },
      { type: 'Ocean View Room', available: 3, price: 350, capacity: 2 },
      { type: 'Standard Room', available: 4, price: 250, capacity: 2 },
      { type: 'Family Suite', available: 1, price: 550, capacity: 4 },
    ],
    reviews: [
      {
        id: 1,
        guestName: 'Sarah Johnson',
        rating: 5,
        date: '2024-01-15',
        comment:
          'Absolutely stunning property! The views were incredible and the service was exceptional. We will definitely be back!',
      },
      {
        id: 2,
        guestName: 'Michael Chen',
        rating: 5,
        date: '2024-01-10',
        comment:
          'Perfect location with easy beach access. The villa was spotless and had everything we needed. Highly recommend!',
      },
      {
        id: 3,
        guestName: 'Emma Williams',
        rating: 4,
        date: '2024-01-05',
        comment:
          'Beautiful property with great amenities. The infinity pool was the highlight of our stay. Only minor issue was the WiFi speed, but everything else was perfect.',
      },
      {
        id: 4,
        guestName: 'David Martinez',
        rating: 5,
        date: '2023-12-28',
        comment:
          'Exceeded all expectations! The staff was friendly, the rooms were spacious, and the location was perfect. Worth every penny.',
      },
    ],
    mapLocation: {
      lat: 34.0522,
      lng: -118.2437,
      address: '1234 Ocean Drive, Malibu, CA 90265',
    },
  };

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
                  src={venueData.images[selectedImage]}
                  alt={venueData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Thumbnail Gallery */}
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
          </div>
        </section>

        {/* Rooms and Pricing Section */}
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
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-holidaze-gray">
                      Available:
                    </span>
                    <span className="text-base font-semibold text-black">
                      {room.available} rooms
                    </span>
                  </div>
                  <button className="w-full py-3 px-6 bg-black text-white border-none rounded text-sm sm:text-base font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
                    Manage Availability
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
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

        {/* Map Section */}
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
      </main>
      <Footer />
    </div>
  );
};

export default VenueDetails;
