import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SearchBar = () => {
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  return (
    <section className="w-full py-6 sm:py-10 px-4 sm:px-6 bg-white">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 flex flex-col gap-2 w-full sm:w-auto">
          <label className="text-sm font-medium text-holidaze-gray">
            Location
          </label>
          <input
            type="text"
            placeholder="Where are you going?"
            className="py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full placeholder:text-holidaze-lighter-gray"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2 w-full sm:w-auto">
          <label className="text-sm font-medium text-holidaze-gray">
            Check-in
          </label>
          <DatePicker
            selected={checkInDate}
            onChange={(date: Date | null) => setCheckInDate(date)}
            selectsStart
            startDate={checkInDate}
            endDate={checkOutDate}
            minDate={new Date()}
            placeholderText="mm/dd/yyyy"
            dateFormat="MM/dd/yyyy"
            className="py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full placeholder:text-holidaze-lighter-gray"
            wrapperClassName="w-full"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2 w-full sm:w-auto">
          <label className="text-sm font-medium text-holidaze-gray">
            Check-out
          </label>
          <DatePicker
            selected={checkOutDate}
            onChange={(date: Date | null) => setCheckOutDate(date)}
            selectsEnd
            startDate={checkInDate}
            endDate={checkOutDate}
            minDate={checkInDate || new Date()}
            placeholderText="mm/dd/yyyy"
            dateFormat="MM/dd/yyyy"
            className="py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full placeholder:text-holidaze-lighter-gray"
            wrapperClassName="w-full"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2 w-full sm:w-auto">
          <label className="text-sm font-medium text-holidaze-gray">
            Guests
          </label>
          <div className="relative">
            <select
              className="py-3 px-4 pr-9 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full appearance-none cursor-pointer"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}>
              <option>1 Guest</option>
              <option>2 Guests</option>
              <option>3 Guests</option>
              <option>4+ Guests</option>
            </select>
          </div>
        </div>
        <button className="py-3 px-6 bg-black text-white border-none rounded text-sm sm:text-base font-medium cursor-pointer flex items-center justify-center gap-2 transition-colors w-full sm:w-auto hover:bg-holidaze-gray">
          <span className="text-base">🔍</span>
          Search
        </button>
      </div>
    </section>
  );
};

export default SearchBar;
