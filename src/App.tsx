import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import VenueManagerLogin from './pages/VenueManagerLogin';
import VenueManagerRegister from './pages/VenueManagerRegister';
import VenueDetails from './pages/VenueDetails';
import VenueManagerDashboard from './pages/VenueManagerDashboard';
import UserProfile from './pages/UserProfile';
import VenueList from './pages/VenueList';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/user" element={<UserLogin />} />
        <Route path="/register/user" element={<UserRegister />} />
        <Route path="/login/venue-manager" element={<VenueManagerLogin />} />
        <Route
          path="/register/venue-manager"
          element={<VenueManagerRegister />}
        />
        <Route path="/venues" element={<VenueList />} />
        <Route path="/venue/:id" element={<VenueDetails />} />
        <Route
          path="/venue-manager/dashboard"
          element={<VenueManagerDashboard />}
        />
        <Route path="/user/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
