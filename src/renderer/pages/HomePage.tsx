import React from 'react';
import HeroSection from '../components/content/HeroSection';
import ContentRow from '../components/content/ContentRow';
import GenreContentRow from '../components/content/GenreContentRow';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Featured Content */}
      <HeroSection />
      
      {/* Content Rows */}
      <div className="space-y-8 py-8">
        {/* Trending Movies */}
        <ContentRow
          title="Trending Movies"
          type="movie"
          category="trending"
        />
        
        {/* Popular Movies */}
        <ContentRow
          title="Popular Movies"
          type="movie"
          category="popular"
        />
        
        {/* Trending TV Shows */}
        <ContentRow
          title="Trending TV Shows"
          type="tv"
          category="trending"
        />
        
        {/* Popular TV Shows */}
        <ContentRow
          title="Popular TV Shows"
          type="tv"
          category="popular"
        />
        
        {/* Mixed Trending Content */}
        <ContentRow
          title="Trending Now"
          type="mixed"
          category="trending"
        />
        
        {/* Mixed Popular Content */}
        <ContentRow
          title="What's Popular"
          type="mixed"
          category="popular"
        />

        {/* Genre-based Content Rows */}
        <GenreContentRow
          title="Action Movies"
          type="movie"
          genreName="Action"
          genreId={28}
        />

        <GenreContentRow
          title="Comedy Movies"
          type="movie"
          genreName="Comedy"
          genreId={35}
        />

        <GenreContentRow
          title="Drama TV Shows"
          type="tv"
          genreName="Drama"
          genreId={18}
        />

        <GenreContentRow
          title="Sci-Fi & Fantasy"
          type="mixed"
          genreName="Sci-Fi & Fantasy"
          genreId={878}
        />

        <GenreContentRow
          title="Horror Movies"
          type="movie"
          genreName="Horror"
          genreId={27}
        />

        <GenreContentRow
          title="Romance Movies"
          type="movie"
          genreName="Romance"
          genreId={10749}
        />
      </div>
    </div>
  );
};

export default HomePage;
