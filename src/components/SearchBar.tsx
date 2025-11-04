import { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Popular cities list
const popularCities = [
  'Oslo, Norway',
  'Frankfurt, Germany',
  'Paris, France',
  'London, UK',
  'New York, USA',
  'Tokyo, Japan',
  'Berlin, Germany',
  'Rome, Italy',
  'Barcelona, Spain',
  'Amsterdam, Netherlands',
  'Vienna, Austria',
  'Prague, Czech Republic',
  'Madrid, Spain',
  'Dublin, Ireland',
  'Copenhagen, Denmark',
  'Stockholm, Sweden',
  'Helsinki, Finland',
  'Zurich, Switzerland',
  'Brussels, Belgium',
  'Athens, Greece',
  'Lisbon, Portugal',
  'Warsaw, Poland',
  'Budapest, Hungary',
  'Bucharest, Romania',
  'Sofia, Bulgaria',
  'Milan, Italy',
  'Florence, Italy',
  'Venice, Italy',
  'Munich, Germany',
  'Hamburg, Germany',
  'Cologne, Germany',
  'Manchester, UK',
  'Edinburgh, UK',
  'Glasgow, UK',
  'Birmingham, UK',
  'Los Angeles, USA',
  'Chicago, USA',
  'San Francisco, USA',
  'Miami, USA',
  'Boston, USA',
  'Seattle, USA',
  'Toronto, Canada',
  'Vancouver, Canada',
  'Montreal, Canada',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Singapore',
  'Hong Kong',
  'Bangkok, Thailand',
  'Seoul, South Korea',
];

const SearchBar = () => {
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (location.trim().length > 0) {
      const filtered = popularCities
        .filter((city) => city.toLowerCase().startsWith(location.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [location]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (city: string) => {
    setLocation(city);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <section className="w-full py-6 sm:py-10 px-4 sm:px-6 bg-white">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 flex flex-col gap-2 w-full sm:w-auto relative">
          <label className="text-sm font-medium text-holidaze-gray">
            Location
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={location}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() =>
                location.trim().length > 0 &&
                suggestions.length > 0 &&
                setShowSuggestions(true)
              }
              placeholder="Where are you going?"
              className="py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-holidaze-border rounded-lg shadow-lg max-h-60 overflow-auto">
                {suggestions.map((city, index) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSuggestionClick(city)}
                    className={`w-full text-left px-4 py-3 text-sm text-holidaze-gray hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-gray-50' : ''
                    } ${
                      index !== suggestions.length - 1
                        ? 'border-b border-holidaze-border'
                        : ''
                    }`}>
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
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
