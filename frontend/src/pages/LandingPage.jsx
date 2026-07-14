import React, { useState } from 'react';
import Preloader from '../components/Preloader';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import TimelineSection from '../components/TimelineSection';
import CollaborationShowcase from '../components/CollaborationShowcase';
import PricingSection from '../components/PricingSection';
import FaqSection from '../components/FaqSection';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Preloader onComplete={() => setLoading(false)} />
      {!loading && (
        <div className="bg-brand-light dark:bg-brand-dark min-h-screen transition-colors duration-300">
          <Navbar />
          <HeroSection />
          <AboutSection />
          <TimelineSection />
          <CollaborationShowcase />
          <PricingSection />
          <FaqSection />
          <Footer />
        </div>
      )}
    </>
  );
};

export default LandingPage;
