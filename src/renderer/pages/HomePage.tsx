import React from 'react';
import { motion } from 'framer-motion';
import ContentRow from '../components/content/ContentRow';
import HeroSection from '../components/content/HeroSection';

const HomePage: React.FC = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Content Rows */}
          <div className="space-y-12">
            <ContentRow
              title="Trending Movies"
              type="movie"
              category="trending"
            />
            
            <ContentRow
              title="Popular Movies"
              type="movie"
              category="popular"
            />
            
            <ContentRow
              title="Trending TV Shows"
              type="tv"
              category="trending"
            />
            
            <ContentRow
              title="Popular TV Shows"
              type="tv"
              category="popular"
            />
            
            {/* <ContentRow
              title="Recently Downloaded"
              type="mixed"
              category="downloaded"
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
