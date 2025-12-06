import { Link } from 'react-router-dom';

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
  const getImageUrl = (imageType: string) => {
    const images: Record<string, string> = {
      'beach-villa':
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
      'city-apartment':
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
      'mountain-cabin':
        'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600&h=400&fit=crop',
    };
    return images[imageType] || images['beach-villa'];
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
      <div className="w-full aspect-[16/10] relative overflow-hidden">
        <img
          src={getImageUrl(venue.image)}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          aria-hidden="true"
        />
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
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
              {venue.price} kr
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
        <Link
          to={`/venue/${venue.id}`}
          className="py-3 px-6 bg-[#0369a1] text-white border-none rounded text-[15px] font-medium cursor-pointer transition-all mt-auto hover:opacity-90 no-underline text-center block">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default VenueCard;
