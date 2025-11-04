import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import VenueManagerLogin from './pages/VenueManagerLogin';
import VenueManagerRegister from './pages/VenueManagerRegister';
import VenueDetails from './pages/VenueDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/user" element={<UserLogin />} />
        <Route path="/register/user" element={<UserRegister />} />
        <Route path="/login/venue-manager" element={<VenueManagerLogin />} />
        <Route
          path="/register/venue-manager"
          element={<VenueManagerRegister />}
        />
        <Route path="/venue/:id" element={<VenueDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
