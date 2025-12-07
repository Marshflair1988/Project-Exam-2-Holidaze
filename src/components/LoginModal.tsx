import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  authApi,
  profilesApi,
  setAccessToken,
  setUserData,
} from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  message?: string;
}

const LoginModal = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  message,
}: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

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
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);

        // Fetch user profile to get complete user data including venueManager status
        let venueManager = false;
        try {
          const profileResponse = await profilesApi.getProfile(
            response.data.name
          );
          if (profileResponse.data) {
            const profile = profileResponse.data as { venueManager?: boolean };
            venueManager = profile.venueManager || false;
          }
        } catch (profileErr) {
          // Could not fetch profile
        }

        setUserData({
          name: response.data.name,
          email: response.data.email,
          bio: response.data.bio,
          avatar: response.data.avatar,
          banner: response.data.banner,
          venueManager: venueManager,
        });

        onClose();
        // Redirect based on user type
        if (venueManager) {
          // Venue manager - redirect to admin dashboard
          navigate('/venue-manager/dashboard');
        } else {
          // Regular user - redirect to user dashboard
          navigate('/user/profile');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.';
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
      aria-labelledby="login-modal-title">
      <div className="bg-white rounded-lg shadow-xl max-w-[450px] w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-holidaze-border px-6 py-4 flex justify-between items-center">
          <h2 id="login-modal-title" className="text-2xl font-bold text-holidaze-gray m-0">
            Login
          </h2>
          <button
            onClick={onClose}
            aria-label="Close login modal"
            className="text-holidaze-light-gray hover:text-holidaze-gray text-2xl leading-none bg-transparent border-none cursor-pointer p-0 w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {message && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm text-center">
              {message}
            </div>
          )}
          <p className="text-base text-holidaze-light-gray mb-6 text-center">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="modal-login-email"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Email
              </label>
              <input
                type="email"
                id="modal-login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="modal-login-password"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Password
              </label>
              <input
                type="password"
                id="modal-login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 px-6 sm:px-8 text-sm sm:text-base font-medium rounded cursor-pointer transition-all border-none bg-[#0369a1] text-white hover:opacity-90 mb-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center text-sm text-holidaze-light-gray">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#0369a1] font-medium hover:underline bg-transparent border-none cursor-pointer p-0">
                Sign up here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

