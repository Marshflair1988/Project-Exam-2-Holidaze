interface Venue {
  id: number;
  title: string;
  location: string;
  rating: number;
  price: number;
  image: string;
}

interface VenueCardProps {
  venue: Venue;
}

const VenueCard = ({ venue }: VenueCardProps) => {
  const getGradientClasses = (imageType: string) => {
    const gradients: Record<string, string> = {
      'beach-villa': 'bg-gradient-to-br from-[#667eea] to-[#764ba2]',
      'city-apartment': 'bg-gradient-to-br from-[#f093fb] to-[#f5576c]',
      'mountain-cabin': 'bg-gradient-to-br from-[#4facfe] to-[#00f2fe]',
    };
    return gradients[imageType] || gradients['beach-villa'];
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
      <div
        className={`w-full aspect-[16/10] relative overflow-hidden flex items-center justify-center ${getGradientClasses(
          venue.image
        )}`}>
        <span
          className="text-white text-lg font-semibold z-10"
          style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          {venue.title}
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <h3 className="text-xl font-semibold text-holidaze-gray m-0">
          {venue.title}
        </h3>
        <p className="text-[15px] text-holidaze-light-gray m-0">
          {venue.location}
        </p>
        <div className="flex justify-between items-center">
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
              {' '}
              / night
            </span>
          </div>
        </div>
        <div className="flex gap-3 mt-1">
          <span className="text-lg">🛏️</span>
          <span className="text-lg">👥</span>
        </div>
        <button className="py-3 px-6 bg-black text-white border-none rounded text-[15px] font-medium cursor-pointer transition-colors mt-2 hover:bg-holidaze-gray">
          View Details
        </button>
      </div>
    </div>
  );
};

export default VenueCard;
