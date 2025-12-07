import { useState, useEffect } from 'react';
import { profilesApi, getUserData } from '../services/api';

interface AvatarUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  userName: string;
  onAvatarUpdated: (newAvatar: string) => void;
}

const AvatarUpdateModal = ({
  isOpen,
  onClose,
  currentAvatar,
  userName,
  onAvatarUpdated,
}: AvatarUpdateModalProps) => {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAvatarUrl(currentAvatar);
      setError('');
    }
  }, [isOpen, currentAvatar]);

  // Prevent body scroll when modal is open
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate URL format
    if (
      avatarUrl &&
      !avatarUrl.startsWith('http://') &&
      !avatarUrl.startsWith('https://')
    ) {
      setError('Please enter a valid HTTP or HTTPS URL');
      return;
    }

    setIsLoading(true);

    try {
      const userData = getUserData();
      const profileName = userData?.name || userName;

      await profilesApi.updateProfile(
        {
          name: profileName,
          avatar: {
            url: avatarUrl,
            alt: userName || 'Profile avatar',
          },
        },
        profileName
      );

      onAvatarUpdated(avatarUrl);
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to save avatar. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-modal-title">
      <div className="bg-white rounded-lg shadow-xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-holidaze-border px-6 py-4 flex justify-between items-center">
          <h2 id="avatar-modal-title" className="text-2xl font-bold text-holidaze-gray m-0">
            Update Profile Picture
          </h2>
          <button
            onClick={onClose}
            aria-label="Close update avatar modal"
            className="text-holidaze-light-gray hover:text-holidaze-gray text-2xl leading-none bg-transparent border-none cursor-pointer p-0 w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label
                htmlFor="avatar-url-input"
                className="block text-sm font-medium text-holidaze-gray mb-3">
                Image URL
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={avatarUrl || currentAvatar}
                      alt="Avatar preview"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-[3px] border-white shadow-md"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop';
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="url"
                    id="avatar-url-input"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full py-3 px-4 border border-holidaze-border rounded-lg text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-[#0369a1] focus:border-[#0369a1] transition-all"
                    required
                  />
                  <p className="text-xs text-holidaze-light-gray mt-2 leading-relaxed">
                    Enter a valid image URL (HTTP or HTTPS). You can use image
                    hosting services like Unsplash, Imgur, or any public image
                    URL.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 text-sm sm:text-base font-medium rounded cursor-pointer transition-all border border-holidaze-border bg-white text-holidaze-gray hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-6 text-sm sm:text-base font-medium rounded cursor-pointer transition-all border-none bg-[#0369a1] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Saving...' : 'Save Avatar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpdateModal;
