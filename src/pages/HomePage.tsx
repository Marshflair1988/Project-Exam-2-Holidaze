import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import SearchBar from '../components/SearchBar';
import FeaturedVenues from '../components/FeaturedVenues';
import WhyChoose from '../components/WhyChoose';
import JoinSection from '../components/JoinSection';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 w-full">
        <HeroSection />
        <SearchBar />
        <FeaturedVenues />
        <WhyChoose />
        <JoinSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
