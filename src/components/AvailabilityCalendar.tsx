import { useState, useEffect } from 'react';

interface Booking {
  dateFrom: string;
  dateTo: string;
}

interface AvailabilityCalendarProps {
  bookings: Booking[];
  className?: string;
  onDateSelect?: (date: Date) => void;
  selectedCheckIn?: Date | null;
  selectedCheckOut?: Date | null;
}

const AvailabilityCalendar = ({
  bookings,
  className = '',
  onDateSelect,
  selectedCheckIn,
  selectedCheckOut,
}: AvailabilityCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

  // Process bookings to get all booked dates
  useEffect(() => {
    const booked = new Set<string>();
    bookings.forEach((booking) => {
      const start = new Date(booking.dateFrom);
      const end = new Date(booking.dateTo);
      const current = new Date(start);

      // Mark all dates in the booking range as booked
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        booked.add(dateStr);
        current.setDate(current.getDate() + 1);
      }
    });
    setBookedDates(booked);
  }, [bookings]);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const isDateBooked = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedDates.has(dateStr);
  };

  const isDatePast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDateStatus = (date: Date | null) => {
    if (!date) return 'empty';
    if (isDatePast(date)) return 'past';
    if (isDateBooked(date)) return 'booked';
    // Check if date is selected
    if (selectedCheckIn && date.toDateString() === selectedCheckIn.toDateString()) return 'selected-checkin';
    if (selectedCheckOut && date.toDateString() === selectedCheckOut.toDateString()) return 'selected-checkout';
    // Check if date is in selected range
    if (selectedCheckIn && selectedCheckOut && date >= selectedCheckIn && date <= selectedCheckOut) return 'selected-range';
    return 'available';
  };

  const handleDateClick = (date: Date | null) => {
    if (!date || isDatePast(date) || isDateBooked(date)) return;
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-white border border-holidaze-border rounded-lg p-3 sm:p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-holidaze-gray m-0">
          Availability
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous month">
            <span className="text-sm">←</span>
          </button>
          <span className="text-xs sm:text-sm font-medium text-holidaze-gray min-w-[120px] sm:min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Next month">
            <span className="text-sm">→</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-3">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-holidaze-gray py-1">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          const status = getDateStatus(date);
          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                aspect-square flex items-center justify-center text-xs rounded transition-colors
                ${
                  status === 'empty'
                    ? ''
                    : status === 'past'
                      ? 'text-gray-300 cursor-not-allowed'
                      : status === 'booked'
                        ? 'bg-red-100 text-red-700 font-medium cursor-not-allowed'
                      : status === 'selected-checkin' || status === 'selected-checkout'
                        ? 'bg-[#0369a1] text-white font-medium cursor-pointer'
                      : status === 'selected-range'
                        ? 'bg-blue-100 text-blue-700 font-medium cursor-pointer'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                }
              `}>
              {date ? date.getDate() : ''}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-3 border-t border-holidaze-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
          <span className="text-xs text-holidaze-gray">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
          <span className="text-xs text-holidaze-gray">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-transparent border border-gray-200 rounded"></div>
          <span className="text-xs text-holidaze-gray">Past</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;

