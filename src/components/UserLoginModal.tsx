import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setAccessToken, setUserData } from '../services/api';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToVenueManager?: () => void;
}

const UserLoginModal = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToVenueManager,
}: UserLoginModalProps) => {
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
        console.log('✅ Login successful!', {
          name: response.data.name,
          email: response.data.email,
          venueManager: response.data.venueManager,
        });
        
        setAccessToken(response.data.accessToken);
        setUserData({
          name: response.data.name,
          email: response.data.email,
          bio: response.data.bio,
          avatar: response.data.avatar,
          banner: response.data.banner,
          venueManager: response.data.venueManager,
        });
        
        onClose();
        // Redirect to user dashboard for regular users
        navigate('/user/profile');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
      onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-[450px] w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-holidaze-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-holidaze-gray m-0">
            User Login
          </h2>
          <button
            onClick={onClose}
            className="text-holidaze-light-gray hover:text-holidaze-gray text-2xl leading-none bg-transparent border-none cursor-pointer p-0 w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-base text-holidaze-light-gray mb-6 text-center">
            Sign in to your account to browse and book venues
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
              className="w-full py-3 sm:py-3.5 px-6 sm:px-8 text-sm sm:text-base font-medium rounded cursor-pointer transition-all border-none bg-black text-white hover:bg-holidaze-gray mb-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center text-sm text-holidaze-light-gray">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-black font-medium hover:underline bg-transparent border-none cursor-pointer p-0">
                Sign up here
              </button>
            </div>

            {onSwitchToVenueManager && (
              <div className="mt-4 pt-4 border-t border-holidaze-border text-center">
                <button
                  type="button"
                  onClick={onSwitchToVenueManager}
                  className="text-sm text-holidaze-light-gray hover:text-holidaze-gray transition-colors bg-transparent border-none cursor-pointer p-0">
                  Are you a venue manager? Sign in here
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserLoginModal;
