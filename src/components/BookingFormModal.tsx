import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Venue {
  id: string;
  name: string;
  location: string;
  price: number;
  maxGuests: number;
  rating: number;
  images: string[];
}

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: {
    venueId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => void;
  availableVenues: Venue[];
  selectedVenue?: Venue | null;
}

const BookingFormModal = ({
  isOpen,
  onClose,
  onSave,
  availableVenues,
  selectedVenue,
}: BookingFormModalProps) => {
  const [formData, setFormData] = useState({
    venueId: '',
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    guests: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (selectedVenue) {
        setFormData({
          venueId: selectedVenue.id,
          checkIn: null,
          checkOut: null,
          guests: 1,
        });
      } else {
        setFormData({
          venueId: '',
          checkIn: null,
          checkOut: null,
          guests: 1,
        });
      }
      setErrors({});
    }
  }, [isOpen, selectedVenue]);

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

  const selectedVenueData = availableVenues.find(
    (v) => v.id === formData.venueId
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.venueId) {
      newErrors.venueId = 'Please select a venue';
    }
    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }
    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    }
    if (formData.checkIn && formData.checkOut) {
      if (formData.checkOut <= formData.checkIn) {
        newErrors.checkOut = 'Check-out date must be after check-in date';
      }
    }
    if (
      formData.guests < 1 ||
      (selectedVenueData && formData.guests > selectedVenueData.maxGuests)
    ) {
      newErrors.guests = `Number of guests must be between 1 and ${
        selectedVenueData?.maxGuests || 'unlimited'
      }`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && formData.checkIn && formData.checkOut) {
      onSave({
        venueId: formData.venueId,
        checkIn: formData.checkIn.toISOString().split('T')[0],
        checkOut: formData.checkOut.toISOString().split('T')[0],
        guests: formData.guests,
      });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const calculateTotalPrice = () => {
    if (!formData.checkIn || !formData.checkOut || !selectedVenueData) {
      return 0;
    }
    const nights = Math.ceil(
      (formData.checkOut.getTime() - formData.checkIn.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return selectedVenueData.price * nights;
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4"
      onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-holidaze-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-holidaze-gray m-0">
            Create New Booking
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-holidaze-light-gray hover:text-holidaze-gray transition-colors cursor-pointer bg-transparent border-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-holidaze-gray mb-2">
                Select Venue *
              </label>
              <select
                value={formData.venueId}
                onChange={(e) =>
                  setFormData({ ...formData, venueId: e.target.value })
                }
                disabled={!!selectedVenue}
                className={`w-full py-3 px-4 border rounded text-[15px] bg-white text-holidaze-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.venueId ? 'border-red-300' : 'border-holidaze-border'
                } ${selectedVenue ? 'bg-gray-50 cursor-not-allowed' : ''}`}>
                <option value="">Choose a venue...</option>
                {availableVenues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} - {venue.location} (${venue.price}/night)
                  </option>
                ))}
              </select>
              {errors.venueId && (
                <p className="text-sm text-red-600 mt-1">{errors.venueId}</p>
              )}
            </div>

            {selectedVenueData && (
              <div className="bg-gray-50 border border-holidaze-border rounded-lg p-4">
                <div className="flex gap-4">
                  <img
                    src={selectedVenueData.images[0]}
                    alt={selectedVenueData.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-holidaze-gray m-0 mb-1">
                      {selectedVenueData.name}
                    </h3>
                    <p className="text-sm text-holidaze-light-gray m-0 mb-2">
                      {selectedVenueData.location}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span className="text-holidaze-gray">
                          {selectedVenueData.rating}
                        </span>
                      </div>
                      <div className="text-holidaze-gray">
                        Max guests: {selectedVenueData.maxGuests}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-holidaze-gray mb-2">
                  Check-in Date *
                </label>
                <DatePicker
                  selected={formData.checkIn}
                  onChange={(date: Date | null) =>
                    setFormData({ ...formData, checkIn: date })
                  }
                  minDate={minDate}
                  dateFormat="MMM dd, yyyy"
                  placeholderText="Select check-in date"
                  className={`w-full py-3 px-4 border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.checkIn ? 'border-red-300' : 'border-holidaze-border'
                  }`}
                />
                {errors.checkIn && (
                  <p className="text-sm text-red-600 mt-1">{errors.checkIn}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-holidaze-gray mb-2">
                  Check-out Date *
                </label>
                <DatePicker
                  selected={formData.checkOut}
                  onChange={(date: Date | null) =>
                    setFormData({ ...formData, checkOut: date })
                  }
                  minDate={
                    formData.checkIn
                      ? new Date(formData.checkIn.getTime() + 86400000)
                      : minDate
                  }
                  dateFormat="MMM dd, yyyy"
                  placeholderText="Select check-out date"
                  className={`w-full py-3 px-4 border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.checkOut
                      ? 'border-red-300'
                      : 'border-holidaze-border'
                  }`}
                />
                {errors.checkOut && (
                  <p className="text-sm text-red-600 mt-1">{errors.checkOut}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-holidaze-gray mb-2">
                Number of Guests *
              </label>
              <input
                type="number"
                min="1"
                max={selectedVenueData?.maxGuests || 20}
                value={formData.guests}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    guests: parseInt(e.target.value) || 1,
                  })
                }
                className={`w-full py-3 px-4 border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.guests ? 'border-red-300' : 'border-holidaze-border'
                }`}
                placeholder="1"
              />
              {errors.guests && (
                <p className="text-sm text-red-600 mt-1">{errors.guests}</p>
              )}
              {selectedVenueData && (
                <p className="text-sm text-holidaze-light-gray mt-1">
                  Maximum {selectedVenueData.maxGuests} guests allowed
                </p>
              )}
            </div>

            {selectedVenueData && formData.checkIn && formData.checkOut && (
              <div className="bg-gray-50 border border-holidaze-border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-holidaze-light-gray m-0">
                      Nights:{' '}
                      {Math.ceil(
                        (formData.checkOut.getTime() -
                          formData.checkIn.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </p>
                    <p className="text-sm text-holidaze-light-gray m-0">
                      Price per night: ${selectedVenueData.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-holidaze-light-gray m-0">
                      Total Price
                    </p>
                    <p className="text-2xl font-bold text-holidaze-gray m-0">
                      ${calculateTotalPrice()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-holidaze-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-5 bg-white text-holidaze-gray border border-holidaze-border rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-5 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-holidaze-gray">
              Create Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFormModal;
