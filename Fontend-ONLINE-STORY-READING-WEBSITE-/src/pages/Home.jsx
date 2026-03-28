import React from 'react';
import { HeroSection } from '@/components/hero-section';
import { CategoryGrid } from '@/components/category-grid';
import { PopularStories } from '@/components/popular-stories';
import { LatestUpdates } from '@/components/latest-updates';
import { RankingSection } from '@/components/ranking-section';

const Home = () => {
    return (
        <div className="flex flex-col">
            <HeroSection />
            <CategoryGrid />
            <PopularStories />
            <RankingSection />
            <LatestUpdates />
        </div>
    );
};

export default Home;
