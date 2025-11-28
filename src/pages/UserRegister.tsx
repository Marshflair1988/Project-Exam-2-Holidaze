import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authApi, setAccessToken, setUserData } from '../services/api';

const UserRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      
      const response = await authApi.register({
        name: apiName,
        email,
        password,
        venueManager: false,
      });


      // Registration successful - now automatically log in to get access token
      if (response.data && response.data.name) {
        
        try {
          // Automatically log in with the same credentials to get access token
          const loginResponse = await authApi.login({
            email: email,
            password: password,
          });

          if (loginResponse.data && loginResponse.data.accessToken) {
            
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
            alert('Registration successful! Welcome to Holidaze!');
            
            // Redirect to user dashboard for regular users
            navigate('/user/profile');
          } else {
            setError('Registration successful, but login failed. Please try logging in manually.');
          }
        } catch (loginErr: unknown) {
          setError('Registration successful, but automatic login failed. Please try logging in manually.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      
      // Provide more helpful message if profile already exists
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('profile already')) {
        setError('This username or email is already taken. The API requires both email AND username to be unique. If you have an account, please try logging in. Otherwise, try adding numbers or variations to your username (e.g., "john_smith_123").');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full flex items-center justify-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="w-full max-w-[450px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-holidaze-gray m-0 tracking-tight">
              User Registration
            </h1>
            <p className="text-base text-holidaze-light-gray mt-2 sm:mt-3">
              Create an account to start booking amazing venues
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-holidaze-border rounded-lg p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Full Name (Username)
              </label>
              <input
                type="text"
                id="name"
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
                htmlFor="email"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 px-4 border border-holidaze-border rounded text-[15px] bg-white text-holidaze-gray placeholder:text-holidaze-lighter-gray focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
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
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-holidaze-gray mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
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
              <Link
                to="/login/user"
                className="text-black font-medium hover:underline">
                Sign in here
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-holidaze-border text-center">
              <Link
                to="/register/venue-manager"
                className="text-sm text-holidaze-light-gray hover:text-holidaze-gray transition-colors">
                Are you a venue manager? Register here
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserRegister;
