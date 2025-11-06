import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authApi, setAccessToken, setUserData } from '../services/api';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full flex items-center justify-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="w-full max-w-[450px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-holidaze-gray m-0 tracking-tight">
              User Login
            </h1>
            <p className="text-base text-holidaze-light-gray mt-2 sm:mt-3">
              Sign in to your account to browse and book venues
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

            <div className="mb-6">
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
              <Link
                to="/register/user"
                className="text-black font-medium hover:underline">
                Sign up here
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-holidaze-border text-center">
              <Link
                to="/login/venue-manager"
                className="text-sm text-holidaze-light-gray hover:text-holidaze-gray transition-colors">
                Are you a venue manager? Sign in here
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserLogin;
