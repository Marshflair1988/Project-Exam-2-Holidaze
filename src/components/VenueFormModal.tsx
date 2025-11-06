import { useState, useEffect } from 'react';

interface Venue {
  id: string;
  name: string;
  location: string;
  price: number;
  maxGuests: number;
  rating: number;
  images: string[];
  description?: string;
  amenities?: string[];
}

interface VenueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (venue: Omit<Venue, 'id'>) => void;
  editingVenue?: Venue | null;
}

const VenueFormModal = ({
  isOpen,
  onClose,
  onSave,
  editingVenue,
}: VenueFormModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    maxGuests: '',
    images: [] as string[],
    description: '',
    amenities: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableAmenities = [
    'WiFi',
    'Parking',
    'Pool',
    'Kitchen',
    'Air Conditioning',
    'Heating',
    'TV',
    'Washer',
    'Dryer',
    'Pet Friendly',
    'Gym',
    'Hot Tub',
    'Fireplace',
    'Balcony',
    'Garden',
  ];

  useEffect(() => {
    if (editingVenue) {
      setFormData({
        name: editingVenue.name,
        location: editingVenue.location,
        price: editingVenue.price.toString(),
        maxGuests: editingVenue.maxGuests.toString(),
        images: editingVenue.images || [],
        description: editingVenue.description || '',
        amenities: editingVenue.amenities || [],
      });
    } else {
      setFormData({
        name: '',
        location: '',
        price: '',
        maxGuests: '',
        images: [],
        description: '',
        amenities: [],
      });
    }
    setErrors({});
  }, [editingVenue, isOpen]);

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

  const handleToggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.maxGuests || parseInt(formData.maxGuests) <= 0) {
      newErrors.maxGuests = 'Maximum guests must be at least 1';
    }
    if (!formData.images || formData.images.length === 0) {
      newErrors.images = 'At least 1 image is required (max 5)';
    } else if (formData.images.length > 5) {
      newErrors.images = 'You can upload up to 5 images';
    } else {
      // Check if all images are valid HTTP/HTTPS URLs (not base64)
      const invalidImages = formData.images.filter(
        (img) =>
          img.trim() !== '' &&
          !img.trim().startsWith('http://') &&
          !img.trim().startsWith('https://')
      );
      if (invalidImages.length > 0) {
        newErrors.images =
          'All images must be valid HTTP/HTTPS URLs. Base64 images are not supported. Please use image URLs instead.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        name: formData.name,
        location: formData.location,
        price: parseFloat(formData.price),
        maxGuests: parseInt(formData.maxGuests),
        rating: editingVenue?.rating || 0,
        images: formData.images,
        description: formData.description,
        amenities: formData.amenities,
      });
    }
  };

  const handleAddImageField = () => {
    if (formData.images.length < 5) {
      setFormData({ ...formData, images: [...formData.images, ''] });
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData({ ...formData, images: updated });
  };

  const handleRemoveImage = (index: number) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated });
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4"
      onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-holidaze-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-holidaze-gray m-0">
            {editingVenue ? 'Edit Venue' : 'Create New Venue'}
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
                Venue Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full py-3 px-4 border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-holidaze-border'
                }`}
                placeholder="e.g., Luxury Beach Villa"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-holidaze-gray mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className={`w-full py-3 px-4 border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.location ? 'border-red-300' : 'border-holidaze-border'
                }`}
                placeholder="e.g., Malibu, California"
              />
              {errors.location && (
                <p className="text-sm text-red-600 mt-1">{errors.location}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-holidaze-gray mb-2">
                  Price per Night ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={`w-full py-3 px-4 border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.price ? 'border-red-300' : 'border-holidaze-border'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-sm text-red-600 mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-holidaze-gray mb-2">
                  Maximum Guests *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxGuests}
                  onChange={(e) =>
                    setFormData({ ...formData, maxGuests: e.target.value })
                  }
                  className={`w-full py-3 px-4 border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.maxGuests
                      ? 'border-red-300'
                      : 'border-holidaze-border'
                  }`}
                  placeholder="1"
                />
                {errors.maxGuests && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.maxGuests}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-holidaze-gray mb-2">
                Images (up to 5) *
              </label>

              {/* URL inputs */}
              <div className="space-y-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={img}
                        onChange={(e) =>
                          handleImageChange(index, e.target.value)
                        }
                        className={`w-full py-3 px-4 border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                          errors.images
                            ? 'border-red-300'
                            : 'border-holidaze-border'
                        }`}
                        placeholder={`Image URL ${index + 1}`}
                      />
                      {img && (
                        <div className="mt-2">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-40 object-cover rounded border border-holidaze-border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="mt-1 py-2.5 px-4 bg-white text-red-600 border border-red-200 rounded text-sm font-medium cursor-pointer transition-all hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleAddImageField}
                  disabled={formData.images.length >= 5}
                  className="py-2.5 px-4 bg-white text-holidaze-gray border border-holidaze-border rounded text-sm font-medium cursor-pointer transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  + Add Image URL
                </button>
              </div>
              <p className="mt-2 text-xs text-holidaze-light-gray">
                Note: Only HTTP/HTTPS image URLs are supported. Please use image
                URLs from services like Unsplash, Imgur, etc.
              </p>

              {errors.images && (
                <p className="text-sm text-red-600 mt-2">{errors.images}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-holidaze-gray mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Describe your venue..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-holidaze-gray mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableAmenities.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 p-3 border border-holidaze-border rounded cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleToggleAmenity(amenity)}
                      className="w-4 h-4 text-black border-holidaze-border rounded focus:ring-black"
                    />
                    <span className="text-sm text-holidaze-gray">
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>
            </div>
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
              {editingVenue ? 'Save Changes' : 'Create Venue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VenueFormModal;
