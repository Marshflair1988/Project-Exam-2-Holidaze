import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setAccessToken, setUserData } from '../services/api';

interface VenueManagerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
  onSwitchToUser?: () => void;
}

const VenueManagerRegisterModal = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onSwitchToUser,
}: VenueManagerRegisterModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCompanyName('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Validate name (no punctuation except underscore, spaces allowed)
    if (!/^[a-zA-Z0-9_ ]+$/.test(name)) {
      setError(
        'Name can only contain letters, numbers, underscores, and spaces'
      );
      return;
    }

    // Validate email (must be stud.noroff.no)
    if (!email.endsWith('@stud.noroff.no')) {
      setError('Email must be a valid stud.noroff.no email address');
      return;
    }

    setIsLoading(true);

    try {
      // Replace spaces with underscores for API (API doesn't accept spaces)
      const apiName = name.replace(/\s+/g, '_');

      const response = await authApi.register({
        name: apiName,
        email,
        password,
        venueManager: true,
        bio: companyName ? `Company: ${companyName}` : undefined,
      });

      console.log('✅ Registration response:', response);

      // Registration successful - now automatically log in to get access token
      if (response.data && response.data.name) {
        // Get venueManager status from registration response (we registered with venueManager: true)
        const isVenueManager = response.data.venueManager ?? true; // Default to true since we registered as venue manager

        console.log('✅ Registration successful! Logging in automatically...', {
          name: response.data.name,
          email: response.data.email,
          venueManager: isVenueManager,
        });

        try {
          // Automatically log in with the same credentials to get access token
          const loginResponse = await authApi.login({
            email: email,
            password: password,
          });

          if (loginResponse.data && loginResponse.data.accessToken) {
            console.log('✅ Auto-login successful!', {
              name: loginResponse.data.name,
              email: loginResponse.data.email,
              venueManager: isVenueManager,
            });

            // Use venueManager from registration response since login might not include it
            setAccessToken(loginResponse.data.accessToken);
            setUserData({
              name: loginResponse.data.name || response.data.name,
              email: loginResponse.data.email || response.data.email,
              bio: loginResponse.data.bio || response.data.bio,
              avatar: loginResponse.data.avatar || response.data.avatar,
              banner: loginResponse.data.banner || response.data.banner,
              venueManager: isVenueManager, // Use from registration response
            });

            // Show success message
            setError('');
            alert('Registration successful! Welcome to Holidaze!');

            onClose();
            // Redirect to venue manager dashboard
            navigate('/venue-manager/dashboard');
          } else {
            console.error(
              '❌ Auto-login failed - no accessToken:',
              loginResponse
            );
            setError(
              'Registration successful, but login failed. Please try logging in manually.'
            );
          }
        } catch (loginErr: unknown) {
          console.error('❌ Auto-login error:', loginErr);
          setError(
            'Registration successful, but automatic login failed. Please try logging in manually.'
          );
        }
      } else {
        console.error('❌ Registration failed:', response);
        setError('Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.';

      // Provide more helpful message if profile already exists
      if (
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('profile already')
      ) {
        setError(
          'This username or email is already taken. The API requires both email AND username to be unique. If you have an account, please try logging in. Otherwise, try adding numbers or variations to your username (e.g., "john_smith_123").'
        );
      } else {
        setError(errorMessage);
      }
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
            Venue Manager Registration
          </h2>
          <button
            onClick={onClose}
            className="text-holidaze-light-gray hover:text-holidaze-gray text-2xl leading-none bg-transparent border-none cursor-pointer p-0 w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-base text-holidaze-light-gray mb-6 text-center">
            Create an account to start managing your venues
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="modal-vm-name"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Full Name (Username)
              </label>
              <input
                type="text"
                id="modal-vm-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your full name"
              />
              <p className="mt-1 text-xs text-holidaze-light-gray">
                Note: Your username must be unique. If taken, try adding numbers
                (e.g., "john_smith_123")
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="modal-vm-company"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Company Name (Optional)
              </label>
              <input
                type="text"
                id="modal-vm-company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your company name"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="modal-vm-email"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Email
              </label>
              <input
                type="email"
                id="modal-vm-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="modal-vm-password"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Password
              </label>
              <input
                type="password"
                id="modal-vm-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your password (min. 8 characters)"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="modal-vm-confirm-password"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="modal-vm-confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 px-6 sm:px-8 text-sm sm:text-base font-medium rounded cursor-pointer transition-all border-none bg-black text-white hover:bg-holidaze-gray mb-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="text-center text-sm text-holidaze-light-gray">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-black font-medium hover:underline bg-transparent border-none cursor-pointer p-0">
                Sign in here
              </button>
            </div>

            {onSwitchToUser && (
              <div className="mt-4 pt-4 border-t border-holidaze-border text-center">
                <button
                  type="button"
                  onClick={onSwitchToUser}
                  className="text-sm text-holidaze-light-gray hover:text-holidaze-gray transition-colors bg-transparent border-none cursor-pointer p-0">
                  Are you a customer? Register here
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default VenueManagerRegisterModal;
