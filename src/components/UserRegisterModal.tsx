import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setAccessToken, setUserData, getAccessToken } from '../services/api';

interface UserRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
  onSwitchToVenueManager?: () => void;
}

const UserRegisterModal = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onSwitchToVenueManager,
}: UserRegisterModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    // Check if user is already logged in
    if (getAccessToken()) {
      setError('You are already logged in. Please log out first before registering a new account.');
      return;
    }

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
      setError('Name can only contain letters, numbers, underscores, and spaces');
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
      
      const registrationData = {
        name: apiName,
        email,
        password,
        venueManager: false,
      };
      
      console.log('📝 Registration attempt:', {
        originalName: name,
        apiName: apiName,
        email: email,
        venueManager: false,
      });
      
      const response = await authApi.register(registrationData);

      console.log('✅ Registration response:', response);

      // Registration successful - now automatically log in to get access token
      if (response.data && response.data.name) {
        console.log('✅ Registration successful! Logging in automatically...', {
          name: response.data.name,
          email: response.data.email,
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
            });
            
            setAccessToken(loginResponse.data.accessToken);
            setUserData({
              name: loginResponse.data.name,
              email: loginResponse.data.email,
              bio: loginResponse.data.bio,
              avatar: loginResponse.data.avatar,
              banner: loginResponse.data.banner,
              venueManager: loginResponse.data.venueManager,
            });

            // Show success message
            setError('');
            alert('Registration successful! Welcome to Holidaze!');
            
            onClose();
            // Redirect to user dashboard for regular users
            navigate('/user/profile');
          } else {
            console.error('❌ Auto-login failed - no accessToken:', loginResponse);
            setError('Registration successful, but login failed. Please try logging in manually.');
          }
        } catch (loginErr: any) {
          console.error('❌ Auto-login error:', loginErr);
          setError('Registration successful, but automatic login failed. Please try logging in manually.');
        }
      } else {
        console.error('❌ Registration failed:', response);
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.message || 'Registration failed. Please try again.';
      
      // Provide more helpful message if profile already exists
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('profile already')) {
        // Try to determine if it's email or username
        const isEmailConflict = errorMessage.toLowerCase().includes('email');
        const isUsernameConflict = errorMessage.toLowerCase().includes('name') || 
                                   errorMessage.toLowerCase().includes('username');
        
        let specificMessage = 'This username or email is already taken. ';
        if (isEmailConflict) {
          specificMessage = 'This email is already registered. Please try logging in or use a different email.';
        } else if (isUsernameConflict) {
          specificMessage = 'This username is already taken. Please try adding numbers or variations (e.g., "OrientalBanana_123").';
        } else {
          specificMessage += 'The API requires both email AND username to be unique. If you have an account, please try logging in. Otherwise, try adding numbers or variations to your username.';
        }
        
        setError(specificMessage);
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
            User Registration
          </h2>
          <button
            onClick={onClose}
            className="text-holidaze-light-gray hover:text-holidaze-gray text-2xl leading-none bg-transparent border-none cursor-pointer p-0 w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-base text-holidaze-light-gray mb-6 text-center">
            Create an account to start booking amazing venues
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="modal-name"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Full Name (Username)
              </label>
              <input
                type="text"
                id="modal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your full name"
              />
              <p className="mt-1 text-xs text-holidaze-light-gray">
                Note: Your username must be unique. If taken, try adding numbers (e.g., "john_smith_123")
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="modal-email"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Email
              </label>
              <input
                type="email"
                id="modal-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="modal-password"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Password
              </label>
              <input
                type="password"
                id="modal-password"
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
                htmlFor="modal-confirm-password"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="modal-confirm-password"
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

            {onSwitchToVenueManager && (
              <div className="mt-4 pt-4 border-t border-holidaze-border text-center">
                <button
                  type="button"
                  onClick={onSwitchToVenueManager}
                  className="text-sm text-holidaze-light-gray hover:text-holidaze-gray transition-colors bg-transparent border-none cursor-pointer p-0">
                  Are you a venue manager? Register here
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRegisterModal;
