const SearchBar = () => {
  return (
    <section className="w-full py-10 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto flex gap-4 items-end">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-holidaze-gray">
            Location
          </label>
          <input
            type="text"
            placeholder="Where are you going?"
            className="py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full placeholder:text-holidaze-lighter-gray"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-holidaze-gray">
            Check-in
          </label>
          <input
            type="text"
            placeholder="mm/dd/yyyy"
            className="py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full placeholder:text-holidaze-lighter-gray"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-holidaze-gray">
            Check-out
          </label>
          <input
            type="text"
            placeholder="mm/dd/yyyy"
            className="py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray w-full placeholder:text-holidaze-lighter-gray"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
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
        <button className="py-3 px-6 bg-black text-white border-none rounded text-base font-medium cursor-pointer flex items-center gap-2 transition-colors h-fit hover:bg-holidaze-gray">
          <span className="text-base">🔍</span>
          Search
        </button>
      </div>
    </section>
  );
};

export default SearchBar;
