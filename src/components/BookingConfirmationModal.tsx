import { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    venueName: string;
    venueImage: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    bookingId?: string;
  } | null;
}

const BookingConfirmationModal = ({
  isOpen,
  onClose,
  bookingData,
}: BookingConfirmationModalProps) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen || !bookingData) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6 sm:p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">✓</span>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-6">
            <h2 id="confirmation-modal-title" className="text-2xl sm:text-3xl font-bold text-holidaze-gray m-0 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-base text-holidaze-light-gray m-0">
              Your booking has been successfully created
            </p>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 border border-holidaze-border rounded-lg p-6 mb-6">
            <div className="flex gap-4 mb-4">
              <img
                src={bookingData.venueImage}
                alt={`${bookingData.venueName} - Booking confirmation`}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-holidaze-gray m-0 mb-1">
                  {bookingData.venueName}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-holidaze-light-gray">Check-in:</span>
                    <span className="text-holidaze-gray font-medium">
                      {formatDate(bookingData.checkIn)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-holidaze-light-gray">Check-out:</span>
                    <span className="text-holidaze-gray font-medium">
                      {formatDate(bookingData.checkOut)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-holidaze-light-gray">Guests:</span>
                    <span className="text-holidaze-gray font-medium">
                      {bookingData.guests}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-holidaze-border">
                    <span className="text-holidaze-light-gray font-medium">
                      Total Price:
                    </span>
                    <span className="text-xl font-bold text-holidaze-gray">
                      {bookingData.totalPrice} kr
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-5 bg-white text-holidaze-gray border border-holidaze-border rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-gray-100">
              Close
            </button>
            <Link
              to="/user/profile"
              onClick={onClose}
              className="flex-1 py-2.5 px-5 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all hover:bg-holidaze-gray text-center no-underline">
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
